import { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileJson,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { GEMINI_QUIZ_JSON_TEMPLATE } from '../data/seedQuizzes';
import type { McqQuiz, QuizEvaluationResult } from '../types/archive';
import { evaluateMcqQuiz } from '../utils/quizEngine';

interface PopQuizViewProps {
  quizzes: McqQuiz[];
}

export function PopQuizView({ quizzes }: PopQuizViewProps) {
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.quizId || '');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizEvaluationResult | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const scoreBannerRef = useRef<HTMLElement | null>(null);

  const activeQuiz = useMemo(
    () => quizzes.find((q) => q.quizId === selectedQuizId) || quizzes[0],
    [quizzes, selectedQuizId],
  );

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setAnswers({});
    setResult(null);
  };

  const handleChooseOption = (questionId: string, optionIdx: number) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    setResult(evaluateMcqQuiz(activeQuiz, answers));
    window.setTimeout(() => {
      scoreBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setResult(null);
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(GEMINI_QUIZ_JSON_TEMPLATE);
      setCopiedSchema(true);
      window.setTimeout(() => setCopiedSchema(false), 2500);
    } catch {
      setCopiedSchema(false);
    }
  };

  if (!activeQuiz) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-sm text-slate-500">No quiz files loaded yet.</p>
      </div>
    );
  }

  const attemptedCount = Object.keys(answers).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-xs font-mono font-medium text-[#2563EB]">
          Daily &amp; Weekly Drive JSON Quiz Engine
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          100-Mark Conceptual Pop Quiz
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-2xl">
          Any JSON quiz file placed inside a subject&apos;s{' '}
          <span className="font-mono text-slate-800">Quizzes/</span> Google Drive folder is
          automatically parsed and rendered here with instant marking and standard-referenced
          explanations.
        </p>
      </header>

      {/* Quiz Selector */}
      <section aria-label="Available quizzes" className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quizzes.map((quiz) => {
          const isSelected = quiz.quizId === activeQuiz.quizId;
          return (
            <button
              key={quiz.quizId}
              type="button"
              onClick={() => handleSelectQuiz(quiz.quizId)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-blue-300'
              }`}
            >
              <p
                className={`text-xs font-mono tabular-nums ${
                  isSelected ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                {quiz.subjectName} · {quiz.totalMarks} Marks · {quiz.frequency} ·{' '}
                {quiz.publishedDate}
              </p>
              <p className="text-base font-bold mt-1 leading-snug">{quiz.title}</p>
              <p className={`text-xs mt-1.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {quiz.sourceLabel} · {quiz.questions.length} conceptual questions
              </p>
            </button>
          );
        })}
      </section>

      {/* Evaluation Score Banner */}
      {result && (
        <section
          ref={scoreBannerRef}
          aria-label="Quiz score summary"
          className="bg-white border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="space-y-1">
            <p className="text-xs font-mono font-semibold text-[#2563EB]">Evaluation Complete</p>
            <h2 className="text-2xl font-bold text-slate-900 tabular-nums">
              Score: {result.earnedMarks} / {result.totalMarks} Marks ({result.percentage}%)
            </h2>
            <p className="text-sm text-slate-600 tabular-nums">
              {result.correctCount} correct out of {result.totalQuestions} questions (
              {result.attemptedCount} attempted). Review the standard citations and reasoning below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetQuiz}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Retake Quiz</span>
          </button>
        </section>
      )}

      {/* Question List */}
      <section aria-label="Quiz questions" className="space-y-4">
        {activeQuiz.questions.map((q, index) => {
          const selectedIdx = answers[q.id];
          const detail = result?.details.find((d) => d.questionId === q.id);

          return (
            <article
              key={q.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-mono text-slate-500 tabular-nums">
                <span>
                  Question {String(index + 1).padStart(2, '0')} · {q.chapter}
                </span>
                <span className="text-[#2563EB] font-medium">
                  {q.standardRef ? `${q.standardRef} · ` : ''}
                  {q.marks} Marks
                </span>
              </div>

              <p className="text-[15px] font-semibold leading-relaxed text-slate-900">
                {q.question}
              </p>

              <div
                className="space-y-2"
                role="radiogroup"
                aria-label={`Options for Question ${index + 1}`}
              >
                {q.options.map((opt, optIdx) => {
                  const isChosen = selectedIdx === optIdx;
                  const isCorrectOption = optIdx === q.correctOptionIndex;

                  let stateStyle =
                    'bg-slate-50 border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-[#EFF6FF]/40';

                  if (result) {
                    if (isCorrectOption) {
                      stateStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                    } else if (isChosen && !isCorrectOption) {
                      stateStyle = 'bg-red-50 border-red-400 text-red-900';
                    } else {
                      stateStyle = 'bg-white border-slate-200 text-slate-400';
                    }
                  } else if (isChosen) {
                    stateStyle = 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8] font-medium';
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={isChosen}
                      disabled={Boolean(result)}
                      onClick={() => handleChooseOption(q.id, optIdx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-start justify-between gap-3 ${stateStyle}`}
                    >
                      <span>
                        <span className="font-mono mr-2.5 text-xs">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </span>
                      {result && isCorrectOption && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          Correct
                        </span>
                      )}
                      {result && isChosen && !isCorrectOption && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 shrink-0">
                          <XCircle className="w-4 h-4" aria-hidden="true" />
                          Your Pick
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {detail && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-900 font-mono tabular-nums">
                    {detail.isCorrect
                      ? `Correct (+${detail.earnedMarks} / ${detail.maxMarks} marks)`
                      : `${detail.selectedIndex === null ? 'Unanswered' : 'Incorrect'} (0 / ${detail.maxMarks} marks) — Correct Answer: Option ${String.fromCharCode(
                          65 + detail.correctIndex,
                        )}`}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">{detail.explanation}</p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Quiz Action Bar */}
      {!result && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500 font-mono tabular-nums">
            Answered {attemptedCount} of {activeQuiz.questions.length} questions
          </p>
          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={attemptedCount === 0}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Submit Quiz &amp; View Reasoning
          </button>
        </div>
      )}

      {/* Expandable JSON Schema Specification */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSchema((s) => !s)}
          aria-expanded={showSchema}
          className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileJson className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Drive JSON Schema for Automated Daily / Weekly Gemini Quizzes
              </p>
              <p className="text-xs text-slate-500">
                Drop any JSON file matching this schema into a subject&apos;s Drive folder to
                publish a live 100-mark quiz automatically.
              </p>
            </div>
          </div>
          {showSchema ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>

        {showSchema && (
          <div className="border-t border-slate-200 p-6 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Folder path convention:{' '}
                <span className="font-mono text-slate-700">
                  Subject / Quizzes / YYYY-MM-DD-topic.json
                </span>
              </p>
              <button
                type="button"
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{copiedSchema ? 'Copied Schema' : 'Copy JSON Template'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
              {GEMINI_QUIZ_JSON_TEMPLATE}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
