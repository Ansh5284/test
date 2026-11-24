import type {
  ArtifactCategory,
  ChapterGroup,
  DriveRawItem,
  RevisionArtifact,
  SubjectId,
} from '../types/archive';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

const CATEGORY_FOLDER_PATTERNS = {
  module: /^(modules?|study\s*modules?|icai\s*modules?|textbooks?|notes?|chapters?)$/i,
  revision: /(revision|slides?|infographics?|charts?|diagrams?|visuals?|mind\s*maps?|summary|summaries|flashcards?)/i,
  quiz: /(quiz|quizzes|mcq|mcqs|pop\s*quiz|tests?)/i,
};

const STANDARD_REGEXES: RegExp[] = [
  /\bInd\s*AS\s*\d+[A-Z]?\b/gi,
  /(?<!Ind\s)\bAS\s*\d+\b/gi,
  /\bSQC\s*\d+\b/gi,
  /\bSA\s*\d{3}\b/gi,
  /\bSRE\s*\d{4}\b/gi,
  /\bSAE\s*\d{4}\b/gi,
  /\bSRS\s*\d{4}\b/gi,
  /\bCARO\s*20\d{2}\b/gi,
  /\bSec(?:tion|\.)?\s*\d+[A-Z]*(?:\(\d+\))?\b/gi,
  /\bSchedule\s+[IVX]+\b/gi,
];

/**
 * Strips file extensions and normalizes separators for clean display titles.
 */
export function cleanDisplayTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.[a-zA-Z0-9]{2,5}$/, '');
  return withoutExt.replace(/[_]+/g, ' ').replace(/\s{2,}/g, ' ').trim() || fileName;
}

/**
 * Extracts Accounting / Auditing Standards and statutory sections from a string.
 */
export function extractStandards(text: string): string[] {
  if (!text) return [];
  const found = new Map<string, string>();

  for (const regex of STANDARD_REGEXES) {
    const matches = text.match(regex);
    if (!matches) continue;
    for (const raw of matches) {
      const normalized = raw
        .replace(/\s+/g, ' ')
        .replace(/^ind\s*as/i, 'Ind AS')
        .replace(/^sqc/i, 'SQC')
        .replace(/^sa\s/i, 'SA ')
        .replace(/^sre/i, 'SRE')
        .replace(/^sae/i, 'SAE')
        .replace(/^srs/i, 'SRS')
        .replace(/^caro/i, 'CARO')
        .replace(/^sec(?:tion|\.)?/i, 'Sec')
        .trim();
      const key = normalized.toLowerCase();
      if (!found.has(key)) {
        found.set(key, normalized);
      }
    }
  }

  return Array.from(found.values());
}

/**
 * Classifies a Drive file into module / slides / infographic / quiz_json / other
 * based on MIME type, folder breadcrumb hints, and filename keywords.
 */
export function classifyArtifact(item: Pick<DriveRawItem, 'name' | 'mimeType' | 'pathSegments'>): ArtifactCategory {
  const nameLower = item.name.toLowerCase();
  const mimeLower = (item.mimeType || '').toLowerCase();
  const pathJoined = item.pathSegments.join(' / ').toLowerCase();

  if (
    mimeLower === 'application/json' ||
    nameLower.endsWith('.json') ||
    (CATEGORY_FOLDER_PATTERNS.quiz.test(pathJoined) && nameLower.includes('quiz'))
  ) {
    return 'quiz_json';
  }

  // Image files or explicit chart/infographic keywords
  if (
    mimeLower.startsWith('image/') ||
    /\.(png|jpe?g|webp|svg|avif)$/i.test(nameLower) ||
    /(infographic|chart|mind\s*map|flowchart|diagram|poster|cheat\s*sheet)/i.test(nameLower)
  ) {
    return 'infographic';
  }

  // Presentation MIME types or explicit slide/revision keywords
  if (
    mimeLower.includes('presentation') ||
    mimeLower.includes('powerpoint') ||
    /\.(pptx?|key)$/i.test(nameLower) ||
    /(slide|deck|revision|summary|quick\s*recap|capsule)/i.test(nameLower)
  ) {
    return 'slides';
  }

  // Explicit module keywords in filename
  if (/(module|study\s*mat|textbook|handout|full\s*notes|comprehensive|workbook)/i.test(nameLower)) {
    return 'module';
  }

  // Fall back to parent folder hints (handles both "Modules/..." and "Revision Slides & Infographics/...")
  for (let i = item.pathSegments.length - 1; i >= 0; i--) {
    const seg = item.pathSegments[i];
    if (/(infographic|chart|visual|mind\s*map)/i.test(seg) && !/slide/i.test(seg)) {
      return 'infographic';
    }
    if (CATEGORY_FOLDER_PATTERNS.revision.test(seg)) {
      return 'slides';
    }
    if (CATEGORY_FOLDER_PATTERNS.module.test(seg)) {
      return 'module';
    }
  }

  // PDFs in general subject folders default to module so nothing is lost
  if (mimeLower === 'application/pdf' || nameLower.endsWith('.pdf')) {
    return 'module';
  }

  return 'other';
}

interface ChapterInference {
  chapterKey: string;
  chapterNumber: number | null;
  chapterTitle: string;
}

const CHAPTER_PREFIX_REGEX = /^(?:ch(?:apter)?|unit|mod(?:ule)?|topic|part)\s*[-.:_#]?\s*(\d{1,2})\b[\s\-:._|]*(.*)$/i;
const LEADING_NUM_REGEX = /^(\d{1,2})\s*[-.:)_]\s*(.+)$/;

function stripArtifactSuffixes(text: string): string {
  return text
    .replace(
      /\b(study\s*module|module|revision\s*slides?|slides?|infographics?|charts?|mind\s*maps?|summary|deck|notes|handout|final|v\d+)\b/gi,
      '',
    )
    .replace(/[-–—:|_/]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function slugifyKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'general';
}

/**
 * Infers chapter number and clean chapter title from EITHER:
 * 1) A chapter-specific subfolder (works whether folder tree is Category -> Chapter OR Chapter -> Category)
 * 2) The filename itself (works when Modules/ contains flat chapter PDFs while Revision Slides/ has chapter subfolders!)
 *
 * Crucially, both `Modules/Ch 01 - Ind AS 115 Revenue Module.pdf` and
 * `Revision Slides & Infographics/Chapter 1 - Revenue from Contracts/Ind AS 115 Chart.png`
 * will resolve to the same chapter bucket (`ch-1`), unifying them cleanly chapter-wise!
 */
export function inferChapter(
  fileName: string,
  pathSegments: string[],
  standards: string[],
): ChapterInference {
  // 1. Check folder path segments for a chapter folder (skipping generic category buckets)
  const meaningfulSegments = pathSegments.filter(
    (seg) =>
      seg.trim().length > 0 &&
      !CATEGORY_FOLDER_PATTERNS.module.test(seg.trim()) &&
      !CATEGORY_FOLDER_PATTERNS.revision.test(seg.trim()) &&
      !CATEGORY_FOLDER_PATTERNS.quiz.test(seg.trim()),
  );

  // Inspect deepest meaningful folder first
  for (let i = meaningfulSegments.length - 1; i >= 0; i--) {
    const seg = meaningfulSegments[i].trim();
    const chMatch = seg.match(CHAPTER_PREFIX_REGEX) || seg.match(LEADING_NUM_REGEX);
    if (chMatch) {
      const num = parseInt(chMatch[1], 10);
      const remainder = chMatch[2]?.trim() || `Chapter ${num}`;
      return {
        chapterKey: `ch-${num}`,
        chapterNumber: num,
        chapterTitle: remainder,
      };
    }

    // Folder itself might be named by topic or standard, e.g., "Ind AS 115 Revenue"
    const segStandards = extractStandards(seg);
    if (segStandards.length > 0) {
      return {
        chapterKey: `std-${slugifyKey(segStandards[0])}`,
        chapterNumber: null,
        chapterTitle: seg,
      };
    }

    return {
      chapterKey: `topic-${slugifyKey(seg)}`,
      chapterNumber: null,
      chapterTitle: seg,
    };
  }

  // 2. No chapter subfolder (e.g., flat file directly inside "Modules/" or subject root): parse filename
  const baseName = cleanDisplayTitle(fileName);
  const fileChMatch = baseName.match(CHAPTER_PREFIX_REGEX) || baseName.match(LEADING_NUM_REGEX);
  if (fileChMatch) {
    const num = parseInt(fileChMatch[1], 10);
    const stripped = stripArtifactSuffixes(fileChMatch[2] || '');
    return {
      chapterKey: `ch-${num}`,
      chapterNumber: num,
      chapterTitle: stripped || `Chapter ${num}`,
    };
  }

  // 3. Group by primary standard if present (e.g., "Ind AS 115 Module.pdf" + "Ind AS 115 Slides.pdf")
  if (standards.length > 0) {
    const stripped = stripArtifactSuffixes(baseName);
    return {
      chapterKey: `std-${slugifyKey(standards[0])}`,
      chapterNumber: null,
      chapterTitle: stripped || standards[0],
    };
  }

  // 4. Safe fallback so unknown/newly added files never break the site
  return {
    chapterKey: 'general-resources',
    chapterNumber: null,
    chapterTitle: 'General & Miscellaneous Resources',
  };
}

/**
 * Generates Google Drive's view-only preview embed URL (no file size limit, streams server-side).
 */
export function buildDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
}

/**
 * Normalizes a flat list of recursive Google Drive items from ANY subject folder structure
 * into resilient, cleanly sorted chapter groups + separated JSON quiz files.
 */
export function normalizeDriveTreeToChapters(
  subjectId: SubjectId,
  rawItems: DriveRawItem[],
  source: 'drive_public' | 'drive_oauth' | 'demo',
): { chapters: ChapterGroup[]; quizFiles: RevisionArtifact[] } {
  const chapterMap = new Map<string, ChapterGroup>();
  const quizFiles: RevisionArtifact[] = [];

  for (const item of rawItems) {
    if (!item || !item.id || !item.name) continue;
    if (item.mimeType === FOLDER_MIME) continue;

    const category = classifyArtifact(item);
    const combinedText = [...item.pathSegments, item.name].join(' ');
    const standards = extractStandards(combinedText);
    const inferred = inferChapter(item.name, item.pathSegments, standards);

    const artifact: RevisionArtifact = {
      id: item.id,
      subjectId,
      title: cleanDisplayTitle(item.name),
      rawFileName: item.name,
      category,
      mimeType: item.mimeType || 'application/octet-stream',
      chapterKey: inferred.chapterKey,
      chapterNumber: inferred.chapterNumber,
      chapterTitle: inferred.chapterTitle,
      standards,
      folderBreadcrumb: item.pathSegments,
      sizeBytes: item.size ? Number(item.size) || null : null,
      modifiedTime: item.modifiedTime,
      drivePreviewUrl: source === 'demo' ? null : buildDrivePreviewUrl(item.id),
      source,
    };

    if (category === 'quiz_json') {
      quizFiles.push(artifact);
      continue;
    }

    // Merge into existing chapter if matching chapterKey OR matching primary standard
    let targetKey = inferred.chapterKey;
    if (!chapterMap.has(targetKey) && standards.length > 0) {
      const primaryStdLower = standards[0].toLowerCase();
      for (const [existingKey, existingGroup] of chapterMap.entries()) {
        if (existingGroup.standards.some((s) => s.toLowerCase() === primaryStdLower)) {
          targetKey = existingKey;
          artifact.chapterKey = existingKey;
          artifact.chapterNumber = existingGroup.chapterNumber;
          artifact.chapterTitle = existingGroup.title;
          break;
        }
      }
    }

    let group = chapterMap.get(targetKey);
    if (!group) {
      group = {
        chapterKey: targetKey,
        chapterNumber: inferred.chapterNumber,
        title: inferred.chapterTitle,
        subjectId,
        standards: [...standards],
        modules: [],
        revisionVisuals: [],
        otherFiles: [],
        allArtifacts: [],
      };
      chapterMap.set(targetKey, group);
    } else {
      // Prefer a richer chapter title over generic "Chapter 1"
      if (
        /^chapter\s+\d+$/i.test(group.title) &&
        !/^chapter\s+\d+$/i.test(inferred.chapterTitle) &&
        inferred.chapterTitle.length > group.title.length
      ) {
        group.title = inferred.chapterTitle;
      }
      if (group.chapterNumber === null && inferred.chapterNumber !== null) {
        group.chapterNumber = inferred.chapterNumber;
      }
      for (const std of standards) {
        if (!group.standards.some((s) => s.toLowerCase() === std.toLowerCase())) {
          group.standards.push(std);
        }
      }
    }

    if (category === 'module') {
      group.modules.push(artifact);
    } else if (category === 'slides' || category === 'infographic') {
      group.revisionVisuals.push(artifact);
    } else {
      group.otherFiles.push(artifact);
    }
    group.allArtifacts.push(artifact);
  }

  // Sort chapters deterministically: numbered chapters ascending first, then alphabetical, general last
  const chapters = Array.from(chapterMap.values()).sort((a, b) => {
    if (a.chapterKey === 'general-resources') return 1;
    if (b.chapterKey === 'general-resources') return -1;
    if (a.chapterNumber !== null && b.chapterNumber !== null) {
      return a.chapterNumber - b.chapterNumber;
    }
    if (a.chapterNumber !== null) return -1;
    if (b.chapterNumber !== null) return 1;
    return a.title.localeCompare(b.title);
  });

  // Sort files within each chapter consistently
  for (const ch of chapters) {
    ch.modules.sort((a, b) => a.title.localeCompare(b.title));
    ch.revisionVisuals.sort((a, b) => a.title.localeCompare(b.title));
    ch.otherFiles.sort((a, b) => a.title.localeCompare(b.title));
    ch.allArtifacts = [...ch.modules, ...ch.revisionVisuals, ...ch.otherFiles];
  }

  return { chapters, quizFiles };
}
