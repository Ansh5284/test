import { useState, type FormEvent } from 'react';
import { CheckCircle2, Lock, Send } from 'lucide-react';
import { SUBJECTS } from '../config/driveConfig';
import {
  submitFeedbackToPrivateSheet,
  validateFeedbackInput,
  type FeedbackInput,
} from '../services/feedbackService';
import type { FeedbackSubmission } from '../types/archive';

const CATEGORIES = [
  'Chapter / Standard Request',
  'Revision Slide or Infographic Feedback',
  'Correction / Typo Report',
  'Website Usability Suggestion',
  'General Appreciation',
];

const ATTEMPT_OPTIONS = ['May 2027', 'Nov 2027', 'May 2028', 'Self-Paced / Qualified'];

export function FeedbackView() {
  const [form, setForm] = useState<FeedbackInput>({
    name: '',
    attempt: 'May 2027',
    subject: 'General Website',
    rating: 5,
    category: CATEGORIES[0],
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FeedbackInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<FeedbackSubmission[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateFeedbackInput(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const receipt = await submitFeedbackToPrivateSheet(form);
      setRecentSubmissions((prev) => [receipt, ...prev]);
      setForm((prev) => ({
        ...prev,
        message: '',
      }));
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to send feedback right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-xs font-mono font-medium text-[#2563EB]">
          Private Curator Log · Write-Only Submission to Restricted Google Sheet
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Share Your Views &amp; Suggestions
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-2xl">
          Request missing Ind AS or SA revision charts, report any correction, or suggest features
          for upcoming MCQ quizzes and descriptive tests. Responses are appended directly to the
          owner&apos;s private Google Sheet, which is never shared publicly.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Feedback Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fb-name"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Your Name (optional)
              </label>
              <input
                id="fb-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Leave blank to stay anonymous"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="fb-attempt"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Target CA Final Attempt
              </label>
              <select
                id="fb-attempt"
                value={form.attempt}
                onChange={(e) => setForm({ ...form, attempt: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
              >
                {ATTEMPT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fb-subject"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Subject / Section
              </label>
              <select
                id="fb-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
              >
                <option value="General Website">General Website</option>
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="fb-category"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Feedback Category
              </label>
              <select
                id="fb-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Rating Selector */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-slate-700">
              How helpful is the revision hub? (1 = Needs work, 5 = Very helpful)
            </legend>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = form.rating === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setForm({ ...form, rating: value })}
                    className={`w-11 h-10 rounded-xl border font-mono text-sm font-semibold tabular-nums transition-colors ${
                      isSelected
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            {errors.rating && (
              <p role="alert" className="text-xs text-red-600">
                {errors.rating}
              </p>
            )}
          </fieldset>

          <div>
            <label
              htmlFor="fb-message"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Your Views or Request (required)
            </label>
            <textarea
              id="fb-message"
              rows={5}
              required
              value={form.message}
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: undefined });
              }}
              placeholder="Tell us which chapters, Ind AS / SA summaries, or features would help your CA Final revision most..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
            />
            {errors.message && (
              <p role="alert" className="text-xs font-medium text-red-600 mt-1.5">
                {errors.message}
              </p>
            )}
          </div>

          {submitError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800 leading-relaxed"
            >
              {submitError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Submitted responses are private to the curator only.</span>
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>

        {/* Right Side: Privacy Guarantee & Session Receipts */}
        <aside className="lg:col-span-4 space-y-5">
          {recentSubmissions.length > 0 && (
            <div
              aria-live="polite"
              className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Feedback Logged ({recentSubmissions.length})</span>
              </div>
              <div className="space-y-3 divide-y divide-slate-100">
                {recentSubmissions.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 space-y-1 text-xs">
                    <p className="font-semibold text-slate-900">
                      {item.subject} · {item.rating}/5 · {item.category}
                    </p>
                    <p className="text-slate-600 line-clamp-3">{item.message}</p>
                    <p className="text-[11px] font-mono text-slate-400">
                      {item.deliveryMode === 'apps_script_sheet'
                        ? 'Verified & appended to private Google Sheet'
                        : 'Confirmed in preview mode (link Apps Script URL to append live)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
