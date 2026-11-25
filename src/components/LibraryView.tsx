import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Eye,
  FileText,
  FolderOpen,
  LayoutGrid,
  LogOut,
  MonitorPlay,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import type {
  ChapterGroup,
  RevisionArtifact,
  SubjectArchive,
  SubjectId,
} from '../types/archive';
import {
  matchesArtifactFilter,
  searchArchives,
  type ArtifactFilterMode,
} from '../utils/searchEngine';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LibraryViewProps {
  archives: SubjectArchive[];
  selectedSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onOpenArtifact: (artifact: RevisionArtifact, chapter: ChapterGroup) => void;
  isSyncingDrive: boolean;
  driveError: string | null;
  connectedUserEmail: string | null;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  onRefreshDrive: () => void;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return 'Streamed';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatChapterSidebarTitle(chapter: ChapterGroup): string {
  if (chapter.sectionKind !== 'chapter') return chapter.title;
  if (chapter.chapterNumber !== null) {
    const prefix = chapter.partLabel?.includes('Part B')
      ? `Part B · Ch ${chapter.chapterNumber}`
      : `Ch ${chapter.chapterNumber}`;
    return `${prefix}. ${chapter.title}`;
  }
  return chapter.title;
}

function formatChapterHeading(chapter: ChapterGroup): string {
  if (chapter.sectionKind !== 'chapter') return chapter.title;
  if (chapter.chapterNumber !== null) {
    return `Chapter ${chapter.chapterNumber}. ${chapter.title}`;
  }
  return chapter.title;
}

function getCategoryVisualStyle(category: RevisionArtifact['category']): {
  boxClass: string;
  label: string;
} {
  switch (category) {
    case 'slides':
      return { boxClass: 'bg-indigo-50 text-indigo-600', label: 'Slide deck' };
    case 'infographic':
      return { boxClass: 'bg-emerald-50 text-emerald-600', label: 'Infographic' };
    case 'practice_qa':
      return { boxClass: 'bg-amber-50 text-amber-600', label: 'Practice Q&A' };
    case 'suggested_answers':
      return { boxClass: 'bg-slate-100 text-slate-700', label: 'Suggested Answers' };
    default:
      return { boxClass: 'bg-[#EFF6FF] text-[#2563EB]', label: 'Module & notes' };
  }
}

function CategoryGlyph({
  category,
  className = 'w-5 h-5',
}: {
  category: RevisionArtifact['category'];
  className?: string;
}) {
  if (category === 'slides') {
    return <MonitorPlay className={className} aria-hidden="true" />;
  }
  if (category === 'infographic') {
    return <BarChart3 className={className} aria-hidden="true" />;
  }
  if (category === 'practice_qa') {
    return <ClipboardCheck className={className} aria-hidden="true" />;
  }
  if (category === 'module' || category === 'suggested_answers') {
    return <BookOpen className={className} aria-hidden="true" />;
  }
  return <FileText className={className} aria-hidden="true" />;
}

interface MaterialCardProps {
  artifact: RevisionArtifact;
  chapter: ChapterGroup;
  onPreview: (artifact: RevisionArtifact, chapter: ChapterGroup) => void;
  variant?: 'default' | 'related';
}

function MaterialCard({ artifact, chapter, onPreview, variant = 'default' }: MaterialCardProps) {
  const visual = getCategoryVisualStyle(artifact.category);
  const sizeLabel = formatFileSize(artifact.sizeBytes);

  return (
    <div
      className={`bg-white border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-sm ${
        variant === 'related'
          ? 'border-slate-200/90 hover:border-blue-200'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visual.boxClass}`}
        >
          <CategoryGlyph category={artifact.category} className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4
            title={artifact.title}
            className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2"
          >
            {artifact.title}
          </h4>
          <p className="text-xs text-slate-500 mt-1 tabular-nums truncate">
            <span>{visual.label}</span>
            <span aria-hidden="true"> · </span>
            <span className="font-mono">{sizeLabel}</span>
            {artifact.subTopic ? ` · ${artifact.subTopic}` : ''}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onPreview(artifact, chapter)}
        aria-label={`Preview ${artifact.title}`}
        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
          variant === 'related'
            ? 'bg-slate-50 hover:bg-[#EFF6FF] text-[#2563EB] border border-slate-200 hover:border-blue-200'
            : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
        }`}
      >
        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Preview</span>
      </button>
    </div>
  );
}

export function LibraryView({
  archives,
  selectedSubjectId,
  onSelectSubject,
  searchQuery,
  onSearchQueryChange,
  onOpenArtifact,
  isSyncingDrive,
  driveError,
  connectedUserEmail,
  onSignInGoogle,
  onSignOutGoogle,
  onRefreshDrive,
}: LibraryViewProps) {
  const [selectedChapterKey, setSelectedChapterKey] = useState<string>('all');
  const [artifactFilter, setArtifactFilter] = useState<ArtifactFilterMode>('all');
  const [searchSubjectScope, setSearchSubjectScope] = useState<SubjectId | 'all'>('all');

  // Reset selected chapter whenever switching subjects
  useEffect(() => {
    setSelectedChapterKey('all');
    setArtifactFilter('all');
  }, [selectedSubjectId]);

  const activeArchive = useMemo(
    () => archives.find((a) => a.meta.id === selectedSubjectId) || archives[0],
    [archives, selectedSubjectId],
  );

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return searchArchives(archives, searchQuery, {
      subjectFilter: searchSubjectScope,
      artifactFilter,
    });
  }, [archives, isSearching, searchQuery, searchSubjectScope, artifactFilter]);

  // Split sidebar entries into real syllabus Chapters vs Exam/Practice sections
  const { syllabusChapters, resourceSections } = useMemo(() => {
    const syllabus: ChapterGroup[] = [];
    const resources: ChapterGroup[] = [];
    for (const ch of activeArchive.chapters) {
      if (ch.sectionKind === 'chapter') {
        syllabus.push(ch);
      } else {
        resources.push(ch);
      }
    }
    return { syllabusChapters: syllabus, resourceSections: resources };
  }, [activeArchive.chapters]);

  // Filter counts computed dynamically for the currently active scope (all chapters OR selected chapter)
  const scopedChapters = useMemo(() => {
    if (selectedChapterKey === 'all') return activeArchive.chapters;
    return activeArchive.chapters.filter((ch) => ch.chapterKey === selectedChapterKey);
  }, [activeArchive.chapters, selectedChapterKey]);

  const filterCounts = useMemo(() => {
    let all = 0;
    let slides = 0;
    let infographic = 0;
    let moduleCount = 0;
    let practiceQa = 0;

    for (const ch of scopedChapters) {
      for (const art of ch.allArtifacts) {
        all += 1;
        if (art.category === 'slides') slides += 1;
        else if (art.category === 'infographic') infographic += 1;
        else if (art.category === 'module' || art.category === 'suggested_answers') moduleCount += 1;
        else if (art.category === 'practice_qa') practiceQa += 1;
      }
    }

    return {
      all,
      slides,
      infographic,
      module: moduleCount,
      practice_qa: practiceQa,
    };
  }, [scopedChapters]);

  const visibleChapters = useMemo(() => {
    return scopedChapters
      .map((ch) => {
        const filteredArtifacts = ch.allArtifacts.filter((a) =>
          matchesArtifactFilter(a, artifactFilter),
        );
        return { chapter: ch, filteredArtifacts };
      })
      .filter((entry) => entry.filteredArtifacts.length > 0);
  }, [scopedChapters, artifactFilter]);

  const filterButtons: Array<{
    id: ArtifactFilterMode;
    label: string;
    count: number;
    icon: typeof LayoutGrid;
  }> = [
    { id: 'all', label: 'All', count: filterCounts.all, icon: LayoutGrid },
    { id: 'slides', label: 'Slide decks', count: filterCounts.slides, icon: MonitorPlay },
    { id: 'infographic', label: 'Infographics', count: filterCounts.infographic, icon: BarChart3 },
    { id: 'module', label: 'Modules & notes', count: filterCounts.module, icon: BookOpen },
    { id: 'practice_qa', label: 'Practice Q&A', count: filterCounts.practice_qa, icon: ClipboardCheck },
  ];

  const isLiveDrive =
    activeArchive.source === 'drive_public' || activeArchive.source === 'drive_oauth';

  return (
    <div className="min-h-full">
      {/* Subject Switcher & Drive Sync Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* 5 Subject Tabs */}
          <div
            role="tablist"
            aria-label="CA Final Subjects"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1"
          >
            {archives.map((archive) => {
              const isSelected = archive.meta.id === activeArchive.meta.id;
              return (
                <button
                  key={archive.meta.id}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectSubject(archive.meta.id);
                    if (isSearching) onSearchQueryChange('');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{archive.meta.name}</span>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {archive.totalArtifacts}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: View-Only Assurance & Drive Connection */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View-only · No downloads</span>
            </span>

            {connectedUserEmail ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRefreshDrive}
                  disabled={isSyncingDrive}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span>{isSyncingDrive ? 'Syncing...' : 'Refresh Drive'}</span>
                </button>
                <button
                  type="button"
                  onClick={onSignOutGoogle}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : !isLiveDrive ? (
              <GoogleSignInButton
                onClick={onSignInGoogle}
                disabled={isSyncingDrive}
                label={isSyncingDrive ? 'Connecting...' : 'Connect Drive'}
              />
            ) : (
              <button
                type="button"
                onClick={onRefreshDrive}
                disabled={isSyncingDrive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>{isSyncingDrive ? 'Syncing...' : 'Sync Drive'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {driveError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div
            role="alert"
            className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900"
          >
            Drive sync notice: {driveError}
          </div>
        </div>
      )}

      {/* MAIN CONTENT: GLOBAL SEARCH RESULTS OR 2-COLUMN FR-REVISIONS WORKSPACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isSearching ? (
          <section aria-label="Search results" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Search results for &ldquo;{searchQuery.trim()}&rdquo;
                </h1>
                <p className="text-sm text-slate-500 mt-1 tabular-nums">
                  {searchResults.length}{' '}
                  {searchResults.length === 1 ? 'chapter matched' : 'chapters matched'} — all
                  companion materials from each matched chapter are shown alongside.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label htmlFor="search-subject-filter" className="sr-only">
                  Filter search by subject
                </label>
                <select
                  id="search-subject-filter"
                  value={searchSubjectScope}
                  onChange={(e) => setSearchSubjectScope(e.target.value as SubjectId | 'all')}
                  className="h-9 px-3 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="all">All 5 Subjects</option>
                  {archives.map((a) => (
                    <option key={a.meta.id} value={a.meta.id}>
                      {a.meta.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    onSearchQueryChange('');
                    setSearchSubjectScope('all');
                    setArtifactFilter('all');
                  }}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Clear search</span>
                </button>
              </div>
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                <p className="text-lg font-bold text-slate-900">
                  No matching chapters, standards, or files found
                </p>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Try searching a standard code like <span className="font-mono">Ind AS 115</span>,{' '}
                  <span className="font-mono">SA 315</span>, or a topic such as{' '}
                  <span className="font-mono">Leases</span> or{' '}
                  <span className="font-mono">Business Combinations</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSearchQueryChange('');
                    setSearchSubjectScope('all');
                    setArtifactFilter('all');
                  }}
                  className="mt-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors"
                >
                  Back to all chapters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {searchResults.map((group) => (
                  <article
                    key={`${group.subjectId}-${group.chapter.chapterKey}`}
                    className="space-y-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div>
                        <p className="text-xs font-medium text-[#2563EB]">
                          {group.subjectName}
                          {group.chapter.standards.length > 0 && (
                            <span className="text-slate-400 font-mono">
                              {' '}
                              · {group.chapter.standards.join(' / ')}
                            </span>
                          )}
                        </p>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          {formatChapterHeading(group.chapter)}
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        {group.matchedArtifacts.length} direct ·{' '}
                        {group.relatedChapterArtifacts.length} related
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.matchedArtifacts.map((artifact) => (
                        <MaterialCard
                          key={artifact.id}
                          artifact={artifact}
                          chapter={group.chapter}
                          onPreview={onOpenArtifact}
                        />
                      ))}
                    </div>

                    {group.relatedChapterArtifacts.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <p className="text-xs font-semibold text-slate-500">
                          Other materials in this chapter ({group.relatedChapterArtifacts.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.relatedChapterArtifacts.map((sibling) => (
                            <MaterialCard
                              key={sibling.id}
                              artifact={sibling}
                              chapter={group.chapter}
                              onPreview={onOpenArtifact}
                              variant="related"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* 2-COLUMN FR-REVISIONS LAYOUT: STICKY LEFT CHAPTER SIDEBAR + RIGHT FILTER BAR & 3-COL CARD GRID */
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* LEFT SIDEBAR (Desktop) */}
            <aside
              aria-label="Chapters navigation"
              className="hidden lg:block w-64 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Chapters
              </p>

              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedChapterKey('all')}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                    selectedChapterKey === 'all'
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">All chapters</span>
                  <span
                    className={`text-xs font-mono tabular-nums shrink-0 ${
                      selectedChapterKey === 'all' ? 'text-[#2563EB]' : 'text-slate-400'
                    }`}
                  >
                    {activeArchive.totalArtifacts}
                  </span>
                </button>

                {syllabusChapters.map((ch) => {
                  const isActive = selectedChapterKey === ch.chapterKey;
                  const label = formatChapterSidebarTitle(ch);
                  return (
                    <button
                      key={ch.chapterKey}
                      type="button"
                      title={label}
                      onClick={() => setSelectedChapterKey(ch.chapterKey)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      <span
                        className={`text-xs font-mono tabular-nums shrink-0 ${
                          isActive ? 'text-[#2563EB]' : 'text-slate-400'
                        }`}
                      >
                        {ch.allArtifacts.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {resourceSections.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-200 space-y-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                    Exam &amp; Practice
                  </p>
                  {resourceSections.map((sec) => {
                    const isActive = selectedChapterKey === sec.chapterKey;
                    return (
                      <button
                        key={sec.chapterKey}
                        type="button"
                        title={sec.title}
                        onClick={() => setSelectedChapterKey(sec.chapterKey)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                          isActive
                            ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{sec.title}</span>
                        <span
                          className={`text-xs font-mono tabular-nums shrink-0 ${
                            isActive ? 'text-[#2563EB]' : 'text-slate-400'
                          }`}
                        >
                          {sec.allArtifacts.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>

            {/* RIGHT MAIN CONTENT PANE */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              {/* Mobile Chapter Selector */}
              {activeArchive.chapters.length > 0 && (
                <div className="lg:hidden">
                  <label htmlFor="mobile-chapter-select" className="sr-only">
                    Jump to chapter
                  </label>
                  <select
                    id="mobile-chapter-select"
                    value={selectedChapterKey}
                    onChange={(e) => setSelectedChapterKey(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="all">
                      All chapters ({activeArchive.totalArtifacts} items)
                    </option>
                    {activeArchive.chapters.map((ch) => (
                      <option key={ch.chapterKey} value={ch.chapterKey}>
                        {formatChapterSidebarTitle(ch)} ({ch.allArtifacts.length})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Interactive Category Filter Row (matching fr-revisions) */}
              {activeArchive.totalArtifacts > 0 && (
                <div
                  role="group"
                  aria-label="Filter materials by type"
                  className="flex flex-wrap items-center gap-2"
                >
                  {filterButtons.map((btn) => {
                    const Icon = btn.icon;
                    const isActive = artifactFilter === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setArtifactFilter(btn.id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                          isActive
                            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`}
                          aria-hidden="true"
                        />
                        <span>{btn.label}</span>
                        <span
                          className={`text-xs font-mono tabular-nums ${
                            isActive ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {btn.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty Folder State OR Chapter Sections */}
              {activeArchive.chapters.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] mx-auto flex items-center justify-center">
                    <FolderOpen className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <h2 className="text-lg font-bold text-slate-900">
                      {activeArchive.meta.name} folder is ready for materials
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-500">
                      As soon as modules, revision slides, infographics, or practice papers are
                      added to this Google Drive folder, they will organize chapter-wise here
                      automatically.
                    </p>
                  </div>
                </div>
              ) : visibleChapters.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                  <p className="text-base font-semibold text-slate-900">
                    No materials match this filter in the selected view
                  </p>
                  <button
                    type="button"
                    onClick={() => setArtifactFilter('all')}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors"
                  >
                    Show all materials
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  {visibleChapters.map(({ chapter, filteredArtifacts }) => {
                    const modGroup = filteredArtifacts.filter(
                      (a) => a.category === 'module' || a.category === 'suggested_answers',
                    );
                    const slideGroup = filteredArtifacts.filter((a) => a.category === 'slides');
                    const infoGroup = filteredArtifacts.filter((a) => a.category === 'infographic');
                    const practiceGroup = filteredArtifacts.filter(
                      (a) => a.category === 'practice_qa',
                    );
                    const otherGroup = filteredArtifacts.filter((a) => a.category === 'other');

                    const subGroups: Array<{
                      key: string;
                      label: string;
                      icon: typeof BookOpen;
                      items: RevisionArtifact[];
                    }> = [
                      {
                        key: 'modules',
                        label:
                          chapter.sectionKind === 'suggested_answers'
                            ? 'ICAI Suggested Answers'
                            : 'Modules & notes',
                        icon: BookOpen,
                        items: modGroup,
                      },
                      {
                        key: 'slides',
                        label: 'Slide decks',
                        icon: MonitorPlay,
                        items: slideGroup,
                      },
                      {
                        key: 'infographics',
                        label: 'Infographics',
                        icon: BarChart3,
                        items: infoGroup,
                      },
                      {
                        key: 'practice',
                        label: 'Practice Q&A',
                        icon: ClipboardCheck,
                        items: practiceGroup,
                      },
                      {
                        key: 'other',
                        label: 'Additional resources',
                        icon: FileText,
                        items: otherGroup,
                      },
                    ].filter((g) => g.items.length > 0);

                    return (
                      <section
                        key={chapter.chapterKey}
                        aria-labelledby={`ch-heading-${chapter.chapterKey}`}
                        className="space-y-4"
                      >
                        {/* Chapter Header */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                            <h2
                              id={`ch-heading-${chapter.chapterKey}`}
                              className="text-xl font-bold text-slate-900 tracking-tight"
                            >
                              {formatChapterHeading(chapter)}
                            </h2>
                            {chapter.partLabel && (
                              <span className="text-xs font-medium text-[#2563EB]">
                                {chapter.partLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums">
                            <span>
                              {filteredArtifacts.length}{' '}
                              {filteredArtifacts.length === 1 ? 'item' : 'items'}
                            </span>
                            {chapter.standards.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-slate-600">
                                  {chapter.standards.slice(0, 6).join(' / ')}
                                </span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Material Grid: unified 3-column grid for compact chapters, sub-grouped headers for large chapters */}
                        {subGroups.length <= 1 || filteredArtifacts.length <= 6 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredArtifacts.map((artifact) => (
                              <MaterialCard
                                key={artifact.id}
                                artifact={artifact}
                                chapter={chapter}
                                onPreview={onOpenArtifact}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {subGroups.map((sg) => {
                              const SubIcon = sg.icon;
                              return (
                                <div key={sg.key} className="space-y-3">
                                  <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <SubIcon
                                      className="w-3.5 h-3.5 text-slate-400"
                                      aria-hidden="true"
                                    />
                                    <span>
                                      {sg.label} ({sg.items.length})
                                    </span>
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {sg.items.map((artifact) => (
                                      <MaterialCard
                                        key={artifact.id}
                                        artifact={artifact}
                                        chapter={chapter}
                                        onPreview={onOpenArtifact}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
