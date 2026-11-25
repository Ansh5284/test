import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Headphones,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface PreLandingViewProps {
  onContinue: () => void;
  onGoToFeedback: () => void;
}

export function PreLandingView({ onContinue, onGoToFeedback }: PreLandingViewProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Minimal Brand Top Strip */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                CA Final Revision Hub
              </p>
              <p className="text-xs text-slate-500 leading-tight">
                Beta Mode · Active Testing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <span>Enter Revision Hub</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Welcome Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* 1 & 2: Thank You + General Overview + Beta Notice */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
          <p className="text-xs font-mono font-semibold text-[#2563EB]">
            Welcome · Beta Release (Under Active Testing)
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
            Thank you for visiting the CA Final Revision Hub.
          </h1>
          <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600">
            This web app brings together chapter-wise study modules, revision slide decks,
            infographics, ICAI suggested answers, and practice questions into one organized,
            view-only revision library with cross-chapter search. Please note that the platform is
            currently in <strong className="text-slate-900">beta mode and testing</strong>, and we
            are continuously refining the content and experience.
          </p>
        </section>

        {/* 3, 4 & 6: Subject Coverage & Upcoming Roadmap */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Coverage */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-slate-900">Current Subject Coverage</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Right now, the library primarily covers{' '}
              <strong className="text-slate-900">Financial Reporting (FR)</strong>,{' '}
              <strong className="text-slate-900">Advanced Audit</strong>, and{' '}
              <strong className="text-slate-900">Indirect Taxes (IDT)</strong>.
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-900">Advanced Financial Management (AFM)</strong> and{' '}
              <strong className="text-slate-900">Direct Taxes (DT)</strong> will be expanded and
              added moving forward.
            </p>
          </div>

          {/* Planned Expansions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-slate-900">Coming Up Next</h2>
            </div>
            <ul className="space-y-2.5 text-sm leading-relaxed text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-2 shrink-0" />
                <span>
                  <strong className="text-slate-900">Pop Quizzes &amp; Descriptive Analysis:</strong>{' '}
                  Interactive MCQ pop quizzes and descriptive question answer analysis will be
                  expanded further for exam-focused revision.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Headphones className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-slate-900">Chapter Audio Overviews:</strong> Concise audio
                  overviews for chapters will also be made available later for revision on the go.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* 5: Important Disclaimer */}
        <section
          aria-label="Important study disclaimer"
          className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 sm:p-6 flex items-start gap-3.5"
        >
          <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-950">Important Disclaimer</h2>
            <p className="text-sm leading-relaxed text-amber-900/90">
              All revision slides, infographics, and notes hosted here are personal study notes
              created with the help of AI and may contain occasional errors or omissions. They
              should <strong>not</strong> be solely relied upon for CA Final exam preparation—please
              use them strictly for <strong>quick revision purposes</strong> alongside official ICAI
              study material.
            </p>
          </div>
        </section>

        {/* 7: Feedback Request + Primary Actions */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900">Your Feedback Matters</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Whether good or bad, please take a moment to share your feedback—report any errors,
                request chapters, or suggest improvements so we can make this hub genuinely useful.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onGoToFeedback}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Leave Feedback
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              <span>Continue to Revision Hub</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      {/* 8: Explicit Credit Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p className="font-medium text-slate-700">
            Co-developed by <span className="font-semibold text-slate-900">Ansh Jain</span> and{' '}
            <span className="font-semibold text-slate-900">Gemini AI</span>.
          </p>
          <p>CA Final Revision Hub · View-Only Beta</p>
        </div>
      </footer>
    </div>
  );
}
