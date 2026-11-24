import type { McqQuiz, QuizEvaluationResult, SubjectId } from '../types/archive';

const VALID_SUBJECTS: SubjectId[] = ['fr', 'audit', 'afm', 'idt', 'dt'];

/**
 * Safely parses and validates a JSON quiz payload uploaded to Google Drive
 * (e.g., generated daily or weekly by Gemini tasks). Never throws on malformed JSON.
 */
export function parseQuizJson(rawInput: unknown, fallbackSourceLabel = 'Google Drive JSON'): McqQuiz | null {
  try {
    const data = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
    if (!data || typeof data !== 'object') return null;

    const obj = data as Record<string, unknown>;
    if (!Array.isArray(obj.questions) || obj.questions.length === 0) return null;

    const subjectId = VALID_SUBJECTS.includes(obj.subjectId as SubjectId)
      ? (obj.subjectId as SubjectId)
      : 'fr';

    const questions = obj.questions
      .map((q: unknown, index: number) => {
        if (!q || typeof q !== 'object') return null;
        const item = q as Record<string, unknown>;
        if (typeof item.question !== 'string' || !Array.isArray(item.options) || item.options.length < 2) {
          return null;
        }
        const correctIdx = Number(item.correctOptionIndex);
        if (!Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx >= item.options.length) {
          return null;
        }
        return {
          id: typeof item.id === 'string' ? item.id : `q-${index + 1}`,
          marks: Number(item.marks) > 0 ? Number(item.marks) : 2,
          chapter: typeof item.chapter === 'string' ? item.chapter : 'General',
          standardRef: typeof item.standardRef === 'string' ? item.standardRef : '',
          question: item.question.trim(),
          options: item.options.map((opt) => String(opt)),
          correctOptionIndex: correctIdx,
          explanation:
            typeof item.explanation === 'string' && item.explanation.trim().length > 0
              ? item.explanation.trim()
              : 'Refer to the relevant ICAI Study Module provision.',
        };
      })
      .filter((q): q is NonNullable<typeof q> => q !== null);

    if (questions.length === 0) return null;

    const computedTotalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    return {
      quizId: typeof obj.quizId === 'string' ? obj.quizId : `quiz-${Date.now()}`,
      title: typeof obj.title === 'string' ? obj.title : 'CA Final Conceptual Pop Quiz',
      subjectId,
      subjectName: typeof obj.subjectName === 'string' ? obj.subjectName : subjectId.toUpperCase(),
      publishedDate:
        typeof obj.publishedDate === 'string'
          ? obj.publishedDate
          : new Date().toISOString().slice(0, 10),
      frequency: obj.frequency === 'weekly' ? 'weekly' : 'daily',
      totalMarks: Number(obj.totalMarks) > 0 ? Number(obj.totalMarks) : computedTotalMarks,
      durationMinutes: Number(obj.durationMinutes) > 0 ? Number(obj.durationMinutes) : 60,
      sourceLabel: typeof obj.sourceLabel === 'string' ? obj.sourceLabel : fallbackSourceLabel,
      questions,
    };
  } catch {
    return null;
  }
}

/**
 * Deterministically evaluates a student's MCQ quiz answers and returns
 * per-question reasoning & aggregate mark totals.
 */
export function evaluateMcqQuiz(
  quiz: McqQuiz,
  answers: Record<string, number>,
): QuizEvaluationResult {
  let totalMarks = 0;
  let earnedMarks = 0;
  let correctCount = 0;
  let attemptedCount = 0;

  const details = quiz.questions.map((q) => {
    totalMarks += q.marks;
    const hasSelected = Object.prototype.hasOwnProperty.call(answers, q.id);
    const selectedIndex = hasSelected ? answers[q.id] : null;
    if (selectedIndex !== null) {
      attemptedCount += 1;
    }
    const isCorrect = selectedIndex === q.correctOptionIndex;
    const awarded = isCorrect ? q.marks : 0;
    if (isCorrect) {
      correctCount += 1;
      earnedMarks += awarded;
    }
    return {
      questionId: q.id,
      selectedIndex,
      correctIndex: q.correctOptionIndex,
      isCorrect,
      earnedMarks: awarded,
      maxMarks: q.marks,
      explanation: q.explanation,
    };
  });

  const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

  return {
    totalMarks,
    earnedMarks,
    percentage,
    correctCount,
    attemptedCount,
    totalQuestions: quiz.questions.length,
    details,
  };
}
