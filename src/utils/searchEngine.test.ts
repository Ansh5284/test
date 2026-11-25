import test from 'node:test';
import assert from 'node:assert/strict';
import { searchArchives } from './searchEngine';
import { SUBJECT_MAP } from '../config/driveConfig';
import type { ChapterGroup, RevisionArtifact, SubjectArchive } from '../types/archive';

function makeArtifact(overrides: Partial<RevisionArtifact>): RevisionArtifact {
  return {
    id: 'art-1',
    subjectId: 'fr',
    title: 'Sample File',
    rawFileName: 'Sample File.pdf',
    category: 'module',
    mimeType: 'application/pdf',
    chapterKey: 'ch-1',
    chapterNumber: 1,
    chapterTitle: 'Revenue from Contracts with Customers',
    standards: ['Ind AS 115'],
    folderBreadcrumb: ['1. Modules'],
    sizeBytes: null,
    drivePreviewUrl: null,
    source: 'demo',
    ...overrides,
  };
}

function buildTestArchives(): SubjectArchive[] {
  const mod = makeArtifact({
    id: 'fr-mod-1',
    title: 'Ind AS 115 Comprehensive Study Module',
    rawFileName: 'Ind AS 115 Comprehensive Study Module.pdf',
    category: 'module',
  });
  const slide = makeArtifact({
    id: 'fr-slide-1',
    title: 'Five-Step Revenue Revision Slides',
    rawFileName: 'Five-Step Revenue Revision Slides.pdf',
    category: 'slides',
  });
  const chart = makeArtifact({
    id: 'fr-chart-1',
    title: 'Variable Consideration Decision Chart',
    rawFileName: 'Variable Consideration Decision Chart.png',
    category: 'infographic',
  });

  const ch1: ChapterGroup = {
    chapterKey: 'std-ind-as-115',
    chapterNumber: null,
    title: 'Ind AS 115 — Revenue from Contracts with Customers',
    subjectId: 'fr',
    sectionKind: 'chapter',
    partLabel: null,
    standards: ['Ind AS 115'],
    modules: [mod],
    slides: [slide],
    infographics: [chart],
    practiceQa: [],
    revisionVisuals: [slide, chart],
    otherFiles: [],
    allArtifacts: [mod, slide, chart],
  };

  return [
    {
      meta: SUBJECT_MAP.fr,
      folderId: null,
      chapters: [ch1],
      quizFiles: [],
      totalArtifacts: 3,
      readiness: 'complete',
      source: 'demo',
      lastSyncedAt: null,
    },
  ];
}

test('searching by a specific file name returns that file AND all sibling files in the same chapter', () => {
  const archives = buildTestArchives();
  const results = searchArchives(archives, 'Variable Consideration Decision Chart');

  assert.equal(results.length, 1);
  assert.equal(results[0].matchedArtifacts.length, 1);
  assert.equal(results[0].matchedArtifacts[0].id, 'fr-chart-1');

  // Sibling module and slides from the same chapter MUST be included in search results
  assert.equal(results[0].relatedChapterArtifacts.length, 2);
  const relatedIds = results[0].relatedChapterArtifacts.map((a) => a.id).sort();
  assert.deepEqual(relatedIds, ['fr-mod-1', 'fr-slide-1']);
});

test('searching by standard name (Ind AS 115) matches chapter and surfaces all chapter files', () => {
  const archives = buildTestArchives();
  const results = searchArchives(archives, 'Ind AS 115');

  assert.equal(results.length, 1);
  assert.ok(results[0].matchReasons.some((r) => r.includes('Ind AS 115')));
  assert.equal(
    results[0].matchedArtifacts.length + results[0].relatedChapterArtifacts.length,
    3,
  );
});

test('searching respects subject filter and granular artifact filter modes', () => {
  const archives = buildTestArchives();
  assert.equal(searchArchives(archives, 'Revenue from Contracts').length, 1);
  assert.equal(
    searchArchives(archives, 'Revenue from Contracts', { subjectFilter: 'audit' }).length,
    0,
  );
  const slidesOnly = searchArchives(archives, 'Ind AS 115', { artifactFilter: 'slides' });
  assert.equal(slidesOnly.length, 1);
  assert.equal(slidesOnly[0].matchedArtifacts.length, 1);
  assert.equal(slidesOnly[0].matchedArtifacts[0].category, 'slides');
});
