import { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';

export type AppSection = 'library' | 'quiz' | 'descriptive' | 'feedback';

interface TopBarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onFocusSearch: () => void;
}

const NAV_ITEMS: Array<{ id: AppSection; label: string }> = [
  { id: 'library', label: 'Library' },
  { id: 'quiz', label: 'Pop Quiz' },
  { id: 'descriptive', label: 'Descriptive' },
  { id: 'feedback', label: 'Feedback' },
];

export function TopBar({ activeSection, onNavigate, onFocusSearch }: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: AppSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F9F8F4]/95 backdrop-blur-sm border-b border-[#E5E2DA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element editorial wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('library')}
          className="font-serif text-xl font-semibold tracking-tight text-[#171614] hover:text-[#1D3B73] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D3B73]"
        >
          CA Final Vault
        </button>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D3B73] ${
                  isActive
                    ? 'text-[#1D3B73] border-[#1D3B73]'
                    : 'text-[#57534E] border-transparent hover:text-[#171614] hover:border-[#D6D3CB]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onFocusSearch();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1D3B73] rounded-md hover:bg-[#152C57] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B73]"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Search Archive</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#E5E2DA] bg-white text-[#171614] hover:bg-[#F1EFE9] transition-colors focus-visible:outline-2 focus-visible:outline-[#1D3B73]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E5E2DA] bg-[#F9F8F4] px-4 py-3 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1D3B73]/10 text-[#1D3B73]'
                    : 'text-[#57534E] hover:bg-[#F1EFE9] hover:text-[#171614]'
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
