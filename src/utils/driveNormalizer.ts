import type {
  ArtifactCategory,
  ChapterGroup,
  ChapterSectionKind,
  DriveRawItem,
  RevisionArtifact,
  SubjectId,
} from '../types/archive';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

// Matches numeric/alpha ordering prefixes such as "0. Modules", "1. Modules", "2. ICAI Suggested Answers", "z. Practice Questions"
const ORDER_PREFIX_REGEX = /^(?:(?:\d{1,2}|[a-zA-Z])\s*[.):]\s+)(.+)$/;

// Matches dated test folders such as "04-10-2026", "9-9-2026", "2026-10-04", "04.10.2026"
const DATE_FOLDER_REGEX = /^(?:\d{1,2}[-./]\d{1,2}[-./]\d{2,4}|\d{4}[-./]\d{1,2}[-./]\d{1,2})$/;

// Matches explicit chapter folders or filenames ("Chapter 1. Quality Control", "Ch 02 - Leases", "Chapter 10 Accounts...")
const CHAPTER_PREFIX_REGEX =
  /^(?:ch(?:apter)?|unit|mod(?:ule)?|topic)\s*[-.:_#]?\s*(\d{1,2})\b[\s\-:._|]*(.*)$/i;

// Matches bare numbered chapter names ("01 - Revenue", "1. Quality Control") — NEVER dates
const LEADING_NUM_REGEX = /^(\d{1,2})\s*[-.:)_]\s+(.+)$/;

const SUGGESTED_ANSWERS_REGEX = /(?:icai\s*)?suggested\s*answers?/i;
const PRACTICE_QUESTIONS_REGEX =
  /^(?:practice\s*(?:questions?|tests?|q\s*&?\s*a|papers?)|mock\s*tests?|test\s*series|question\s*bank)$/i;
const MODULE_WRAPPER_REGEX =
  /^(?:modules?(?:\s+part\s+[a-z0-9]+)?|study\s*modules?|icai\s*modules?|textbooks?|bare\s*standards?|notes?|handouts?|study\s*material)$/i;
const REVISION_WRAPPER_REGEX =
  /^(?:revisions?(?:\s+slides?(?:\s*(?:&|and)\s*(?:infographics?|charts?))?)?|revision\s*slides?|slides?(?:\s*decks?)?|infographics?|charts?|diagrams?|visuals?|mind\s*maps?|summary|summaries|flashcards?)$/i;
const QUIZ_WRAPPER_REGEX = /^(?:quiz|quizzes|mcq|mcqs|pop\s*quiz|daily\s*quiz|weekly\s*quiz)$/i;

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

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'of',
  'on',
  'or',
  'the',
  'to',
  'under',
  'with',
  'accounting',
  'disclosures',
  'disclosure',
  'procedure',
  'procedures',
  'chapter',
  'module',
  'modules',
  'revision',
  'revisions',
  'notes',
  'slides',
  'slide',
  'deck',
  'infographic',
  'infographics',
  'chart',
  'charts',
  'summary',
  'final',
  'ca',
  'ind',
  'gst',
  'tax',
  'expenses',
  'expense',
]);

/**
 * Strips leading folder ordering prefixes like "0. ", "1. ", "3. ", "z. "
 * WITHOUT stripping "Chapter 1" or "Ind AS 1".
 */
export function stripLeadingOrderPrefix(segment: string): string {
  const trimmed = segment.trim();
  if (/^(?:chapter|ch|ind\s*as|sa|sqc|sre|sae|srs|part)\b/i.test(trimmed)) {
    return trimmed;
  }
  if (DATE_FOLDER_REGEX.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(ORDER_PREFIX_REGEX);
  return match ? match[1].trim() : trimmed;
}

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
 * Extracts the primary numeric Ind AS number if present (for true numerical Ind AS sorting).
 */
function extractPrimaryIndAsNumber(text: string): number | null {
  const match = text.match(/\bInd\s*AS\s*(\d+)\b/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Classifies a Drive file into:
 * module | slides | infographic | practice_qa | suggested_answers | quiz_json | other
 */
export function classifyArtifact(
  item: Pick<DriveRawItem, 'name' | 'mimeType' | 'pathSegments'>,
): ArtifactCategory {
  const nameLower = item.name.toLowerCase();
  const mimeLower = (item.mimeType || '').toLowerCase();
  const strippedSegments = item.pathSegments.map(stripLeadingOrderPrefix);
  const pathJoined = strippedSegments.join(' / ').toLowerCase();

  // 1. JSON MCQ Quiz files
  if (
    mimeLower === 'application/json' ||
    nameLower.endsWith('.json') ||
    (strippedSegments.some((s) => QUIZ_WRAPPER_REGEX.test(s)) && nameLower.includes('quiz'))
  ) {
    return 'quiz_json';
  }

  // 2. Suggested Answers folder
  if (strippedSegments.some((s) => SUGGESTED_ANSWERS_REGEX.test(s))) {
    return 'suggested_answers';
  }

  // 3. Practice Questions / Dated test folders
  if (
    strippedSegments.some(
      (s) => PRACTICE_QUESTIONS_REGEX.test(s) || DATE_FOLDER_REGEX.test(s.trim()),
    ) ||
    /(?:practice\s*(?:test|question|q&a|paper)|mock\s*test|evaluation\s*report)/i.test(nameLower)
  ) {
    return 'practice_qa';
  }

  // 4. Image files or explicit chart/infographic keywords
  if (
    mimeLower.startsWith('image/') ||
    /\.(png|jpe?g|webp|svg|avif)$/i.test(nameLower) ||
    /(infographic|chart|mind\s*map|flowchart|diagram|poster|cheat\s*sheet)/i.test(nameLower)
  ) {
    return 'infographic';
  }

  // 5. Presentation files or explicit slide deck keywords
  if (
    mimeLower.includes('presentation') ||
    mimeLower.includes('powerpoint') ||
    /\.(pptx?|key)$/i.test(nameLower) ||
    /(slide|deck|quick\s*recap|capsule|flashcard)/i.test(nameLower)
  ) {
    return 'slides';
  }

  // 6. Explicit module / bare standards / notes keywords in filename or immediate parent folders
  if (
    /(module|study\s*mat|textbook|handout|full\s*notes|comprehensive|workbook|bare\s*standard)/i.test(
      nameLower,
    )
  ) {
    return 'module';
  }

  // Inspect folder path from innermost to outermost
  for (let i = strippedSegments.length - 1; i >= 0; i--) {
    const seg = strippedSegments[i];
    if (/^(?:bare\s*standards?|notes?|handouts?)$/i.test(seg)) {
      return 'module';
    }
    if (/(infographic|chart|visual|mind\s*map)/i.test(seg) && !/slide/i.test(seg)) {
      return 'infographic';
    }
    if (REVISION_WRAPPER_REGEX.test(seg)) {
      // PDFs placed inside Revisions/ folders (e.g. NotebookLM slide decks) belong to Slide decks
      // unless explicitly marked as notes/modules above
      return 'slides';
    }
    if (MODULE_WRAPPER_REGEX.test(seg)) {
      return 'module';
    }
  }

  // Check if anywhere in path mentions revisions (for nested topic folders inside 3. Revisions/Topic)
  if (/\brevisions?\b/i.test(pathJoined)) {
    if (/\bnotes?\b/i.test(nameLower)) return 'module';
    return 'slides';
  }

  // PDFs & Docs in general chapter folders default to module so nothing is lost
  if (
    mimeLower === 'application/pdf' ||
    mimeLower.includes('document') ||
    /\.(pdf|docx?)$/i.test(nameLower)
  ) {
    return 'module';
  }

  return 'other';
}

interface ChapterInference {
  chapterKey: string;
  chapterNumber: number | null;
  chapterTitle: string;
  sectionKind: ChapterSectionKind;
  partLabel: string | null;
  subTopic: string | null;
}

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
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'general'
  );
}

function detectPartInfo(
  strippedSegments: string[],
  subjectId: SubjectId,
): { partKeyPrefix: string; partLabel: string | null } {
  for (const seg of strippedSegments) {
    if (/\bpart\s*a\b/i.test(seg)) {
      return {
        partKeyPrefix: 'part-a-',
        partLabel: subjectId === 'idt' ? 'Part A · GST' : 'Part A',
      };
    }
    if (/\bpart\s*b\b/i.test(seg)) {
      return {
        partKeyPrefix: 'part-b-',
        partLabel: subjectId === 'idt' ? 'Part B · Customs' : 'Part B',
      };
    }
  }
  return { partKeyPrefix: '', partLabel: null };
}

/**
 * Infers unified chapter metadata from ANY Drive hierarchy:
 * - Dedicated Exam sections: "2. ICAI Suggested Answers", "1. Suggested Answers", "4. Practice Questions", "z. Practice Questions", dated folders "04-10-2026"
 * - Chapter-ancestor-first: "Chapter 2. General Auditing Principles.../SA 240/file.pdf" stays in Chapter 2 with subTopic="SA 240"
 * - Part-aware chapters: "0. Modules Part A/Chapter 1 Supply..." vs "0. Modules Part B/Chapter 1 Levy..." stay distinct!
 * - Topic folders inside "3. Revisions/<Topic>" or "Revisions/<Topic>" (later unified with matching Modules in post-pass!)
 * - Flat Ind AS / Chapter PDFs inside "1. Modules/", "0. Modules/", "Modules/"
 */
export function inferChapter(
  fileName: string,
  pathSegments: string[],
  standards: string[],
  subjectId: SubjectId,
): ChapterInference {
  const strippedSegments = pathSegments.map(stripLeadingOrderPrefix).filter(Boolean);
  const { partKeyPrefix, partLabel } = detectPartInfo(strippedSegments, subjectId);

  // 1. Dedicated ICAI Suggested Answers section
  if (strippedSegments.some((seg) => SUGGESTED_ANSWERS_REGEX.test(seg))) {
    return {
      chapterKey: 'section-suggested-answers',
      chapterNumber: null,
      chapterTitle: 'ICAI Suggested Answers',
      sectionKind: 'suggested_answers',
      partLabel: null,
      subTopic: null,
    };
  }

  // 2. Dedicated Practice Questions & Dated Test Folders section
  const dateSeg = strippedSegments.find((seg) => DATE_FOLDER_REGEX.test(seg.trim()));
  if (
    strippedSegments.some((seg) => PRACTICE_QUESTIONS_REGEX.test(seg)) ||
    Boolean(dateSeg)
  ) {
    return {
      chapterKey: 'section-practice-questions',
      chapterNumber: null,
      chapterTitle: 'Practice Questions & Tests',
      sectionKind: 'practice_questions',
      partLabel: null,
      subTopic: dateSeg || null,
    };
  }

  // 3. CHAPTER-ANCESTOR-FIRST: If ANY folder segment explicitly starts with "Chapter <N>" (or Unit/Topic <N>),
  // ALWAYS anchor to the OUTERMOST chapter folder and treat deeper folders (SA 240, Bare Standards, Notes) as subTopic!
  for (let i = 0; i < strippedSegments.length; i++) {
    const seg = strippedSegments[i];
    if (MODULE_WRAPPER_REGEX.test(seg) || REVISION_WRAPPER_REGEX.test(seg) || QUIZ_WRAPPER_REGEX.test(seg)) {
      continue;
    }
    const chMatch = seg.match(CHAPTER_PREFIX_REGEX);
    if (chMatch) {
      const num = parseInt(chMatch[1], 10);
      const remainder = chMatch[2]?.replace(/^[.\-:\s]+/, '').trim() || `Chapter ${num}`;
      const deeperSegments = strippedSegments
        .slice(i + 1)
        .filter((s) => !MODULE_WRAPPER_REGEX.test(s) && !REVISION_WRAPPER_REGEX.test(s));
      const subTopic =
        deeperSegments.length > 0
          ? deeperSegments.join(' · ')
          : strippedSegments
              .slice(i + 1)
              .find((s) => /^(?:bare\s*standards?|notes?)$/i.test(s)) || null;

      return {
        chapterKey: `${partKeyPrefix}ch-${num}`,
        chapterNumber: num,
        chapterTitle: remainder,
        sectionKind: 'chapter',
        partLabel,
        subTopic,
      };
    }
  }

  // 4. Filter out generic category wrapper folders (0. Modules, 3. Revisions, Modules Part A, Slides, Infographics, etc.)
  const meaningfulSegments = strippedSegments.filter(
    (seg) =>
      !MODULE_WRAPPER_REGEX.test(seg) &&
      !REVISION_WRAPPER_REGEX.test(seg) &&
      !QUIZ_WRAPPER_REGEX.test(seg) &&
      !DATE_FOLDER_REGEX.test(seg),
  );

  // If there is a meaningful topic folder (e.g., "3. Revisions / Business Combinations" or "Revisions / Accounts and Records"),
  // anchor to the FIRST (outermost) topic folder and preserve any deeper subfolder as subTopic!
  if (meaningfulSegments.length > 0) {
    const topSeg = meaningfulSegments[0];
    const deeperSub = meaningfulSegments.slice(1).join(' · ') || null;

    const numMatch = topSeg.match(LEADING_NUM_REGEX);
    if (numMatch && !DATE_FOLDER_REGEX.test(topSeg)) {
      const num = parseInt(numMatch[1], 10);
      const remainder = numMatch[2]?.trim() || `Chapter ${num}`;
      return {
        chapterKey: `${partKeyPrefix}ch-${num}`,
        chapterNumber: num,
        chapterTitle: remainder,
        sectionKind: 'chapter',
        partLabel,
        subTopic: deeperSub,
      };
    }

    const segStandards = extractStandards(topSeg);
    if (segStandards.length > 0) {
      return {
        chapterKey: `${partKeyPrefix}std-${slugifyKey(segStandards[0])}`,
        chapterNumber: null,
        chapterTitle: topSeg,
        sectionKind: 'chapter',
        partLabel,
        subTopic: deeperSub,
      };
    }

    return {
      chapterKey: `${partKeyPrefix}topic-${slugifyKey(topSeg)}`,
      chapterNumber: null,
      chapterTitle: topSeg,
      sectionKind: 'chapter',
      partLabel,
      subTopic: deeperSub,
    };
  }

  // 5. Flat file inside a category wrapper folder ("1. Modules/", "0. Modules Part A/", "Modules/") or Subject root
  const baseName = cleanDisplayTitle(fileName);

  // 5a. Explicit "Chapter <N> <Title>" in filename
  const fileChMatch = baseName.match(CHAPTER_PREFIX_REGEX);
  if (fileChMatch) {
    const num = parseInt(fileChMatch[1], 10);
    const stripped = stripArtifactSuffixes(fileChMatch[2] || '').replace(/^[.\-:\s]+/, '').trim();
    return {
      chapterKey: `${partKeyPrefix}ch-${num}`,
      chapterNumber: num,
      chapterTitle: stripped || `Chapter ${num}`,
      sectionKind: 'chapter',
      partLabel,
      subTopic: null,
    };
  }

  // 5b. Leading numbered filename ("01 - Revenue")
  const fileLeadNumMatch = !DATE_FOLDER_REGEX.test(baseName)
    ? baseName.match(LEADING_NUM_REGEX)
    : null;
  if (fileLeadNumMatch) {
    const num = parseInt(fileLeadNumMatch[1], 10);
    const stripped = stripArtifactSuffixes(fileLeadNumMatch[2] || '');
    return {
      chapterKey: `${partKeyPrefix}ch-${num}`,
      chapterNumber: num,
      chapterTitle: stripped || `Chapter ${num}`,
      sectionKind: 'chapter',
      partLabel,
      subTopic: null,
    };
  }

  // 5c. Primary standard in filename (e.g., "Ind AS 103 Business Combinations.pdf" -> "Ind AS 103 — Business Combinations")
  if (standards.length > 0) {
    const primaryStd = standards[0];
    const stripped = stripArtifactSuffixes(baseName);
    // Cleanly format "Ind AS 103 Business Combinations" while avoiding duplicate standard prefix
    const titleWithoutStd = stripped
      .replace(new RegExp(`^${primaryStd.replace(/\s+/g, '\\s*')}[\\s\\-–—:]*`, 'i'), '')
      .trim();
    const formattedTitle = titleWithoutStd ? `${primaryStd} — ${titleWithoutStd}` : primaryStd;

    return {
      chapterKey: `${partKeyPrefix}std-${slugifyKey(primaryStd)}`,
      chapterNumber: null,
      chapterTitle: formattedTitle,
      sectionKind: 'chapter',
      partLabel,
      subTopic: null,
    };
  }

  // 5d. Root-level trackers/guides or uncategorized files inside subject root
  if (pathSegments.length === 0) {
    return {
      chapterKey: 'general-resources',
      chapterNumber: null,
      chapterTitle: 'General & Study Trackers',
      sectionKind: 'general',
      partLabel: null,
      subTopic: null,
    };
  }

  // 5e. Flat file inside Modules/ without Chapter or Ind AS number -> own topic so it isn't dumped into General
  if (strippedSegments.some((s) => MODULE_WRAPPER_REGEX.test(s))) {
    const stripped = stripArtifactSuffixes(baseName) || baseName;
    return {
      chapterKey: `${partKeyPrefix}topic-${slugifyKey(stripped)}`,
      chapterNumber: null,
      chapterTitle: stripped,
      sectionKind: 'chapter',
      partLabel,
      subTopic: null,
    };
  }

  return {
    chapterKey: 'general-resources',
    chapterNumber: null,
    chapterTitle: 'General & Study Trackers',
    sectionKind: 'general',
    partLabel: null,
    subTopic: null,
  };
}

/**
 * Canonicalizes a chapter/folder title into domain-normalized tokens for cross-folder matching
 * (e.g., "The Effect of Changes in Forex Rates" <-> "Ind AS 21 The Effects of Changes in Foreign Exchange Rates",
 *  "ECO" <-> "Electronic Commerce Transactions", "Clubbing of Income" <-> "Income of other persons...").
 */
function canonicalizeTopicTokens(title: string): string[] {
  let text = title
    .toLowerCase()
    .replace(/\bind\s*as\s*\d+[a-z]?\b/gi, ' ')
    .replace(/\bch(?:apter)?\s*\d+\b/gi, ' ')
    .replace(/\bpart\s*[ab]\b/gi, ' ')
    .replace(/&/g, ' and ');

  // Domain-specific abbreviation & typo expansions observed in real CA Final Drive folders
  const replacements: Array<[RegExp, string]> = [
    [/\bforex\b/g, 'foreign exchange'],
    [/\beco\b/g, 'electronic commerce'],
    [/\bpos\b/g, 'place of supply'],
    [/\bitc\b/g, 'input tax credit'],
    [/\bcertian\b/g, 'certain'],
    [/\bseize\b/g, 'seizure'],
    [/\bclubbing\b/g, 'income of other persons included assessee'],
    [/\bppe\b/g, 'property plant equipment'],
    [/\beps\b/g, 'earnings per share'],
    [/\bcfs\b/g, 'consolidated financial statements'],
  ];
  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  const rawTokens = text
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      if (tok.length > 4 && tok.endsWith('ies')) return `${tok.slice(0, -3)}y`;
      if (tok.length > 4 && tok.endsWith('es') && !tok.endsWith('ses')) return tok.slice(0, -1);
      if (tok.length > 3 && tok.endsWith('s') && !tok.endsWith('ss')) return tok.slice(0, -1);
      return tok;
    })
    .filter((tok) => tok.length > 1 && !STOPWORDS.has(tok));

  return Array.from(new Set(rawTokens));
}

/**
 * Computes a topic similarity score between a topic-only revision chapter (e.g. "Assets held for Sale")
 * and an anchored module chapter (e.g. "Ind AS 105 — Non Current Assets held for Sale and Discontinued Operations").
 */
function computeTopicMatchScore(sourceTokens: string[], targetTokens: string[]): number {
  if (sourceTokens.length === 0 || targetTokens.length === 0) return 0;

  const targetSet = new Set(targetTokens);
  let overlap = 0;
  for (const tok of sourceTokens) {
    if (targetSet.has(tok)) {
      overlap += 1;
    } else if (
      tok.length >= 5 &&
      targetTokens.some((t) => t.length >= 5 && (t.startsWith(tok) || tok.startsWith(t)))
    ) {
      overlap += 0.85;
    }
  }

  if (overlap === 0) return 0;

  const smallerSize = Math.min(sourceTokens.length, targetTokens.length);
  const coverageOfSource = overlap / sourceTokens.length;
  const coverageOfSmaller = overlap / smallerSize;

  // Strong multi-token match (e.g. "business combination", "asset held sale", "foreign exchange rate", "electronic commerce")
  if (overlap >= 1.7 && coverageOfSmaller >= 0.6) {
    return coverageOfSource * 100 + overlap * 15;
  }

  // Exact single-word distinctive topic match (e.g., "inventory", "lease", "agriculture", "refund", "registration", "return", "payment")
  if (sourceTokens.length === 1 && overlap >= 0.85) {
    // Prefer closer title lengths so "Payment" matches "Payment of Tax" over a 6-word chapter
    return 75 + (1 / targetTokens.length) * 20;
  }

  // Special case for "Other Sources" matching "Income from Other Sources" (2 tokens: other, source)
  if (overlap >= 1.7 && coverageOfSource >= 0.5) {
    return coverageOfSource * 90 + overlap * 10;
  }

  return 0;
}

function mergeChapterInto(target: ChapterGroup, source: ChapterGroup): void {
  for (const art of source.allArtifacts) {
    art.chapterKey = target.chapterKey;
    art.chapterNumber = target.chapterNumber;
    art.chapterTitle = target.title;
    target.allArtifacts.push(art);
  }
  for (const std of source.standards) {
    if (!target.standards.some((s) => s.toLowerCase() === std.toLowerCase())) {
      target.standards.push(std);
    }
  }
}

/**
 * Post-pass unifier that merges topic-only folders (like FR `3. Revisions/Business Combinations`
 * or IDT `Revisions/ECO` or DT `Revisions/Clubbing of Income`) into their corresponding
 * Module chapter (`Ind AS 103 — Business Combinations`, `Chapter 12 Electronic Commerce Transactions`, etc.)
 * so ALL materials for a chapter live together in ONE section.
 */
function unifyRelatedChapters(groups: ChapterGroup[]): ChapterGroup[] {
  const nonChapterGroups = groups.filter((g) => g.sectionKind !== 'chapter');
  const chapterGroups = groups.filter((g) => g.sectionKind === 'chapter');

  // Identify anchored chapters (numbered chapters OR standard-coded chapters like Ind AS 103)
  // vs topic-only chapters (e.g. from "3. Revisions/<Topic>" without a chapter or Ind AS number)
  const anchored: ChapterGroup[] = [];
  const topicOnly: ChapterGroup[] = [];

  for (const g of chapterGroups) {
    const isAnchored =
      g.chapterNumber !== null ||
      g.chapterKey.includes('std-') ||
      extractPrimaryIndAsNumber(g.title) !== null;
    if (isAnchored) {
      anchored.push(g);
    } else {
      topicOnly.push(g);
    }
  }

  // Special multi-standard umbrella check for FR (e.g. "Financial Instruments" folder vs Ind AS 32/107/109)
  const unmatchedTopicOnly: ChapterGroup[] = [];

  for (const src of topicOnly) {
    const srcTokens = canonicalizeTopicTokens(src.title);
    let bestTarget: ChapterGroup | null = null;
    let bestScore = 0;

    for (const candidate of anchored) {
      // Never merge Part A (GST) with Part B (Customs)
      if (src.partLabel && candidate.partLabel && src.partLabel !== candidate.partLabel) {
        continue;
      }
      // For IDT Revisions (which are GST topics with partLabel=null), prefer Part A over Part B
      const partBonus =
        !src.partLabel && candidate.partLabel?.includes('Part A')
          ? 8
          : !src.partLabel && candidate.partLabel?.includes('Part B')
            ? -25
            : 0;

      // Direct standard overlap check (e.g. a revision folder whose files mention Ind AS 109)
      let stdBonus = 0;
      for (const s of src.standards) {
        if (candidate.standards.some((cs) => cs.toLowerCase() === s.toLowerCase())) {
          stdBonus = 50;
          break;
        }
      }

      const candTokens = canonicalizeTopicTokens(candidate.title);
      const tokenScore = computeTopicMatchScore(srcTokens, candTokens);

      // Also check candidate's module filenames in case the chapter title was generic
      let fileScore = 0;
      if (tokenScore === 0 && candidate.allArtifacts.length > 0) {
        const modTokens = canonicalizeTopicTokens(candidate.allArtifacts[0].title);
        fileScore = computeTopicMatchScore(srcTokens, modTokens);
      }

      const totalScore = Math.max(tokenScore, fileScore) + stdBonus + partBonus;
      if (totalScore >= 65 && totalScore > bestScore) {
        bestScore = totalScore;
        bestTarget = candidate;
      }
    }

    if (bestTarget) {
      mergeChapterInto(bestTarget, src);
    } else {
      unmatchedTopicOnly.push(src);
    }
  }

  // Also deduplicate among remaining unmatchedTopicOnly if two topic folders share near-identical canonical tokens
  const dedupedTopicOnly: ChapterGroup[] = [];
  for (const src of unmatchedTopicOnly) {
    const srcTokens = canonicalizeTopicTokens(src.title);
    const existing = dedupedTopicOnly.find((cand) => {
      if (src.partLabel && cand.partLabel && src.partLabel !== cand.partLabel) return false;
      const candTokens = canonicalizeTopicTokens(cand.title);
      return computeTopicMatchScore(srcTokens, candTokens) >= 95;
    });
    if (existing) {
      mergeChapterInto(existing, src);
    } else {
      dedupedTopicOnly.push(src);
    }
  }

  return [...anchored, ...dedupedTopicOnly, ...nonChapterGroups];
}

/**
 * Generates Google Drive's view-only preview embed URL (no file size limit, streams server-side).
 */
export function buildDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
}

function rebuildChapterBuckets(group: ChapterGroup): void {
  const modules: RevisionArtifact[] = [];
  const slides: RevisionArtifact[] = [];
  const infographics: RevisionArtifact[] = [];
  const practiceQa: RevisionArtifact[] = [];
  const otherFiles: RevisionArtifact[] = [];

  for (const art of group.allArtifacts) {
    if (art.category === 'module' || art.category === 'suggested_answers') {
      modules.push(art);
    } else if (art.category === 'slides') {
      slides.push(art);
    } else if (art.category === 'infographic') {
      infographics.push(art);
    } else if (art.category === 'practice_qa') {
      practiceQa.push(art);
    } else {
      otherFiles.push(art);
    }
  }

  const byTitle = (a: RevisionArtifact, b: RevisionArtifact) =>
    a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });

  modules.sort(byTitle);
  slides.sort(byTitle);
  infographics.sort(byTitle);
  practiceQa.sort(byTitle);
  otherFiles.sort(byTitle);

  group.modules = modules;
  group.slides = slides;
  group.infographics = infographics;
  group.practiceQa = practiceQa;
  group.revisionVisuals = [...slides, ...infographics];
  group.otherFiles = otherFiles;
  group.allArtifacts = [...modules, ...slides, ...infographics, ...practiceQa, ...otherFiles];
}

const SECTION_ORDER: Record<ChapterSectionKind, number> = {
  chapter: 0,
  suggested_answers: 1,
  practice_questions: 2,
  general: 3,
};

/**
 * Normalizes a flat list of recursive Google Drive items from ANY subject folder structure
 * into resilient, unified, cleanly sorted chapter groups + separated JSON quiz files.
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
    const inferred = inferChapter(item.name, item.pathSegments, standards, subjectId);

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
      subTopic: inferred.subTopic,
      sizeBytes: item.size ? Number(item.size) || null : null,
      modifiedTime: item.modifiedTime,
      drivePreviewUrl: source === 'demo' ? null : buildDrivePreviewUrl(item.id),
      source,
    };

    if (category === 'quiz_json') {
      quizFiles.push(artifact);
      continue;
    }

    // Merge into existing chapter if matching chapterKey OR (for regular chapters only) matching primary Ind AS/SA standard
    let targetKey = inferred.chapterKey;
    if (
      inferred.sectionKind === 'chapter' &&
      !chapterMap.has(targetKey) &&
      standards.length > 0
    ) {
      const primaryStdLower = standards[0].toLowerCase();
      for (const [existingKey, existingGroup] of chapterMap.entries()) {
        if (existingGroup.sectionKind !== 'chapter') continue;
        if (
          inferred.partLabel &&
          existingGroup.partLabel &&
          inferred.partLabel !== existingGroup.partLabel
        ) {
          continue;
        }
        // Only merge via primary standard when both are standard-driven or one has no chapter number
        if (
          (inferred.chapterNumber === null || existingGroup.chapterNumber === null) &&
          existingGroup.standards.some((s) => s.toLowerCase() === primaryStdLower)
        ) {
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
        sectionKind: inferred.sectionKind,
        partLabel: inferred.partLabel,
        standards: [...standards],
        modules: [],
        slides: [],
        infographics: [],
        practiceQa: [],
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
      if (!group.partLabel && inferred.partLabel) {
        group.partLabel = inferred.partLabel;
      }
      for (const std of standards) {
        if (!group.standards.some((s) => s.toLowerCase() === std.toLowerCase())) {
          group.standards.push(std);
        }
      }
    }

    group.allArtifacts.push(artifact);
  }

  // Cross-folder topic unification pass (merges FR 1. Modules + 3. Revisions, IDT Modules + Revisions, DT Modules + Revisions)
  const unified = unifyRelatedChapters(Array.from(chapterMap.values()));

  // Rebuild sorted category buckets per chapter
  for (const ch of unified) {
    rebuildChapterBuckets(ch);
  }

  // Deterministic chapter sorting:
  // 1) Chapters first, then Suggested Answers, Practice Questions, General
  // 2) Within chapters: Part A before Part B (if applicable)
  // 3) Numbered chapters ascending (Ch 1..N)
  // 4) Ind AS numbered chapters ascending numerically (Ind AS 1, 2, 7, 8 ... 101, 102, 103 ... 115, 116)
  // 5) Alphabetical fallback
  const chapters = unified.sort((a, b) => {
    const secDiff = SECTION_ORDER[a.sectionKind] - SECTION_ORDER[b.sectionKind];
    if (secDiff !== 0) return secDiff;

    const aPartRank = a.partLabel?.includes('Part B') ? 1 : 0;
    const bPartRank = b.partLabel?.includes('Part B') ? 1 : 0;
    if (aPartRank !== bPartRank) return aPartRank - bPartRank;

    if (a.chapterNumber !== null && b.chapterNumber !== null) {
      return a.chapterNumber - b.chapterNumber;
    }
    if (a.chapterNumber !== null) return -1;
    if (b.chapterNumber !== null) return 1;

    const aIndAs = extractPrimaryIndAsNumber(a.title);
    const bIndAs = extractPrimaryIndAsNumber(b.title);
    if (aIndAs !== null && bIndAs !== null && aIndAs !== bIndAs) {
      return aIndAs - bIndAs;
    }
    if (aIndAs !== null && bIndAs === null) return -1;
    if (aIndAs === null && bIndAs !== null) return 1;

    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
  });

  return { chapters, quizFiles };
}
