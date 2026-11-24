import { useEffect, useState } from 'react';
import {
  BookOpen,
  FileImage,
  Lock,
  Maximize2,
  Minimize2,
  Presentation,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ChapterGroup, RevisionArtifact } from '../types/archive';

interface ProtectedViewerModalProps {
  artifact: RevisionArtifact;
  chapter: ChapterGroup;
  onSelectArtifact: (artifact: RevisionArtifact) => void;
  onClose: () => void;
}

function IndAs115FiveStepDiagram() {
  const steps = [
    {
      num: '01',
      title: 'Identify Contract',
      note: 'Para 9: Approval, rights, payment terms, commercial substance, probable collectability',
    },
    {
      num: '02',
      title: 'Performance Obligations',
      note: 'Para 22–30: Distinct goods/services (capable of being distinct + distinct in context)',
    },
    {
      num: '03',
      title: 'Transaction Price',
      note: 'Para 47–72: Variable consideration constraint, financing component, non-cash consideration',
    },
    {
      num: '04',
      title: 'Allocate to Obligations',
      note: 'Para 73–86: Relative Standalone Selling Price (SSP); discount & variable allocation',
    },
    {
      num: '05',
      title: 'Recognize Revenue',
      note: 'Para 31–38: Transfer of Control — Over Time (3 criteria) or Point in Time',
    },
  ];

  return (
    <div className="bg-[#F9F8F4] border border-[#E5E2DA] rounded-lg p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <p className="font-mono text-xs text-[#1D3B73]">Ind AS 115 · Visual Revision Chart</p>
        <h4 className="font-serif text-xl font-semibold text-[#171614]">
          Five-Step Revenue Recognition Architecture
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-white border border-[#D6D3CB] rounded-lg p-4 flex flex-col justify-between gap-3"
          >
            <div>
              <p className="font-mono text-xs font-medium text-[#1D3B73]">Step {step.num}</p>
              <p className="font-serif text-sm font-semibold text-[#171614] mt-1">{step.title}</p>
            </div>
            <p className="text-xs leading-relaxed text-[#57534E]">{step.note}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-[#E5E2DA] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#57534E]">
        <div>
          <p className="font-semibold text-[#171614]">Principal vs Agent</p>
          <p className="mt-1">Control before transfer &rarr; Gross revenue; otherwise Net commission.</p>
        </div>
        <div>
          <p className="font-semibold text-[#171614]">Warranties</p>
          <p className="mt-1">Assurance-type &rarr; Ind AS 37 provision; Service-type &rarr; Separate PO.</p>
        </div>
        <div>
          <p className="font-semibold text-[#171614]">Contract Costs</p>
          <p className="mt-1">Incremental acquisition costs &rarr; Capitalize (exempt if &le; 1 year).</p>
        </div>
      </div>
    </div>
  );
}

export function ProtectedViewerModal({
  artifact,
  chapter,
  onSelectArtifact,
  onClose,
}: ProtectedViewerModalProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [shortcutNotice, setShortcutNotice] = useState<string | null>(null);

  useEffect(() => {
    setZoom(100);
    setImgError(false);
  }, [artifact.id]);

  // Block Save (Ctrl/Cmd+S), Print (Ctrl/Cmd+P), and handle Escape close while viewer is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        setShortcutNotice('Saving and printing are disabled for view-only revision artifacts.');
        window.setTimeout(() => setShortcutNotice(null), 3000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const siblingFiles = chapter.allArtifacts;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="protected-viewer-title"
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 bg-[#171614]/75 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-5 select-none protected-viewer-surface"
    >
      <div
        className={`bg-[#F9F8F4] border border-[#D6D3CB] rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all ${
          isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[90vh]'
        }`}
      >
        {/* Top Viewer Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-[#E5E2DA] flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#57534E]">
              <span className="inline-flex items-center gap-1 font-medium text-[#166534]">
                <Lock className="w-3 h-3" aria-hidden="true" />
                View Only — Download Disabled
              </span>
              {artifact.standards.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[#1D3B73]">{artifact.standards.join(' / ')}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="truncate">{chapter.title}</span>
            </div>
            <h2
              id="protected-viewer-title"
              className="font-serif text-lg font-semibold text-[#171614] truncate mt-0.5"
            >
              {artifact.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!artifact.drivePreviewUrl && (
              <div className="hidden sm:inline-flex items-center border border-[#E5E2DA] rounded-md bg-[#F9F8F4]">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(70, z - 15))}
                  aria-label="Zoom out"
                  className="p-2 text-[#57534E] hover:text-[#171614] transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono tabular-nums text-[#171614]">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(160, z + 15))}
                  aria-label="Zoom in"
                  className="p-2 text-[#57534E] hover:text-[#171614] transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              aria-label={isFullscreen ? 'Exit fullscreen viewer' : 'Expand viewer fullscreen'}
              className="p-2 rounded-md border border-[#E5E2DA] bg-white text-[#57534E] hover:text-[#171614] hover:bg-[#F1EFE9] transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close document viewer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#171614] bg-[#F1EFE9] hover:bg-[#E5E2DA] rounded-md transition-colors whitespace-nowrap"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {shortcutNotice && (
          <div
            role="status"
            className="px-6 py-2 bg-[#FEF3C7] border-b border-[#FDE68A] text-xs font-medium text-[#78350F]"
          >
            {shortcutNotice}
          </div>
        )}

        {/* Main Viewer Area + Sibling Chapter Sidebar */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          {/* Protected Document Viewport */}
          <div className="flex-1 min-h-0 overflow-auto relative bg-[#EFECE4] p-3 sm:p-6">
            {artifact.drivePreviewUrl ? (
              /* Live Google Drive Streamed Embed (No file size limit, zero download button) */
              <div className="relative w-full h-full min-h-[520px] bg-white rounded-lg overflow-hidden border border-[#D6D3CB]">
                <iframe
                  title={artifact.title}
                  src={artifact.drivePreviewUrl}
                  className="w-full h-full border-0"
                  allow="autoplay"
                  sandbox="allow-scripts allow-same-origin"
                />
                {/* Protective transparent shield over Drive iframe top-right pop-out corner */}
                <div
                  aria-hidden="true"
                  title="External pop-out and download are disabled"
                  onContextMenu={(e) => e.preventDefault()}
                  className="absolute top-0 right-0 w-20 h-14 bg-transparent cursor-not-allowed z-10"
                />
              </div>
            ) : (
              /* Deterministic Demo Study Reader (modules, slides, and high-res infographics) */
              <div
                className="mx-auto max-w-4xl bg-white border border-[#D6D3CB] rounded-lg p-6 sm:p-10 space-y-6 transition-transform origin-top"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <div className="border-b border-[#E5E2DA] pb-5 space-y-2">
                  <p className="font-mono text-xs text-[#57534E]">
                    {artifact.folderBreadcrumb.join(' / ')} · {artifact.rawFileName}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-[#171614]">
                    {artifact.title}
                  </h3>
                  {artifact.demoContent?.summary && (
                    <p className="text-sm leading-relaxed text-[#57534E]">
                      {artifact.demoContent.summary}
                    </p>
                  )}
                </div>

                {artifact.demoContent?.keyFormulaOrProvision && (
                  <div className="p-4 rounded-lg bg-[#F9F8F4] border border-[#E5E2DA]">
                    <p className="text-xs font-semibold text-[#1D3B73] mb-1">
                      Core Provision / Formula
                    </p>
                    <p className="font-mono text-xs sm:text-sm text-[#171614] leading-relaxed">
                      {artifact.demoContent.keyFormulaOrProvision}
                    </p>
                  </div>
                )}

                {artifact.demoContent?.svgDiagramId === 'indas115_five_step' && (
                  <IndAs115FiveStepDiagram />
                )}

                {artifact.demoContent?.imageUrl && !imgError && (
                  <figure className="space-y-2">
                    <div className="rounded-lg overflow-hidden border border-[#E5E2DA] bg-[#F9F8F4]">
                      <img
                        src={artifact.demoContent.imageUrl}
                        alt={artifact.title}
                        draggable={false}
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className="w-full h-auto object-contain pointer-events-none"
                      />
                    </div>
                    <figcaption className="text-xs text-[#57534E] font-serif italic text-center">
                      View-only revision figure · Right-click and image saving disabled
                    </figcaption>
                  </figure>
                )}

                {artifact.demoContent?.sections && artifact.demoContent.sections.length > 0 && (
                  <div className="space-y-6">
                    {artifact.demoContent.sections.map((sec) => (
                      <section key={sec.heading} className="space-y-2.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="font-serif text-lg font-semibold text-[#171614]">
                            {sec.heading}
                          </h4>
                          {sec.standardNote && (
                            <span className="font-mono text-xs text-[#1D3B73]">
                              {sec.standardNote}
                            </span>
                          )}
                        </div>
                        <ul className="space-y-2 pl-5 list-disc text-sm leading-relaxed text-[#292524]">
                          {sec.points.map((pt) => (
                            <li key={pt}>{pt}</li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-[#EFECE4] text-xs text-[#78716C] flex flex-wrap items-center justify-between gap-2">
                  <span>
                    When connected to Google Drive, full PDFs &amp; slides stream directly here with
                    no file size cap.
                  </span>
                  <span className="font-mono">VIEW-ONLY MODE</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Companion Rail: Switch between same-chapter Module / Slides / Infographic */}
          {siblingFiles.length > 1 && (
            <aside
              aria-label="Related files in this chapter"
              className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#E5E2DA] bg-white p-4 overflow-y-auto shrink-0 space-y-3"
            >
              <div>
                <p className="text-xs font-semibold text-[#171614]">In This Chapter</p>
                <p className="text-xs text-[#57534E] mt-0.5 truncate">{chapter.title}</p>
              </div>
              <div className="space-y-2">
                {siblingFiles.map((sib) => {
                  const isCurrent = sib.id === artifact.id;
                  return (
                    <button
                      key={sib.id}
                      type="button"
                      onClick={() => onSelectArtifact(sib)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-2.5 ${
                        isCurrent
                          ? 'bg-[#1D3B73] text-white border-[#1D3B73]'
                          : 'bg-[#FAF9F6] text-[#171614] border-[#E5E2DA] hover:border-[#BDB8AC]'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0" aria-hidden="true">
                        {sib.category === 'module' ? (
                          <BookOpen className="w-3.5 h-3.5" />
                        ) : sib.category === 'infographic' ? (
                          <FileImage className="w-3.5 h-3.5" />
                        ) : (
                          <Presentation className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium leading-snug line-clamp-2">
                          {sib.title}
                        </span>
                        <span
                          className={`block text-[11px] mt-0.5 ${
                            isCurrent ? 'text-white/75' : 'text-[#78716C]'
                          }`}
                        >
                          {sib.category === 'module'
                            ? 'Study Module'
                            : sib.category === 'infographic'
                              ? 'Infographic'
                              : 'Revision Slides'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
