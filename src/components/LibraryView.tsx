import { useMemo, useState, type RefObject } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  FileImage,
  FileText,
  FolderOpen,
  LogOut,
  Presentation,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import heroDeskUrl from '../assets/images/hero_archive_desk_1795518304908.jpg';
import type {
  ChapterGroup,
  RevisionArtifact,
  SubjectArchive,
  SubjectId,
} from '../types/archive';
import { searchArchives, type ArtifactFilterMode } from '../utils/searchEngine';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LibraryViewProps {
  archives: SubjectArchive[];
  selectedSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onOpenArtifact: (artifact: RevisionArtifact, chapter: ChapterGroup) => void;
  isSyncingDrive: boolean;
  driveError: string | null;
  connectedUserEmail: string | null;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  onRefreshDrive: () => void;
}

const QUICK_SEARCH_EXAMPLES = ['Ind AS 115', 'SA 315', 'Option Payoff', 'CARO 2020', 'Ind AS 116'];

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return 'Streamed directly';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function getCategoryLabel(category: RevisionArtifact['category']): string {
  switch (category) {
    case 'module':
      return 'Study Module';
    case 'slides':
      return 'Revision Slides';
    case 'infographic':
      return 'Infographic Chart';
    default:
      return 'Study Resource';
  }
}

function ArtifactIcon({ category }: { category: RevisionArtifact['category'] }) {
  if (category === 'module') {
    return <BookOpen className="w-4 h-4 text-[#1D3B73] shrink-0" aria-hidden="true" />;
  }
  if (category === 'infographic') {
    return <FileImage className="w-4 h-4 text-[#166534] shrink-0" aria-hidden="true" />;
  }
  if (category === 'slides') {
    return <Presentation className="w-4 h-4 text-[#78350F] shrink-0" aria-hidden="true" />;
  }
  return <FileText className="w-4 h-4 text-[#57534E] shrink-0" aria-hidden="true" />;
}

export function LibraryView({
  archives,
  selectedSubjectId,
  onSelectSubject,
  searchQuery,
  onSearchQueryChange,
  searchInputRef,
  onOpenArtifact,
  isSyncingDrive,
  driveError,
  connectedUserEmail,
  onSignInGoogle,
  onSignOutGoogle,
  onRefreshDrive,
}: LibraryViewProps) {
  const [artifactFilter, setArtifactFilter] = useState<ArtifactFilterMode>('all');
  const [searchSubjectScope, setSearchSubjectScope] = useState<SubjectId | 'all'>('all');
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [heroImgFailed, setHeroImgFailed] = useState(false);

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

  const totalChaptersCount = useMemo(
    () => archives.reduce((sum, a) => sum + a.chapters.length, 0),
    [archives],
  );

  const totalFilesCount = useMemo(
    () => archives.reduce((sum, a) => sum + a.totalArtifacts, 0),
    [archives],
  );

  const toggleChapter = (key: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const dataSourceSummary = useMemo(() => {
    const firstSource = archives[0]?.source;
    if (firstSource === 'drive_oauth') {
      return `Live Google Drive synced (${connectedUserEmail || 'Owner account'})`;
    }
    if (firstSource === 'drive_public') {
      return 'Live Google Drive API connected (Public read-only folders)';
    }
    return 'Preview Catalog active — connect Google Drive or add your Drive API key to stream live folders';
  }, [archives, connectedUserEmail]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Editorial 2-Column Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs font-medium text-[#57534E] tracking-wide">
              CA Final Revision Library · Five Subject Compendium · View-Only Archive
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.12] tracking-tight text-[#171614]">
              Chapter-wise study modules, revision slides, and charts in one reading room.
            </h1>
            <p className="text-[15px] sm:text-base leading-relaxed text-[#57534E] max-w-2xl">
              Search any chapter, accounting or auditing standard, or file name across all five
              papers. Matching any single document automatically surfaces every companion module
              and infographic in that chapter.
            </p>
          </div>

          {/* Primary Smart Search Control */}
          <div className="space-y-3">
            <label htmlFor="archive-global-search" className="sr-only">
              Search by chapter, Ind AS or SA standard, or file name
            </label>
            <div className="relative flex items-center">
              <Search
                className="w-4 h-4 text-[#78716C] absolute left-4 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                id="archive-global-search"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search chapter, standard (Ind AS 115, SA 315), or file..."
                className={`w-full h-12 pl-11 ${
                  searchQuery ? 'pr-20' : 'pr-4 sm:pr-12'
                } bg-white border border-[#D6D3CB] rounded-lg text-sm text-[#171614] placeholder:text-[#78716C] focus:outline-none focus:border-[#1D3B73] focus:ring-2 focus:ring-[#1D3B73]/15 transition-all`}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  aria-label="Clear search query"
                  className="absolute right-3 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#57534E] hover:text-[#171614] rounded hover:bg-[#F1EFE9] transition-colors"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              ) : (
                <span
                  aria-hidden="true"
                  className="hidden sm:inline-block absolute right-3.5 font-mono text-[11px] text-[#78716C] border border-[#E5E2DA] rounded px-1.5 py-0.5 bg-[#F9F8F4]"
                >
                  /
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#57534E]">
              <span>Quick lookup:</span>
              {QUICK_SEARCH_EXAMPLES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSearchQueryChange(term)}
                  className="font-mono text-[#1D3B73] hover:underline underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#1D3B73]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editorial Focal Image */}
        <div className="lg:col-span-5">
          <div className="h-full min-h-[240px] rounded-xl overflow-hidden border border-[#E5E2DA] bg-[#EBE6DF] relative">
            {!heroImgFailed ? (
              <img
                src={heroDeskUrl}
                alt="Open financial accounting ledger, brass bookmark, fountain pen, and revision notebooks on a warm stone study desk"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#EFECE4] to-[#E3DEC9]">
                <BookOpen className="w-10 h-10 text-[#1D3B73] mb-3" aria-hidden="true" />
                <p className="font-serif text-lg text-[#171614]">CA Final Revision Vault</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Operational Utility & Drive Sync Strip */}
      <section
        aria-label="Archive summary and Google Drive connection"
        className="border-y border-[#E5E2DA] py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#57534E] font-mono tabular-nums">
            <span>5 Subjects</span>
            <span aria-hidden="true">·</span>
            <span>{totalChaptersCount} Chapters Indexed</span>
            <span aria-hidden="true">·</span>
            <span>{totalFilesCount} View-Only Artifacts</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-[#166534] font-sans font-medium">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Downloads Disabled
            </span>
          </div>
          <p className="text-xs text-[#57534E]">{dataSourceSummary}</p>
          {driveError && (
            <p role="alert" className="text-xs text-[#9A3412] font-medium">
              Drive sync notice: {driveError}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {connectedUserEmail ? (
            <>
              <button
                type="button"
                onClick={onRefreshDrive}
                disabled={isSyncingDrive}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#171614] bg-white border border-[#D6D3CB] rounded-md hover:bg-[#F1EFE9] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>{isSyncingDrive ? 'Syncing Drive...' : 'Refresh Drive'}</span>
              </button>
              <button
                type="button"
                onClick={onSignOutGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#57534E] hover:text-[#171614] rounded-md hover:bg-[#F1EFE9] transition-colors whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <GoogleSignInButton
              onClick={onSignInGoogle}
              disabled={isSyncingDrive}
              label={isSyncingDrive ? 'Connecting Drive...' : 'Connect Google Drive'}
            />
          )}
        </div>
      </section>

      {/* CONDITIONAL MAIN CONTENT: SMART SEARCH RESULTS vs SUBJECT CHAPTER DIRECTORY */}
      {isSearching ? (
        <section aria-label="Search results" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#171614]">
                Search Results for &ldquo;{searchQuery.trim()}&rdquo;
              </h2>
              <p className="text-sm text-[#57534E] mt-1 tabular-nums">
                {searchResults.length}{' '}
                {searchResults.length === 1 ? 'chapter matched' : 'chapters matched'} — companion
                chapter files are automatically shown with every matched file.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="search-subject-filter" className="sr-only">
                Filter search by subject
              </label>
              <select
                id="search-subject-filter"
                value={searchSubjectScope}
                onChange={(e) => setSearchSubjectScope(e.target.value as SubjectId | 'all')}
                className="h-9 px-3 text-xs font-medium bg-white border border-[#D6D3CB] rounded-md text-[#171614] focus:outline-none focus:border-[#1D3B73]"
              >
                <option value="all">All 5 Subjects</option>
                {archives.map((a) => (
                  <option key={a.meta.id} value={a.meta.id}>
                    {a.meta.name}
                  </option>
                ))}
              </select>

              <div
                role="group"
                aria-label="Filter by artifact type"
                className="inline-flex items-center p-1 bg-[#F1EFE9] rounded-md border border-[#E5E2DA]"
              >
                {(
                  [
                    { id: 'all', label: 'All Types' },
                    { id: 'module', label: 'Modules' },
                    { id: 'visuals', label: 'Slides & Charts' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setArtifactFilter(tab.id)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      artifactFilter === tab.id
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#57534E] hover:text-[#171614]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white border border-[#E5E2DA] rounded-xl p-10 text-center space-y-3">
              <p className="font-serif text-xl text-[#171614]">
                No matching chapters, standards, or files found
              </p>
              <p className="text-sm text-[#57534E] max-w-md mx-auto">
                Try searching a standard code like <span className="font-mono">Ind AS 115</span>,{' '}
                <span className="font-mono">SA 315</span>, or a topic keyword such as{' '}
                <span className="font-mono">Leases</span> or{' '}
                <span className="font-mono">Derivatives</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  onSearchQueryChange('');
                  setSearchSubjectScope('all');
                  setArtifactFilter('all');
                }}
                className="mt-2 px-4 py-2 text-xs font-medium text-white bg-[#1D3B73] rounded-md hover:bg-[#152C57] transition-colors"
              >
                Reset Search &amp; Browse All Subjects
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {searchResults.map((group) => (
                <article
                  key={`${group.subjectId}-${group.chapter.chapterKey}`}
                  className="bg-white border border-[#E5E2DA] rounded-xl p-6 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#EFECE4] pb-4">
                    <div>
                      <p className="text-xs text-[#57534E] flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-[#1D3B73]">{group.subjectName}</span>
                        {group.chapter.standards.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-[#171614]">
                              {group.chapter.standards.join(' / ')}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{group.matchReasons.join(', ')}</span>
                      </p>
                      <h3 className="font-serif text-xl font-semibold text-[#171614] mt-1">
                        {group.chapter.chapterNumber !== null
                          ? `${String(group.chapter.chapterNumber).padStart(2, '0')}. ${group.chapter.title}`
                          : group.chapter.title}
                      </h3>
                    </div>
                  </div>

                  {/* Direct Matches */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-[#171614]">
                      Direct Matches ({group.matchedArtifacts.length})
                    </p>
                    <div className="divide-y divide-[#F1EFE9] border border-[#E5E2DA] rounded-lg overflow-hidden">
                      {group.matchedArtifacts.map((artifact) => (
                        <div
                          key={artifact.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 bg-[#FAF9F6] hover:bg-[#F4F2EC] transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5">
                              <ArtifactIcon category={artifact.category} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#171614] truncate">
                                {artifact.title}
                              </p>
                              <p className="text-xs text-[#57534E] mt-0.5 flex flex-wrap items-center gap-x-2">
                                <span>{getCategoryLabel(artifact.category)}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {formatFileSize(artifact.sizeBytes)}
                                </span>
                                {artifact.folderBreadcrumb.length > 0 && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="truncate">
                                      {artifact.folderBreadcrumb.join(' / ')}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenArtifact(artifact, group.chapter)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1D3B73] rounded-md hover:bg-[#152C57] transition-colors whitespace-nowrap shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>View Document</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Companion / Related Chapter Files (Key User Requirement!) */}
                  {group.relatedChapterArtifacts.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <p className="text-xs font-medium text-[#57534E]">
                        Other files in this chapter ({group.relatedChapterArtifacts.length})
                      </p>
                      <div className="divide-y divide-[#F1EFE9] border border-[#EFECE4] rounded-lg overflow-hidden">
                        {group.relatedChapterArtifacts.map((sibling) => (
                          <div
                            key={sibling.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-[#FAF9F6] transition-colors"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="mt-0.5">
                                <ArtifactIcon category={sibling.category} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#171614] truncate">
                                  {sibling.title}
                                </p>
                                <p className="text-xs text-[#57534E] mt-0.5 flex flex-wrap items-center gap-x-2">
                                  <span>{getCategoryLabel(sibling.category)}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">
                                    {formatFileSize(sibling.sizeBytes)}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onOpenArtifact(sibling, group.chapter)}
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#1D3B73] bg-white border border-[#D6D3CB] rounded-md hover:bg-[#F1EFE9] transition-colors whitespace-nowrap shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Open Related</span>
                            </button>
                          </div>
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
        <section aria-label="Subject directory" className="space-y-8">
          {/* 5 Subject Tabs */}
          <div className="space-y-3">
            <div
              role="tablist"
              aria-label="CA Final Subjects"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5"
            >
              {archives.map((archive) => {
                const isSelected = archive.meta.id === activeArchive.meta.id;
                const readinessLabel =
                  archive.totalArtifacts >= 4
                    ? 'Ready'
                    : archive.totalArtifacts > 0
                      ? 'Updating'
                      : 'Folder Ready';

                return (
                  <button
                    key={archive.meta.id}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    onClick={() => onSelectSubject(archive.meta.id)}
                    className={`text-left p-4 rounded-lg border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B73] ${
                      isSelected
                        ? 'bg-[#1D3B73] text-white border-[#1D3B73]'
                        : 'bg-white text-[#171614] border-[#E5E2DA] hover:border-[#BDB8AC] hover:bg-[#FCFBF8]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                      <span className={isSelected ? 'text-white/80' : 'text-[#57534E]'}>
                        {archive.meta.paperCode}
                      </span>
                      <span className={isSelected ? 'text-white/80' : 'text-[#57534E]'}>
                        {readinessLabel}
                      </span>
                    </div>
                    <p className="font-serif text-base font-semibold mt-1.5 leading-snug">
                      {archive.meta.name}
                    </p>
                    <p
                      className={`text-xs mt-2 font-mono tabular-nums ${
                        isSelected ? 'text-white/75' : 'text-[#78716C]'
                      }`}
                    >
                      {archive.chapters.length} ch · {archive.totalArtifacts}{' '}
                      {archive.totalArtifacts === 1 ? 'file' : 'files'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Subject Header & Artifact Type Filter */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E2DA] pb-5">
            <div className="space-y-1.5">
              <p className="text-xs font-mono text-[#57534E]">
                {activeArchive.meta.paperCode} · {activeArchive.meta.shortName}
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#171614]">
                {activeArchive.meta.name}
              </h2>
              <p className="text-sm text-[#57534E] max-w-2xl">{activeArchive.meta.description}</p>
            </div>

            {activeArchive.totalArtifacts > 0 && (
              <div
                role="group"
                aria-label="Filter subject artifacts"
                className="inline-flex items-center p-1 bg-[#F1EFE9] rounded-md border border-[#E5E2DA] self-start md:self-auto"
              >
                {(
                  [
                    { id: 'all', label: 'All Chapters' },
                    { id: 'module', label: 'Modules Only' },
                    { id: 'visuals', label: 'Slides & Infographics' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setArtifactFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      artifactFilter === tab.id
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#57534E] hover:text-[#171614]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chapter-Wise Artifact Directory OR Graceful Empty Folder State */}
          {activeArchive.chapters.length === 0 ? (
            <div className="bg-white border border-[#E5E2DA] rounded-xl p-10 sm:p-14 text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#F1EFE9] border border-[#E5E2DA] mx-auto flex items-center justify-center text-[#57534E]">
                <FolderOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="font-serif text-xl font-semibold text-[#171614]">
                  {activeArchive.meta.name} Folder Connected — Revision Artifacts Uploading Soon
                </h3>
                <p className="text-sm leading-relaxed text-[#57534E]">
                  The Google Drive folder for {activeArchive.meta.name} is already wired into this
                  portal. As soon as study modules, revision slides, or infographics are added to
                  the Drive folder in any nested or flat structure, chapters will automatically
                  organize and appear here without changing any website code.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectSubject('fr')}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#1D3B73] rounded-md hover:bg-[#152C57] transition-colors whitespace-nowrap"
                >
                  Explore Financial Reporting
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSubject('audit')}
                  className="px-4 py-2 text-xs font-medium text-[#171614] bg-white border border-[#D6D3CB] rounded-md hover:bg-[#F1EFE9] transition-colors whitespace-nowrap"
                >
                  Explore Advanced Audit
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {activeArchive.chapters.map((chapter, idx) => {
                const isCollapsed = Boolean(collapsedChapters[chapter.chapterKey]);
                const showModules = artifactFilter === 'all' || artifactFilter === 'module';
                const showVisuals = artifactFilter === 'all' || artifactFilter === 'visuals';

                const visibleModules = showModules ? chapter.modules : [];
                const visibleVisuals = showVisuals ? chapter.revisionVisuals : [];
                const visibleOthers = artifactFilter === 'all' ? chapter.otherFiles : [];
                const visibleCount =
                  visibleModules.length + visibleVisuals.length + visibleOthers.length;

                if (visibleCount === 0) return null;

                const chapterNumLabel =
                  chapter.chapterNumber !== null
                    ? String(chapter.chapterNumber).padStart(2, '0')
                    : String(idx + 1).padStart(2, '0');

                return (
                  <article
                    key={chapter.chapterKey}
                    className="bg-white border border-[#E5E2DA] rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.chapterKey)}
                      aria-expanded={!isCollapsed}
                      className="w-full px-5 sm:px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-[#FAF9F6] transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1D3B73]"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[#57534E] font-mono tabular-nums">
                          <span>Chapter {chapterNumLabel}</span>
                          {chapter.standards.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#1D3B73] font-medium">
                                {chapter.standards.join(' / ')}
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="font-sans">
                            {chapter.modules.length}{' '}
                            {chapter.modules.length === 1 ? 'module' : 'modules'},{' '}
                            {chapter.revisionVisuals.length}{' '}
                            {chapter.revisionVisuals.length === 1
                              ? 'slide / chart'
                              : 'slides & charts'}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-semibold text-[#171614] leading-snug">
                          {chapter.title}
                        </h3>
                      </div>

                      <span className="text-[#57534E] shrink-0" aria-hidden="true">
                        {isCollapsed ? (
                          <ChevronRight className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div className="border-t border-[#EFECE4] px-5 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#FCFBFA]">
                        {/* Column A: Modules */}
                        {showModules && (
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-[#57534E] tracking-wide">
                              Study Modules ({visibleModules.length})
                            </p>
                            {visibleModules.length === 0 ? (
                              <p className="text-xs text-[#78716C] italic py-2">
                                No module uploaded for this chapter yet.
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {visibleModules.map((mod) => (
                                  <div
                                    key={mod.id}
                                    className="flex items-center justify-between gap-3 p-3.5 bg-white border border-[#E5E2DA] rounded-lg hover:border-[#BDB8AC] transition-colors"
                                  >
                                    <div className="flex items-start gap-3 min-w-0">
                                      <div className="mt-0.5">
                                        <ArtifactIcon category={mod.category} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-[#171614] truncate">
                                          {mod.title}
                                        </p>
                                        <p className="text-xs text-[#78716C] mt-0.5 font-mono tabular-nums">
                                          PDF · {formatFileSize(mod.sizeBytes)} · View only
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => onOpenArtifact(mod, chapter)}
                                      aria-label={`View ${mod.title}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1D3B73] border border-[#D6D3CB] rounded-md bg-white hover:bg-[#1D3B73] hover:text-white hover:border-[#1D3B73] transition-colors whitespace-nowrap shrink-0"
                                    >
                                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                      <span>View</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Column B: Revision Slides & Infographics */}
                        {showVisuals && (
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-[#57534E] tracking-wide">
                              Revision Slides &amp; Infographics ({visibleVisuals.length})
                            </p>
                            {visibleVisuals.length === 0 ? (
                              <p className="text-xs text-[#78716C] italic py-2">
                                Revision slides &amp; infographics coming soon for this chapter.
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {visibleVisuals.map((vis) => (
                                  <div
                                    key={vis.id}
                                    className="flex items-center justify-between gap-3 p-3.5 bg-white border border-[#E5E2DA] rounded-lg hover:border-[#BDB8AC] transition-colors"
                                  >
                                    <div className="flex items-start gap-3 min-w-0">
                                      <div className="mt-0.5">
                                        <ArtifactIcon category={vis.category} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-[#171614] truncate">
                                          {vis.title}
                                        </p>
                                        <p className="text-xs text-[#78716C] mt-0.5 font-mono tabular-nums">
                                          {getCategoryLabel(vis.category)} ·{' '}
                                          {formatFileSize(vis.sizeBytes)}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => onOpenArtifact(vis, chapter)}
                                      aria-label={`View ${vis.title}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1D3B73] border border-[#D6D3CB] rounded-md bg-white hover:bg-[#1D3B73] hover:text-white hover:border-[#1D3B73] transition-colors whitespace-nowrap shrink-0"
                                    >
                                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                      <span>View</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Other Files Fallback (Guarantees newly uploaded unusual formats remain accessible) */}
                        {visibleOthers.length > 0 && (
                          <div className="lg:col-span-2 space-y-2.5 pt-2 border-t border-[#EFECE4]">
                            <p className="text-xs font-semibold text-[#57534E]">
                              Additional Chapter Files ({visibleOthers.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {visibleOthers.map((other) => (
                                <div
                                  key={other.id}
                                  className="flex items-center justify-between gap-3 p-3 bg-white border border-[#E5E2DA] rounded-lg"
                                >
                                  <span className="text-sm text-[#171614] truncate">
                                    {other.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onOpenArtifact(other, chapter)}
                                    className="px-3 py-1.5 text-xs font-medium text-[#1D3B73] border border-[#D6D3CB] rounded-md hover:bg-[#F1EFE9] whitespace-nowrap shrink-0"
                                  >
                                    View
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
