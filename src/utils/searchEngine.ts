import type {
  RevisionArtifact,
  SearchResultGroup,
  SubjectArchive,
  SubjectId,
} from '../types/archive';

export type ArtifactFilterMode = 'all' | 'module' | 'visuals';

export interface SearchOptions {
  subjectFilter?: SubjectId | 'all';
  artifactFilter?: ArtifactFilterMode;
}

function normalizeQuery(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchesArtifactFilter(artifact: RevisionArtifact, filter: ArtifactFilterMode): boolean {
  if (filter === 'all') return true;
  if (filter === 'module') return artifact.category === 'module';
  return artifact.category === 'slides' || artifact.category === 'infographic';
}

function tokensMatch(haystack: string, tokens: string[]): boolean {
  const norm = normalizeQuery(haystack);
  return tokens.every((token) => norm.includes(token));
}

/**
 * Smart CA Final Revision Search Engine:
 * - Matches by file name, chapter name/number, standard/section code (Ind AS, SA, SQC, Sec), or subject.
 * - Whenever ANY file in a chapter matches by name (or chapter/standard matches),
 *   ALL sibling artifacts in that same chapter are surfaced alongside it as `relatedChapterArtifacts`
 *   so students immediately see companion modules, slides, and infographics.
 */
export function searchArchives(
  archives: SubjectArchive[],
  rawQuery: string,
  options: SearchOptions = {},
): SearchResultGroup[] {
  const cleaned = normalizeQuery(rawQuery);
  if (!cleaned) return [];

  const tokens = cleaned.split(' ').filter(Boolean);
  const subjectFilter = options.subjectFilter ?? 'all';
  const artifactFilter = options.artifactFilter ?? 'all';

  const results: SearchResultGroup[] = [];

  for (const archive of archives) {
    if (subjectFilter !== 'all' && archive.meta.id !== subjectFilter) {
      continue;
    }

    const subjectHaystack = `${archive.meta.name} ${archive.meta.shortName} ${archive.meta.paperCode}`;

    for (const chapter of archive.chapters) {
      const visibleArtifacts = chapter.allArtifacts.filter((a) =>
        matchesArtifactFilter(a, artifactFilter),
      );
      if (visibleArtifacts.length === 0) continue;

      const chapterLabel = chapter.chapterNumber
        ? `Chapter ${chapter.chapterNumber} ${chapter.title}`
        : chapter.title;
      const standardsJoined = chapter.standards.join(' ');

      const chapterMatches = tokensMatch(`${chapterLabel} ${subjectHaystack}`, tokens);
      const standardMatches =
        standardsJoined.length > 0 && tokensMatch(`${standardsJoined} ${subjectHaystack}`, tokens);

      const matchedArtifacts: RevisionArtifact[] = [];
      const matchReasons = new Set<string>();
      let score = 0;

      for (const artifact of visibleArtifacts) {
        const fileHaystack = `${artifact.title} ${artifact.rawFileName} ${artifact.standards.join(' ')} ${artifact.folderBreadcrumb.join(' ')}`;
        const exactFileTitleMatch = normalizeQuery(artifact.title).includes(cleaned);
        const tokenFileMatch = tokensMatch(`${fileHaystack} ${subjectHaystack}`, tokens);

        if (exactFileTitleMatch || tokenFileMatch) {
          matchedArtifacts.push(artifact);
          score += exactFileTitleMatch ? 120 : 80;
          matchReasons.add('Matched file name');
        }
      }

      if (standardMatches) {
        score += 100;
        matchReasons.add(`Matched standard (${chapter.standards.join(', ')})`);
      }

      if (chapterMatches) {
        score += 90;
        matchReasons.add('Matched chapter title');
      }

      if (matchedArtifacts.length === 0 && !chapterMatches && !standardMatches) {
        continue;
      }

      // If matched by chapter or standard without a single file-name hit, promote all visible artifacts in the chapter
      const primaryMatches = matchedArtifacts.length > 0 ? matchedArtifacts : visibleArtifacts;
      const matchedIds = new Set(primaryMatches.map((a) => a.id));

      // CRITICAL REQUIREMENT: Always include all sibling files from the same chapter!
      const relatedChapterArtifacts = chapter.allArtifacts.filter((a) => !matchedIds.has(a.id));

      results.push({
        subjectId: archive.meta.id,
        subjectName: archive.meta.name,
        subjectShortName: archive.meta.shortName,
        chapter,
        matchedArtifacts: primaryMatches,
        relatedChapterArtifacts,
        matchReasons: Array.from(matchReasons),
        relevanceScore: score,
      });
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
