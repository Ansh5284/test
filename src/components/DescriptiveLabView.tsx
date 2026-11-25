import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, FileUp, PenLine, Send } from 'lucide-react';
import {
  SAMPLE_EVALUATED_SUBMISSION,
  SEED_DESCRIPTIVE_QUESTIONS,
} from '../data/seedDescriptive';
import {
  submitDescriptiveAnswer,
  validatePdfAnswerFile,
} from '../services/descriptiveService';
import type { DescriptiveSubmission } from '../types/archive';

export function DescriptiveLabView() {
  const [selectedQuestionId, setSelectedQuestionId] = useState(SEED_DESCRIPTIVE_QUESTIONS[0].id);
  const [answerMode, setAnswerMode] = useState<'typed' | 'pdf'>('typed');
  const [studentName, setStudentName] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<DescriptiveSubmission[]>([
    SAMPLE_EVALUATED_SUBMISSION,
  ]);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>(
    SAMPLE_EVALUATED_SUBMISSION.id,
  );

  const activeQuestion =
    SEED_DESCRIPTIVE_QUESTIONS.find((q) => q.id === selectedQuestionId) ||
    SEED_DESCRIPTIVE_QUESTIONS[0];

  const activeSubmission =
    submissions.find((s) => s.id === activeSubmissionId) || submissions[0];

  const wordCount = typedAnswer.trim() ? typedAnswer.trim().split(/\s+/).length : 0;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const err = validatePdfAnswerFile(file);
    if (err) {
      setFormError(err);
      setPdfFile(null);
      return;
    }
    setFormError(null);
    setPdfFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (answerMode === 'typed') {
      if (typedAnswer.trim().length < 25) {
        setFormError('Please write at least 25 characters before submitting your descriptive answer.');
        return;
      }
    } else {
      const pdfErr = validatePdfAnswerFile(pdfFile);
      if (pdfErr) {
        setFormError(pdfErr);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const created = await submitDescriptiveAnswer({
        question: activeQuestion,
        studentName,
        mode: answerMode,
        typedAnswer,
        pdfFile,
      });
      setSubmissions((prev) => [created, ...prev]);
      setActiveSubmissionId(created.id);
      setTypedAnswer('');
      setPdfFile(null);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to submit descriptive response right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-xs font-mono font-medium text-[#2563EB]">
          Drive Upload &amp; Gemini Descriptive Evaluation Pipeline
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Descriptive Answer Lab
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-3xl">
          Practice exam-style CA Final case studies by typing your response or uploading a scanned
          answer PDF. Submissions save to your private Google Drive folder (via Apps Script) so
          evaluation tasks can score each criterion and return detailed marking feedback here.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Case-Study Selector & Answer Composer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Case-Study Question
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {SEED_DESCRIPTIVE_QUESTIONS.map((q) => {
                const isSelected = q.id === activeQuestion.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setSelectedQuestionId(q.id);
                      setFormError(null);
                    }}
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
                      {q.subjectName} · {q.standardRef} · {q.marks} Marks · {q.recommendedMinutes}{' '}
                      min
                    </p>
                    <p className="text-sm sm:text-base font-bold mt-1">{q.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <article className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="space-y-1">
              <p className="text-xs font-mono font-medium text-[#2563EB] tabular-nums">
                {activeQuestion.chapter} · {activeQuestion.marks} Marks
              </p>
              <h2 className="text-lg font-bold text-slate-900">{activeQuestion.title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{activeQuestion.prompt}</p>

            <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div
                  role="group"
                  aria-label="Choose response format"
                  className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAnswerMode('typed');
                      setFormError(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      answerMode === 'typed'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Type Answer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAnswerMode('pdf');
                      setFormError(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      answerMode === 'pdf'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Upload Answer PDF</span>
                  </button>
                </div>

                {answerMode === 'typed' && (
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {wordCount} words
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="desc-student-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Candidate Name or Roll Reference (optional)
                </label>
                <input
                  id="desc-student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Ansh Jain — May 2027"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                />
              </div>

              {answerMode === 'typed' ? (
                <div>
                  <label
                    htmlFor="desc-typed-answer"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Your Structured Descriptive Answer
                  </label>
                  <textarea
                    id="desc-typed-answer"
                    rows={7}
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Cite the applicable Ind AS / SA paragraph, explain the principle, show working notes, and state your conclusion..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="desc-pdf-upload"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Upload Scanned Answer Sheet (PDF only, max 15 MB)
                  </label>
                  <input
                    id="desc-pdf-upload"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-50"
                  />
                  {pdfFile && (
                    <p className="text-xs font-mono text-emerald-700">
                      Selected PDF: {pdfFile.name} ({Math.max(1, Math.round(pdfFile.size / 1024))}{' '}
                      KB)
                    </p>
                  )}
                </div>
              )}

              {formError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
                >
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Answer for Evaluation'}</span>
                </button>
              </div>
            </form>
          </article>
        </div>

        {/* Right: Submitted Scripts & Evaluated Feedback Report */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 tabular-nums">
              Submitted Responses ({submissions.length})
            </p>
            <div className="space-y-2">
              {submissions.map((sub) => {
                const isSelected = sub.id === activeSubmission?.id;
                const statusText =
                  sub.status === 'evaluated_sample'
                    ? `Evaluated · ${sub.evaluation?.awardedMarks}/${sub.evaluation?.totalMarks}`
                    : sub.status === 'saved_to_drive'
                      ? 'Saved to Drive · Pending Review'
                      : 'Queued for Review';

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubmissionId(sub.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#2563EB]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {sub.questionTitle}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1 tabular-nums">
                      {sub.mode === 'pdf' ? `PDF (${sub.pdfFileName})` : 'Typed Answer'} ·{' '}
                      {statusText}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {activeSubmission && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3 space-y-1">
                <p className="text-xs font-mono font-medium text-[#2563EB]">
                  {activeSubmission.subjectName}
                </p>
                <h3 className="text-base font-bold text-slate-900">
                  {activeSubmission.questionTitle}
                </h3>
                <p className="text-xs text-slate-500">{activeSubmission.studentName}</p>
              </div>

              {activeSubmission.evaluation ? (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-2 bg-[#EFF6FF] border border-blue-200 rounded-xl p-3.5">
                    <span className="text-xs font-semibold text-slate-900">
                      Rubric Marks Awarded
                    </span>
                    <span className="font-mono text-lg font-bold text-[#2563EB] tabular-nums">
                      {activeSubmission.evaluation.awardedMarks} /{' '}
                      {activeSubmission.evaluation.totalMarks}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-700">
                    {activeSubmission.evaluation.overallSummary}
                  </p>

                  <div className="space-y-3">
                    {activeSubmission.evaluation.rubric.map((item) => (
                      <div
                        key={item.criterion}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1"
                      >
                        <div className="flex items-baseline justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-900">{item.criterion}</span>
                          <span className="font-mono tabular-nums shrink-0 text-slate-500">
                            {item.awardedMarks}/{item.maxMarks} ·{' '}
                            {item.status === 'met'
                              ? 'Met'
                              : item.status === 'partial'
                                ? 'Partial'
                                : 'Missed'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Answer Recorded Successfully</p>
                      <p className="mt-0.5">
                        {activeSubmission.status === 'saved_to_drive'
                          ? 'Saved to your private Google Drive submissions folder for evaluation.'
                          : 'Recorded in your session queue. Link your Google Apps Script Web App URL to persist uploads directly into your private Drive folder.'}
                      </p>
                    </div>
                  </div>
                  {activeSubmission.typedAnswer && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {activeSubmission.typedAnswer}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
