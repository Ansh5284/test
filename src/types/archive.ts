export type SubjectId = 'fr' | 'audit' | 'afm' | 'idt' | 'dt';

export type ArtifactCategory = 'module' | 'slides' | 'infographic' | 'quiz_json' | 'other';

export type SubjectReadiness = 'complete' | 'in_progress' | 'upcoming';

export interface SubjectMeta {
  id: SubjectId;
  paperCode: string;
  name: string;
  shortName: string;
  driveFolderMatchNames: string[];
  description: string;
  defaultReadiness: SubjectReadiness;
}

export interface DriveRawItem {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  size?: string;
  modifiedTime?: string;
  pathSegments: string[]; // Folder path from subject root down to parent folder (excluding file name)
}

export interface DemoStudySection {
  heading: string;
  points: string[];
  standardNote?: string;
}

export interface RevisionArtifact {
  id: string;
  subjectId: SubjectId;
  title: string;
  rawFileName: string;
  category: ArtifactCategory;
  mimeType: string;
  chapterKey: string;
  chapterNumber: number | null;
  chapterTitle: string;
  standards: string[];
  folderBreadcrumb: string[];
  sizeBytes: number | null;
  modifiedTime?: string;
  /** View-only Google Drive preview URL (streams unlimited file sizes without downloading) */
  drivePreviewUrl: string | null;
  source: 'drive_public' | 'drive_oauth' | 'demo';
  /** Rich local demo preview payload used only when live Drive folders are not yet linked */
  demoContent?: {
    summary: string;
    keyFormulaOrProvision?: string;
    sections?: DemoStudySection[];
    imageUrl?: string;
    svgDiagramId?: 'indas115_five_step';
  };
}

export interface ChapterGroup {
  chapterKey: string;
  chapterNumber: number | null;
  title: string;
  subjectId: SubjectId;
  standards: string[];
  modules: RevisionArtifact[];
  revisionVisuals: RevisionArtifact[]; // Slides & Infographics
  otherFiles: RevisionArtifact[];
  allArtifacts: RevisionArtifact[];
}

export interface SubjectArchive {
  meta: SubjectMeta;
  folderId: string | null;
  chapters: ChapterGroup[];
  quizFiles: RevisionArtifact[];
  totalArtifacts: number;
  readiness: SubjectReadiness;
  source: 'drive_public' | 'drive_oauth' | 'demo';
  lastSyncedAt: string | null;
}

export interface SearchResultGroup {
  subjectId: SubjectId;
  subjectName: string;
  subjectShortName: string;
  chapter: ChapterGroup;
  matchedArtifacts: RevisionArtifact[];
  relatedChapterArtifacts: RevisionArtifact[];
  matchReasons: string[];
  relevanceScore: number;
}

export interface McqQuestion {
  id: string;
  marks: number;
  chapter: string;
  standardRef: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface McqQuiz {
  quizId: string;
  title: string;
  subjectId: SubjectId;
  subjectName: string;
  publishedDate: string;
  frequency: 'daily' | 'weekly';
  totalMarks: number;
  durationMinutes: number;
  sourceLabel: string;
  questions: McqQuestion[];
}

export interface QuizEvaluationResult {
  totalMarks: number;
  earnedMarks: number;
  percentage: number;
  correctCount: number;
  attemptedCount: number;
  totalQuestions: number;
  details: Array<{
    questionId: string;
    selectedIndex: number | null;
    correctIndex: number;
    isCorrect: boolean;
    earnedMarks: number;
    maxMarks: number;
    explanation: string;
  }>;
}

export interface DescriptiveQuestion {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  chapter: string;
  standardRef: string;
  marks: number;
  recommendedMinutes: number;
  title: string;
  prompt: string;
  expectedKeyPoints: string[];
}

export interface DescriptiveRubricItem {
  criterion: string;
  maxMarks: number;
  awardedMarks: number;
  status: 'met' | 'partial' | 'missed';
  comment: string;
}

export interface DescriptiveSubmission {
  id: string;
  questionId: string;
  questionTitle: string;
  subjectName: string;
  studentName: string;
  mode: 'typed' | 'pdf';
  typedAnswer?: string;
  pdfFileName?: string;
  pdfSizeKb?: number;
  submittedAt: string;
  status: 'saved_to_drive' | 'queued_for_evaluation' | 'evaluated_sample';
  evaluation?: {
    totalMarks: number;
    awardedMarks: number;
    overallSummary: string;
    rubric: DescriptiveRubricItem[];
  };
}

export interface FeedbackSubmission {
  id: string;
  name: string;
  attempt: string;
  subject: string;
  rating: number;
  category: string;
  message: string;
  submittedAt: string;
  deliveryMode: 'apps_script_sheet' | 'preview_local';
}
