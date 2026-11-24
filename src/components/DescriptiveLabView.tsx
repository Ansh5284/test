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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <header className="space-y-3 border-b border-[#E5E2DA] pb-6">
        <p className="text-xs font-mono text-[#57534E]">
          Future Expansion Architecture · Drive Upload &amp; Gemini Descriptive Evaluation
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#171614]">
          Descriptive Answer Lab
        </h1>
        <p className="text-[15px] leading-relaxed text-[#57534E] max-w-3xl">
          Practice exam-style CA Final case studies by typing your response or uploading a scanned
          answer PDF. Submissions save directly to your private Google Drive folder (via Apps
          Script) so scheduled Gemini evaluation tasks can score each criterion and return detailed
          marking feedback here.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Case-Study Selector & Answer Composer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Selector */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#57534E]">Select Case-Study Question</p>
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
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-[#1D3B73] text-white border-[#1D3B73]'
                        : 'bg-white text-[#171614] border-[#E5E2DA] hover:border-[#BDB8AC]'
                    }`}
                  >
                    <p
                      className={`text-xs font-mono tabular-nums ${
                        isSelected ? 'text-white/80' : 'text-[#57534E]'
                      }`}
                    >
                      {q.subjectName} · {q.standardRef} · {q.marks} Marks · {q.recommendedMinutes}{' '}
                      min
                    </p>
                    <p className="font-serif text-base font-semibold mt-1">{q.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Prompt Card */}
          <article className="bg-white border border-[#E5E2DA] rounded-xl p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-mono text-[#1D3B73] tabular-nums">
                {activeQuestion.chapter} · {activeQuestion.marks} Marks
              </p>
              <h2 className="font-serif text-xl font-semibold text-[#171614]">
                {activeQuestion.title}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-[#292524]">{activeQuestion.prompt}</p>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="pt-4 border-t border-[#EFECE4] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div
                  role="group"
                  aria-label="Choose response format"
                  className="inline-flex items-center p-1 bg-[#F1EFE9] rounded-md border border-[#E5E2DA] self-start"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAnswerMode('typed');
                      setFormError(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                      answerMode === 'typed'
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#57534E] hover:text-[#171614]'
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                      answerMode === 'pdf'
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#57534E] hover:text-[#171614]'
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Upload Answer PDF</span>
                  </button>
                </div>

                {answerMode === 'typed' && (
                  <span className="text-xs font-mono text-[#78716C] tabular-nums">
                    {wordCount} words
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="desc-student-name"
                  className="block text-xs font-medium text-[#57534E] mb-1.5"
                >
                  Candidate Name or Roll Reference (optional)
                </label>
                <input
                  id="desc-student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Ansh Jain — May 2027"
                  className="w-full h-10 px-3.5 bg-[#FAF9F6] border border-[#D6D3CB] rounded-md text-sm text-[#171614] focus:outline-none focus:border-[#1D3B73] focus:bg-white"
                />
              </div>

              {answerMode === 'typed' ? (
                <div>
                  <label
                    htmlFor="desc-typed-answer"
                    className="block text-xs font-medium text-[#57534E] mb-1.5"
                  >
                    Your Structured Descriptive Answer
                  </label>
                  <textarea
                    id="desc-typed-answer"
                    rows={7}
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Cite the applicable Ind AS / SA paragraph, explain the principle, show working notes, and state your conclusion..."
                    className="w-full p-3.5 bg-[#FAF9F6] border border-[#D6D3CB] rounded-lg text-sm leading-relaxed text-[#171614] focus:outline-none focus:border-[#1D3B73] focus:bg-white"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="desc-pdf-upload"
                    className="block text-xs font-medium text-[#57534E]"
                  >
                    Upload Scanned Answer Sheet (PDF only, max 15 MB)
                  </label>
                  <input
                    id="desc-pdf-upload"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-[#57534E] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-[#D6D3CB] file:text-xs file:font-medium file:bg-white file:text-[#171614] hover:file:bg-[#F1EFE9]"
                  />
                  {pdfFile && (
                    <p className="text-xs font-mono text-[#166534]">
                      Selected PDF: {pdfFile.name} ({Math.max(1, Math.round(pdfFile.size / 1024))}{' '}
                      KB)
                    </p>
                  )}
                </div>
              )}

              {formError && (
                <p role="alert" className="text-xs font-medium text-[#9A3412]">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#1D3B73] rounded-md hover:bg-[#152C57] transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Answer for Evaluation'}</span>
                </button>
              </div>
            </form>
          </article>
        </div>

        {/* Right: Submitted Scripts & Evaluated Feedback Report Preview */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#E5E2DA] rounded-xl p-5 space-y-3">
            <p className="text-xs font-semibold text-[#171614] tabular-nums">
              Submitted Responses &amp; Evaluation Reports ({submissions.length})
            </p>
            <div className="space-y-2">
              {submissions.map((sub) => {
                const isSelected = sub.id === activeSubmission?.id;
                const statusText =
                  sub.status === 'evaluated_sample'
                    ? `Evaluated · ${sub.evaluation?.awardedMarks}/${sub.evaluation?.totalMarks}`
                    : sub.status === 'saved_to_drive'
                      ? 'Saved to Drive · Pending Gemini Review'
                      : 'Queued for Gemini Review';

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubmissionId(sub.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-[#FAF9F6] border-[#1D3B73]'
                        : 'bg-white border-[#EFECE4] hover:border-[#D6D3CB]'
                    }`}
                  >
                    <p className="text-xs font-medium text-[#171614] truncate">
                      {sub.questionTitle}
                    </p>
                    <p className="text-[11px] font-mono text-[#57534E] mt-1 tabular-nums">
                      {sub.mode === 'pdf' ? `PDF (${sub.pdfFileName})` : 'Typed Answer'} ·{' '}
                      {statusText}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {activeSubmission && (
            <div className="bg-white border border-[#E5E2DA] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-[#EFECE4] pb-3 space-y-1">
                <p className="text-xs font-mono text-[#1D3B73]">{activeSubmission.subjectName}</p>
                <h3 className="font-serif text-lg font-semibold text-[#171614]">
                  {activeSubmission.questionTitle}
                </h3>
                <p className="text-xs text-[#57534E]">{activeSubmission.studentName}</p>
              </div>

              {activeSubmission.evaluation ? (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-2 bg-[#F9F8F4] border border-[#E5E2DA] rounded-lg p-3.5">
                    <span className="text-xs font-semibold text-[#171614]">
                      Rubric Marks Awarded
                    </span>
                    <span className="font-mono text-lg font-semibold text-[#1D3B73] tabular-nums">
                      {activeSubmission.evaluation.awardedMarks} /{' '}
                      {activeSubmission.evaluation.totalMarks}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-[#292524]">
                    {activeSubmission.evaluation.overallSummary}
                  </p>

                  <div className="space-y-3">
                    {activeSubmission.evaluation.rubric.map((item) => (
                      <div
                        key={item.criterion}
                        className="p-3 rounded-lg border border-[#EFECE4] bg-[#FCFBFA] space-y-1"
                      >
                        <div className="flex items-baseline justify-between gap-2 text-xs">
                          <span className="font-medium text-[#171614]">{item.criterion}</span>
                          <span className="font-mono tabular-nums shrink-0 text-[#57534E]">
                            {item.awardedMarks}/{item.maxMarks} ·{' '}
                            {item.status === 'met'
                              ? 'Met'
                              : item.status === 'partial'
                                ? 'Partial'
                                : 'Missed'}
                          </span>
                        </div>
                        <p className="text-xs text-[#57534E] leading-relaxed">{item.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#ECFDF5] border border-[#BBF7D0] text-xs text-[#14532D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Answer Recorded Successfully</p>
                      <p className="mt-0.5">
                        {activeSubmission.status === 'saved_to_drive'
                          ? 'Saved to your private Google Drive submissions folder for Gemini evaluation.'
                          : 'Recorded in your session queue. Connect the free Google Apps Script endpoint to persist uploads directly into your private Google Drive folder.'}
                      </p>
                    </div>
                  </div>
                  {activeSubmission.typedAnswer && (
                    <div className="p-3.5 rounded-lg bg-[#F9F8F4] border border-[#E5E2DA] text-xs leading-relaxed text-[#292524] whitespace-pre-wrap">
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
