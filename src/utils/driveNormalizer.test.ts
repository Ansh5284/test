import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyArtifact,
  extractStandards,
  normalizeDriveTreeToChapters,
  stripLeadingOrderPrefix,
} from './driveNormalizer';
import type { DriveRawItem } from '../types/archive';

test('extractStandards extracts Ind AS, SA, SQC, CARO, and Section tags without duplicates', () => {
  const tags = extractStandards(
    'Ch 1 - Ind AS 115 Revenue & ind as 115 slides, SA 315, SQC 1, CARO 2020, Sec 115BAA',
  );
  assert.deepEqual(tags, ['Ind AS 115', 'SQC 1', 'SA 315', 'CARO 2020', 'Sec 115BAA']);
});

test('stripLeadingOrderPrefix removes numeric/alpha ordering prefixes without breaking Chapter or Date names', () => {
  assert.equal(stripLeadingOrderPrefix('1. Modules'), 'Modules');
  assert.equal(stripLeadingOrderPrefix('2. ICAI Suggested Answers'), 'ICAI Suggested Answers');
  assert.equal(stripLeadingOrderPrefix('3. Revisions'), 'Revisions');
  assert.equal(stripLeadingOrderPrefix('4. Practice Questions'), 'Practice Questions');
  assert.equal(stripLeadingOrderPrefix('z. Practice Questions'), 'Practice Questions');
  assert.equal(stripLeadingOrderPrefix('0. Modules Part A'), 'Modules Part A');
  assert.equal(stripLeadingOrderPrefix('Chapter 1. Quality Control'), 'Chapter 1. Quality Control');
  assert.equal(stripLeadingOrderPrefix('04-10-2026'), '04-10-2026');
});

test('FR real layout: unifies 1. Modules Ind AS PDFs with 3. Revisions topic folders, sorts Ind AS numerically, and isolates Suggested Answers & dated Practice Questions', () => {
  const rawItems: DriveRawItem[] = [
    // Modules (Ind AS prefix)
    {
      id: 'fr-mod-103',
      name: 'Ind AS 103 Business Combinations.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['1. Modules'],
    },
    {
      id: 'fr-mod-21',
      name: 'Ind AS 21 The Effects of Changes in Foreign Exchange Rates.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['1. Modules'],
    },
    {
      id: 'fr-mod-105',
      name: 'Ind AS 105 Non Current Assets held for Sale and Discontinued Operations.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['1. Modules'],
    },
    {
      id: 'fr-mod-19',
      name: 'Ind AS 19 Employee Benefits.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['1. Modules'],
    },
    // Revisions (topic folders WITHOUT Ind AS numbers + spelling/abbreviation variations)
    {
      id: 'fr-rev-bc-slide',
      name: 'Business Combinations Deck.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['3. Revisions', 'Business Combinations'],
    },
    {
      id: 'fr-rev-bc-inf',
      name: 'Acquisition Method Infographic.png',
      mimeType: 'image/png',
      pathSegments: ['3. Revisions', 'Business Combinations'],
    },
    {
      id: 'fr-rev-forex',
      name: 'Forex Rates Quick Slides.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['3. Revisions', 'The Effect of Changes in Forex Rates'],
    },
    {
      id: 'fr-rev-ahfs',
      name: 'Held for Sale Visual.png',
      mimeType: 'image/png',
      pathSegments: ['3. Revisions', 'Assets held for Sale'],
    },
    {
      id: 'fr-rev-emp',
      name: 'Employee Benefit Summary.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['3. Revisions', 'Employee Benefit Expenses'],
    },
    // Suggested Answers
    {
      id: 'fr-sa-1',
      name: 'Jan 2026 Suggested Answers.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['2. ICAI Suggested Answers'],
    },
    // Dated Practice Questions (MUST NOT become Chapter 04 or Chapter 09!)
    {
      id: 'fr-pq-1',
      name: 'CA Final FR Practice Test.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['4. Practice Questions', '04-10-2026'],
    },
    {
      id: 'fr-pq-2',
      name: 'Evaluation Report.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['4. Practice Questions', '09-09-2026'],
    },
  ];

  const { chapters } = normalizeDriveTreeToChapters('fr', rawItems, 'drive_public');

  // 4 unified Ind AS chapters + 1 Suggested Answers + 1 Practice Questions = 6 clean sections (NOT 12 scattered!)
  assert.equal(chapters.length, 6);

  // True numerical Ind AS ordering: 19, 21, 103, 105
  assert.ok(chapters[0].title.startsWith('Ind AS 19'));
  assert.equal(chapters[0].modules.length, 1);
  assert.equal(chapters[0].slides.length, 1);

  assert.ok(chapters[1].title.startsWith('Ind AS 21'));
  assert.equal(chapters[1].modules.length, 1);
  assert.equal(chapters[1].slides.length, 1);

  assert.ok(chapters[2].title.startsWith('Ind AS 103'));
  assert.equal(chapters[2].modules.length, 1);
  assert.equal(chapters[2].slides.length, 1);
  assert.equal(chapters[2].infographics.length, 1);

  assert.ok(chapters[3].title.startsWith('Ind AS 105'));
  assert.equal(chapters[3].modules.length, 1);
  assert.equal(chapters[3].infographics.length, 1);

  // Dedicated non-chapter sections at bottom
  assert.equal(chapters[4].sectionKind, 'suggested_answers');
  assert.equal(chapters[4].allArtifacts.length, 1);

  assert.equal(chapters[5].sectionKind, 'practice_questions');
  assert.equal(chapters[5].allArtifacts.length, 2);
  assert.equal(chapters[5].practiceQa.length, 2);
  assert.equal(chapters[5].allArtifacts[0].subTopic, '04-10-2026');
});

test('Audit real layout: anchors nested SA 240 / Bare Standards / Notes subfolders into parent Chapter instead of splitting chapters', () => {
  const rawItems: DriveRawItem[] = [
    {
      id: 'aud-mod-2',
      name: "Chapter 2 General Auditing Principles and Auditor's Responsibilities.pdf",
      mimeType: 'application/pdf',
      pathSegments: ['0. Modules'],
    },
    {
      id: 'aud-sa240',
      name: 'SA 240 Fraud Deck.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pathSegments: [
        "Chapter 2. General Auditing Principles and Auditor's Responsibilities",
        'SA 240',
      ],
    },
    {
      id: 'aud-sa250',
      name: 'SA 250 Laws Chart.png',
      mimeType: 'image/png',
      pathSegments: [
        "Chapter 2. General Auditing Principles and Auditor's Responsibilities",
        'SA 250',
      ],
    },
    {
      id: 'aud-mod-5',
      name: 'Chapter 5 Audit Evidence.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['0. Modules'],
    },
    {
      id: 'aud-bare-500',
      name: 'SA 500 Audit Evidence.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['Chapter 5 Audit Evidence', 'Bare Standards'],
    },
    {
      id: 'aud-pq',
      name: 'Audit Test 1.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['z. Practice Questions', '15-10-2026'],
    },
  ];

  const { chapters } = normalizeDriveTreeToChapters('audit', rawItems, 'drive_public');

  // Chapter 2 + Chapter 5 + Practice Questions = 3 clean sections!
  assert.equal(chapters.length, 3);

  assert.equal(chapters[0].chapterNumber, 2);
  assert.equal(chapters[0].allArtifacts.length, 3);
  assert.equal(chapters[0].modules.length, 1);
  assert.equal(chapters[0].slides.length, 1);
  assert.equal(chapters[0].infographics.length, 1);
  assert.equal(chapters[0].slides[0].subTopic, 'SA 240');

  assert.equal(chapters[1].chapterNumber, 5);
  assert.equal(chapters[1].allArtifacts.length, 2);
  assert.equal(chapters[1].modules.length, 2); // Module + Bare Standards PDF both under Modules & notes

  assert.equal(chapters[2].sectionKind, 'practice_questions');
  assert.equal(chapters[2].practiceQa.length, 1);
});

test('IDT real layout: separates Part A (GST) Ch 1 from Part B (Customs) Ch 1 and merges ECO/Payments revisions into Part A modules', () => {
  const rawItems: DriveRawItem[] = [
    {
      id: 'idt-a-1',
      name: 'Chapter 1 Supply Under GST.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['0. Modules Part A'],
    },
    {
      id: 'idt-a-12',
      name: 'Chapter 12 Electronic Commerce Transactions.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['0. Modules Part A'],
    },
    {
      id: 'idt-rev-eco',
      name: 'ECO Slides.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['Revisions', 'ECO'],
    },
    {
      id: 'idt-b-1',
      name: 'Chapter 1 Levy of and Exemptions from Customs Duty.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['0. Modules Part B'],
    },
  ];

  const { chapters } = normalizeDriveTreeToChapters('idt', rawItems, 'drive_public');

  // Part A Ch 1, Part A Ch 12 (with ECO merged!), Part B Ch 1 = 3 distinct chapters!
  assert.equal(chapters.length, 3);
  assert.equal(chapters[0].partLabel, 'Part A · GST');
  assert.equal(chapters[0].chapterNumber, 1);

  assert.equal(chapters[1].partLabel, 'Part A · GST');
  assert.equal(chapters[1].chapterNumber, 12);
  assert.equal(chapters[1].modules.length, 1);
  assert.equal(chapters[1].slides.length, 1);

  assert.equal(chapters[2].partLabel, 'Part B · Customs');
  assert.equal(chapters[2].chapterNumber, 1);
});

test('DT real layout: merges Clubbing of Income & Other Sources revisions into matching numbered module chapters', () => {
  const rawItems: DriveRawItem[] = [
    {
      id: 'dt-mod-5',
      name: 'Chapter 5 Income from Other Sources.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['Modules'],
    },
    {
      id: 'dt-mod-6',
      name: "Chapter 6 Income of other persons included in Assessee's Total Income.pdf",
      mimeType: 'application/pdf',
      pathSegments: ['Modules'],
    },
    {
      id: 'dt-rev-5',
      name: 'Other Sources Summary.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['Revisions', 'Other Sources'],
    },
    {
      id: 'dt-rev-6',
      name: 'Clubbing Chart.png',
      mimeType: 'image/png',
      pathSegments: ['Revisions', 'Clubbing of Income'],
    },
  ];

  const { chapters } = normalizeDriveTreeToChapters('dt', rawItems, 'drive_public');
  assert.equal(chapters.length, 2);
  assert.equal(chapters[0].chapterNumber, 5);
  assert.equal(chapters[0].allArtifacts.length, 2);
  assert.equal(chapters[1].chapterNumber, 6);
  assert.equal(chapters[1].allArtifacts.length, 2);
});

test('handles daily JSON quizzes safely and never crashes on empty or unstructured files', () => {
  assert.deepEqual(normalizeDriveTreeToChapters('dt', [], 'drive_public'), {
    chapters: [],
    quizFiles: [],
  });

  const weird: DriveRawItem[] = [
    {
      id: 'odd-1',
      name: 'misc_unstructured_file',
      mimeType: 'application/octet-stream',
      pathSegments: [],
    },
    {
      id: 'q-json',
      name: '2026-11-24-daily-quiz.json',
      mimeType: 'application/json',
      pathSegments: ['Quizzes'],
    },
  ];
  const result = normalizeDriveTreeToChapters('dt', weird, 'drive_public');
  assert.equal(result.chapters.length, 1);
  assert.equal(result.chapters[0].sectionKind, 'general');
  assert.equal(result.quizFiles.length, 1);
  assert.equal(classifyArtifact(weird[0]), 'other');
});
