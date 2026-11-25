import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DescriptiveLabView } from './components/DescriptiveLabView';
import { FeedbackView } from './components/FeedbackView';
import { LibraryView } from './components/LibraryView';
import { PopQuizView } from './components/PopQuizView';
import { ProtectedViewerModal } from './components/ProtectedViewerModal';
import { TopBar, type AppSection } from './components/TopBar';
import { DRIVE_CONFIG, hasPublicDriveConfiguration } from './config/driveConfig';
import { buildDemoArchives } from './data/seedArchive';
import { SEED_QUIZZES } from './data/seedQuizzes';
import { fetchDriveArchives, fetchDriveQuizzes } from './services/driveService';
import { getAccessToken, googleSignIn, initAuth, logoutGoogle } from './services/googleAuth';
import type {
  ChapterGroup,
  McqQuiz,
  RevisionArtifact,
  SubjectArchive,
  SubjectId,
} from './types/archive';

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('library');
  const [archives, setArchives] = useState<SubjectArchive[]>(() => buildDemoArchives());
  const [quizzes, setQuizzes] = useState<McqQuiz[]>(SEED_QUIZZES);
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('fr');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerState, setViewerState] = useState<{
    artifact: RevisionArtifact;
    chapter: ChapterGroup;
  } | null>(null);

  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [connectedUserEmail, setConnectedUserEmail] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const syncFromDrive = useCallback(async (accessToken?: string | null) => {
    setIsSyncingDrive(true);
    setDriveError(null);
    try {
      const liveArchives = await fetchDriveArchives({ accessToken });
      if (!liveArchives) return;
      setArchives(liveArchives);

      // Automatically load any *.json MCQ quiz files found across the 5 subject Drive folders
      const allQuizArtifacts = liveArchives.flatMap((a) => a.quizFiles);
      if (allQuizArtifacts.length > 0) {
        const liveQuizzes = await fetchDriveQuizzes(allQuizArtifacts, { accessToken });
        if (liveQuizzes.length > 0) {
          setQuizzes([...liveQuizzes, ...SEED_QUIZZES]);
        }
      }
    } catch (err) {
      setDriveError(
        err instanceof Error
          ? err.message
          : 'Could not sync Google Drive folders. Showing preview catalog.',
      );
    } finally {
      setIsSyncingDrive(false);
    }
  }, []);

  // Initialize Firebase Auth listener + auto-sync public Drive API folders if configured
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setConnectedUserEmail(user.email || user.displayName || 'Connected Google Account');
        void syncFromDrive(token);
      },
      () => {
        setConnectedUserEmail(null);
      },
    );

    if (hasPublicDriveConfiguration()) {
      void syncFromDrive(null);
    }

    return () => unsubscribe();
  }, [syncFromDrive]);

  // Global "/" shortcut to focus the header search bar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '/' && !viewerState) {
        e.preventDefault();
        setActiveSection('library');
        window.setTimeout(() => {
          searchInputRef.current?.focus();
        }, 40);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewerState]);

  const handleNavigateSection = (section: AppSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleSignInGoogle = async () => {
    setDriveError(null);
    setIsSyncingDrive(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setConnectedUserEmail(
          result.user.email || result.user.displayName || 'Connected Google Account',
        );
        await syncFromDrive(result.accessToken);
      }
    } catch (err) {
      setDriveError(
        err instanceof Error
          ? err.message
          : 'Google sign-in was cancelled or blocked by the browser popup settings.',
      );
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleSignOutGoogle = async () => {
    await logoutGoogle();
    setConnectedUserEmail(null);
    setDriveError(null);
    if (hasPublicDriveConfiguration()) {
      await syncFromDrive(null);
    } else {
      setArchives(buildDemoArchives());
      setQuizzes(SEED_QUIZZES);
    }
  };

  const handleRefreshDrive = async () => {
    const token = await getAccessToken();
    await syncFromDrive(token);
  };

  const activeTotalFiles = useMemo(
    () => archives.reduce((sum, a) => sum + a.totalArtifacts, 0),
    [archives],
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <TopBar
        activeSection={activeSection}
        onNavigate={handleNavigateSection}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchInputRef={searchInputRef}
      />

      <main className="flex-1">
        {activeSection === 'library' && (
          <LibraryView
            archives={archives}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onOpenArtifact={(artifact, chapter) => setViewerState({ artifact, chapter })}
            isSyncingDrive={isSyncingDrive}
            driveError={driveError}
            connectedUserEmail={connectedUserEmail}
            onSignInGoogle={handleSignInGoogle}
            onSignOutGoogle={handleSignOutGoogle}
            onRefreshDrive={handleRefreshDrive}
          />
        )}

        {activeSection === 'quiz' && <PopQuizView quizzes={quizzes} />}

        {activeSection === 'descriptive' && <DescriptiveLabView />}

        {activeSection === 'feedback' && <FeedbackView />}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">CA Final Revision Hub</p>
            <p>
              GitHub Pages (<span className="font-mono">{DRIVE_CONFIG.githubRepoName}</span>) ·{' '}
              <span className="font-mono tabular-nums">{activeTotalFiles}</span> view-only materials
              indexed
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => handleNavigateSection('library')}
              className="hover:text-slate-900 transition-colors"
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('quiz')}
              className="hover:text-slate-900 transition-colors"
            >
              Pop Quiz
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('descriptive')}
              className="hover:text-slate-900 transition-colors"
            >
              Descriptive Lab
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('feedback')}
              className="hover:text-slate-900 transition-colors"
            >
              Feedback
            </button>
          </div>
        </div>
      </footer>

      {viewerState && (
        <ProtectedViewerModal
          artifact={viewerState.artifact}
          chapter={viewerState.chapter}
          onSelectArtifact={(nextArtifact) =>
            setViewerState({ artifact: nextArtifact, chapter: viewerState.chapter })
          }
          onClose={() => setViewerState(null)}
        />
      )}
    </div>
  );
}
