import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyArtifact,
  extractStandards,
  normalizeDriveTreeToChapters,
} from './driveNormalizer';
import type { DriveRawItem } from '../types/archive';

test('extractStandards extracts Ind AS, SA, SQC, CARO, and Section tags without duplicates', () => {
  const tags = extractStandards(
    'Ch 1 - Ind AS 115 Revenue & ind as 115 slides, SA 315, SQC 1, CARO 2020, Sec 115BAA',
  );
  assert.deepEqual(tags, ['Ind AS 115', 'SQC 1', 'SA 315', 'CARO 2020', 'Sec 115BAA']);
});

test('merges flat Modules folder and chapter-nested Revision Slides folder into unified chapters', () => {
  const rawItems: DriveRawItem[] = [
    {
      id: 'mod-1',
      name: 'Ch 01 - Ind AS 115 Revenue Recognition Study Module.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['Modules'],
    },
    {
      id: 'slide-1',
      name: 'Five Step Model Revision Slides.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['Revision Slides and Infographics', 'Chapter 1 - Revenue from Contracts'],
    },
    {
      id: 'chart-1',
      name: 'Ind AS 115 Five-Step Infographic.png',
      mimeType: 'image/png',
      pathSegments: ['Revision Slides and Infographics', 'Chapter 1 - Revenue from Contracts'],
    },
    {
      id: 'mod-2',
      name: 'Ind AS 116 Leases Module.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['Modules'],
    },
    {
      id: 'chart-2',
      name: 'Ind AS 116 Lessee Accounting Chart.png',
      mimeType: 'image/png',
      pathSegments: ['Revision Slides and Infographics'],
    },
  ];

  const { chapters, quizFiles } = normalizeDriveTreeToChapters('fr', rawItems, 'drive_public');

  assert.equal(quizFiles.length, 0);
  assert.equal(chapters.length, 2);

  // Chapter 1 unified module + slide + infographic
  const ch1 = chapters[0];
  assert.equal(ch1.chapterNumber, 1);
  assert.equal(ch1.modules.length, 1);
  assert.equal(ch1.revisionVisuals.length, 2);
  assert.equal(ch1.allArtifacts.length, 3);
  assert.ok(ch1.standards.includes('Ind AS 115'));

  // Ind AS 116 unified by standard even without chapter numbers
  const ch2 = chapters[1];
  assert.equal(ch2.modules.length, 1);
  assert.equal(ch2.revisionVisuals.length, 1);
  assert.ok(ch2.standards.includes('Ind AS 116'));
});

test('handles chapter-first folder hierarchy and separates daily JSON quizzes safely', () => {
  const rawItems: DriveRawItem[] = [
    {
      id: 'a-mod',
      name: 'SA 315 Detailed Notes.pdf',
      mimeType: 'application/pdf',
      pathSegments: ['Chapter 2 - Risk Assessment', 'Modules'],
    },
    {
      id: 'a-inf',
      name: 'Risk Matrix.webp',
      mimeType: 'image/webp',
      pathSegments: ['Chapter 2 - Risk Assessment', 'Infographics'],
    },
    {
      id: 'q-json',
      name: '2026-11-24-sa315-daily-quiz.json',
      mimeType: 'application/json',
      pathSegments: ['Quizzes'],
    },
    {
      id: 'empty-folder',
      name: 'Empty Subfolder',
      mimeType: 'application/vnd.google-apps.folder',
      pathSegments: [],
    },
  ];

  const { chapters, quizFiles } = normalizeDriveTreeToChapters('audit', rawItems, 'drive_oauth');

  assert.equal(chapters.length, 1);
  assert.equal(chapters[0].modules.length, 1);
  assert.equal(chapters[0].revisionVisuals.length, 1);
  assert.equal(quizFiles.length, 1);
  assert.equal(quizFiles[0].id, 'q-json');
});

test('does not crash on unexpected filenames or empty folders', () => {
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
  ];
  const result = normalizeDriveTreeToChapters('dt', weird, 'drive_public');
  assert.equal(result.chapters.length, 1);
  assert.equal(result.chapters[0].chapterKey, 'general-resources');
  assert.equal(classifyArtifact(weird[0]), 'other');
});
