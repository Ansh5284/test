import { useState, type RefObject } from 'react';
import { GraduationCap, Menu, Search, X } from 'lucide-react';

export type AppSection = 'library' | 'quiz' | 'descriptive' | 'feedback';

interface TopBarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

const NAV_ITEMS: Array<{ id: AppSection; label: string }> = [
  { id: 'library', label: 'Library' },
  { id: 'quiz', label: 'Pop Quiz' },
  { id: 'descriptive', label: 'Descriptive' },
  { id: 'feedback', label: 'Feedback' },
];

export function TopBar({
  activeSection,
  onNavigate,
  searchQuery,
  onSearchQueryChange,
  searchInputRef,
}: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: AppSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  const handleSearchChange = (value: string) => {
    if (activeSection !== 'library' && value.trim().length > 0) {
      onNavigate('library');
    }
    onSearchQueryChange(value);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-6">
        {/* Left: Blue Graduation Badge + Title & Subtitle (inspired by fr-revisions) */}
        <button
          type="button"
          onClick={() => handleNavClick('library')}
          className="flex items-center gap-3 text-left shrink-0 group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB] rounded-lg"
        >
          <span className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#1D4ED8] transition-colors">
            <GraduationCap className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] sm:text-base font-bold text-slate-900 leading-tight tracking-tight whitespace-nowrap">
              CA Final Revision Hub
            </span>
            <span className="hidden xl:block text-xs text-slate-500 leading-tight mt-0.5 whitespace-nowrap">
              Slides, infographics, modules &amp; practice Q&amp;A, organised by chapter
            </span>
          </span>
        </button>

        {/* Center: Clean 4-item navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium shrink-0"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Desktop Search Bar + Mobile Menu Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex relative items-center w-60 lg:w-72">
            <label htmlFor="archive-global-search" className="sr-only">
              Search materials, chapters, or Ind AS / SA standards
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="archive-global-search"
              type="text"
              role="searchbox"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search materials, Ind AS, SA..."
              className={`w-full h-10 pl-9 ${
                searchQuery ? 'pr-9' : 'pr-9'
              } bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all`}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                aria-label="Clear search query"
                className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="inline-block absolute right-2.5 font-mono text-[11px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white"
              >
                /
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[#2563EB]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Full-width mobile search bar for narrow viewports */}
      <div className="sm:hidden border-t border-slate-100 px-4 py-2.5 bg-white">
        <div className="relative flex items-center w-full">
          <label htmlFor="archive-mobile-search" className="sr-only">
            Search materials, chapters, or standards
          </label>
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="archive-mobile-search"
            type="text"
            role="searchbox"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search materials, Ind AS, SA..."
            className="w-full h-9 pl-9 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2563EB]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              aria-label="Clear mobile search query"
              className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 rounded-md"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
