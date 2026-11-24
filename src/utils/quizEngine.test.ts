import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMcqQuiz, parseQuizJson } from './quizEngine';

test('parseQuizJson validates valid Gemini-generated JSON quiz and rejects malformed payloads', () => {
  const valid = parseQuizJson(
    JSON.stringify({
      quizId: 'fr-daily-2026-11-24',
      title: 'Ind AS 115 Deep Diagnostic',
      subjectId: 'fr',
      subjectName: 'Financial Reporting',
      publishedDate: '2026-11-24',
      frequency: 'daily',
      totalMarks: 100,
      durationMinutes: 60,
      questions: [
        {
          id: 'q1',
          marks: 50,
          chapter: 'Chapter 1: Ind AS 115',
          standardRef: 'Ind AS 115',
          question: 'When is variable consideration included in the transaction price?',
          options: ['Always', 'Only when highly probable no significant reversal occurs', 'Never', 'At year end only'],
          correctOptionIndex: 1,
          explanation: 'Per Ind AS 115 para 56, include variable consideration only to the extent it is highly probable that a significant reversal will not occur.',
        },
        {
          id: 'q2',
          marks: 50,
          chapter: 'Chapter 1: Ind AS 115',
          standardRef: 'Ind AS 115',
          question: 'Which step allocates the transaction price to performance obligations?',
          options: ['Step 2', 'Step 3', 'Step 4', 'Step 5'],
          correctOptionIndex: 2,
          explanation: 'Step 4 allocates transaction price based on relative standalone selling prices.',
        },
      ],
    }),
  );

  assert.ok(valid !== null);
  assert.equal(valid.questions.length, 2);
  assert.equal(valid.totalMarks, 100);

  // Malformed inputs safely return null
  assert.equal(parseQuizJson('{broken json'), null);
  assert.equal(parseQuizJson({ questions: [] }), null);
});

test('evaluateMcqQuiz computes accurate scores and preserves explanations', () => {
  const quiz = parseQuizJson({
    quizId: 'sample',
    title: 'Sample',
    subjectId: 'audit',
    subjectName: 'Advanced Audit',
    questions: [
      {
        id: 'q1',
        marks: 10,
        chapter: 'SA 315',
        standardRef: 'SA 315',
        question: 'Q1',
        options: ['A', 'B'],
        correctOptionIndex: 0,
        explanation: 'Reason 1',
      },
      {
        id: 'q2',
        marks: 10,
        chapter: 'SA 315',
        standardRef: 'SA 315',
        question: 'Q2',
        options: ['A', 'B'],
        correctOptionIndex: 1,
        explanation: 'Reason 2',
      },
    ],
  });

  assert.ok(quiz);
  const result = evaluateMcqQuiz(quiz, { q1: 0, q2: 0 });
  assert.equal(result.earnedMarks, 10);
  assert.equal(result.totalMarks, 20);
  assert.equal(result.percentage, 50);
  assert.equal(result.correctCount, 1);
  assert.equal(result.attemptedCount, 2);
  assert.equal(result.details[0].isCorrect, true);
  assert.equal(result.details[1].isCorrect, false);
  assert.equal(result.details[1].explanation, 'Reason 2');
});
