import { DRIVE_CONFIG, SUBJECTS, hasPublicDriveConfiguration } from '../config/driveConfig';
import type {
  DriveRawItem,
  McqQuiz,
  RevisionArtifact,
  SubjectArchive,
  SubjectId,
} from '../types/archive';
import { normalizeDriveTreeToChapters } from '../utils/driveNormalizer';
import { parseQuizJson } from '../utils/quizEngine';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const MAX_RECURSION_DEPTH = 6;

interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  size?: string;
  modifiedTime?: string;
}

interface DriveAuthContext {
  mode: 'drive_public' | 'drive_oauth';
  apiKey?: string;
  accessToken?: string;
}

async function driveFetchJson(
  url: string,
  authCtx: DriveAuthContext,
): Promise<{ files?: DriveApiFile[]; nextPageToken?: string }> {
  const fullUrl =
    authCtx.mode === 'drive_public' && authCtx.apiKey
      ? `${url}${url.includes('?') ? '&' : '?'}key=${encodeURIComponent(authCtx.apiKey)}`
      : url;

  const headers: Record<string, string> = {};
  if (authCtx.mode === 'drive_oauth' && authCtx.accessToken) {
    headers.Authorization = `Bearer ${authCtx.accessToken}`;
  }

  const res = await fetch(fullUrl, { headers });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Google Drive API error (${res.status}): ${errText.slice(0, 180)}`);
  }
  return (await res.json()) as { files?: DriveApiFile[]; nextPageToken?: string };
}

/**
 * Lists ALL direct children inside a Drive folder with automatic pagination.
 */
async function listFolderChildren(
  folderId: string,
  authCtx: DriveAuthContext,
): Promise<DriveApiFile[]> {
  const all: DriveApiFile[] = [];
  let pageToken: string | undefined;

  do {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const fields = encodeURIComponent(
      'nextPageToken,files(id,name,mimeType,parents,size,modifiedTime)',
    );
    const tokenPart = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
    const url = `${DRIVE_API_BASE}?q=${q}&fields=${fields}&pageSize=1000&includeItemsFromAllDrives=true&supportsAllDrives=true${tokenPart}`;

    const data = await driveFetchJson(url, authCtx);
    if (Array.isArray(data.files)) {
      all.push(...data.files);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return all;
}

/**
 * Recursively walks a subject folder up to MAX_RECURSION_DEPTH levels deep.
 * Tolerates arbitrary nesting (Category->Chapter, Chapter->Category, or flat).
 */
async function walkSubjectFolder(
  folderId: string,
  authCtx: DriveAuthContext,
  pathSegments: string[] = [],
  depth = 0,
): Promise<DriveRawItem[]> {
  if (depth > MAX_RECURSION_DEPTH) return [];
  const children = await listFolderChildren(folderId, authCtx);
  const collected: DriveRawItem[] = [];
  const subfolders: DriveApiFile[] = [];

  for (const child of children) {
    if (child.mimeType === FOLDER_MIME) {
      subfolders.push(child);
    } else {
      collected.push({
        id: child.id,
        name: child.name,
        mimeType: child.mimeType,
        parents: child.parents,
        size: child.size,
        modifiedTime: child.modifiedTime,
        pathSegments,
      });
    }
  }

  // Walk child folders concurrently in small batches for fast sync
  const nestedResults = await Promise.all(
    subfolders.map((sub) =>
      walkSubjectFolder(sub.id, authCtx, [...pathSegments, sub.name], depth + 1),
    ),
  );
  for (const nested of nestedResults) {
    collected.push(...nested);
  }

  return collected;
}

/**
 * Matches Drive folder names to our 5 CA Final subjects automatically
 * (used when a single root folder is provided or when owner signs in with OAuth).
 */
async function discoverSubjectFolderIds(
  authCtx: DriveAuthContext,
): Promise<Record<SubjectId, string>> {
  const resolved: Record<SubjectId, string> = { ...DRIVE_CONFIG.subjectFolderIds };

  const missingSubjects = SUBJECTS.filter((s) => !resolved[s.id]?.trim());
  if (missingSubjects.length === 0) return resolved;

  let candidateFolders: DriveApiFile[] = [];

  if (DRIVE_CONFIG.rootFolderId.trim()) {
    const children = await listFolderChildren(DRIVE_CONFIG.rootFolderId.trim(), authCtx);
    candidateFolders = children.filter((f) => f.mimeType === FOLDER_MIME);
  } else if (authCtx.mode === 'drive_oauth') {
    const q = encodeURIComponent(`mimeType = '${FOLDER_MIME}' and trashed = false`);
    const fields = encodeURIComponent('files(id,name,mimeType)');
    const data = await driveFetchJson(
      `${DRIVE_API_BASE}?q=${q}&fields=${fields}&pageSize=200`,
      authCtx,
    );
    candidateFolders = data.files || [];
  }

  for (const subject of missingSubjects) {
    const match = candidateFolders.find((folder) => {
      const lower = folder.name.toLowerCase().trim();
      return subject.driveFolderMatchNames.some(
        (alias) => lower === alias || lower.includes(alias),
      );
    });
    if (match) {
      resolved[subject.id] = match.id;
    }
  }

  return resolved;
}

/**
 * Fetches all 5 CA Final subject archives from Google Drive (via public API key OR signed-in OAuth).
 */
export async function fetchDriveArchives(options: {
  accessToken?: string | null;
}): Promise<SubjectArchive[] | null> {
  let authCtx: DriveAuthContext | null = null;

  if (options.accessToken) {
    authCtx = { mode: 'drive_oauth', accessToken: options.accessToken };
  } else if (hasPublicDriveConfiguration()) {
    authCtx = { mode: 'drive_public', apiKey: DRIVE_CONFIG.apiKey.trim() };
  }

  if (!authCtx) return null;

  const folderIds = await discoverSubjectFolderIds(authCtx);
  const syncedAt = new Date().toISOString();

  const archives = await Promise.all(
    SUBJECTS.map(async (meta): Promise<SubjectArchive> => {
      const folderId = folderIds[meta.id]?.trim() || null;
      if (!folderId) {
        return {
          meta,
          folderId: null,
          chapters: [],
          quizFiles: [],
          totalArtifacts: 0,
          readiness: 'upcoming',
          source: authCtx!.mode,
          lastSyncedAt: syncedAt,
        };
      }

      const rawItems = await walkSubjectFolder(folderId, authCtx!);
      const { chapters, quizFiles } = normalizeDriveTreeToChapters(
        meta.id,
        rawItems,
        authCtx!.mode,
      );
      const totalArtifacts = chapters.reduce((sum, ch) => sum + ch.allArtifacts.length, 0);

      const readiness =
        totalArtifacts >= 4
          ? 'complete'
          : totalArtifacts > 0
            ? 'in_progress'
            : 'upcoming';

      return {
        meta,
        folderId,
        chapters,
        quizFiles,
        totalArtifacts,
        readiness,
        source: authCtx!.mode,
        lastSyncedAt: syncedAt,
      };
    }),
  );

  return archives;
}

/**
 * Fetches and parses live MCQ Quiz JSON files discovered in Google Drive subject folders.
 */
export async function fetchDriveQuizzes(
  quizArtifacts: RevisionArtifact[],
  options: { accessToken?: string | null },
): Promise<McqQuiz[]> {
  if (quizArtifacts.length === 0) return [];
  const quizzes: McqQuiz[] = [];

  for (const file of quizArtifacts.slice(0, 12)) {
    try {
      const headers: Record<string, string> = {};
      let url = `${DRIVE_API_BASE}/${encodeURIComponent(file.id)}?alt=media`;

      if (options.accessToken) {
        headers.Authorization = `Bearer ${options.accessToken}`;
      } else if (DRIVE_CONFIG.apiKey.trim()) {
        url += `&key=${encodeURIComponent(DRIVE_CONFIG.apiKey.trim())}`;
      } else {
        continue;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) continue;
      const text = await res.text();
      const parsed = parseQuizJson(text, `Drive · ${file.rawFileName}`);
      if (parsed) {
        quizzes.push(parsed);
      }
    } catch {
      // Skip malformed or unreadable JSON quiz files safely without breaking the app
    }
  }

  return quizzes;
}
