import type { SubjectId, SubjectMeta } from '../types/archive';

/**
 * ============================================================================
 * CA FINAL REVISION HUB — CENTRAL CONFIGURATION
 * ============================================================================
 * Configure your Google Drive API key via GitHub Actions Secrets
 * (`VITE_GOOGLE_DRIVE_API_KEY`) or `.env` for live public Drive syncing.
 * Subject Folder IDs default to your public read-only Drive folders and can
 * also be overridden at build time via `VITE_DRIVE_FOLDER_*` env vars.
 *
 * Security tip for GitHub Pages:
 * Restrict your Google Drive API key in Google Cloud Console -> Credentials ->
 * Application Restrictions -> Websites -> add `https://<your-username>.github.io/*`
 * and restrict API access strictly to "Google Drive API".
 * ============================================================================
 */

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : ({} as Record<string, string>);

export const DRIVE_CONFIG = {
  /** Set VITE_GOOGLE_DRIVE_API_KEY in .env or GitHub Actions Secrets */
  apiKey: (env.VITE_GOOGLE_DRIVE_API_KEY as string | undefined) || '',

  /** Optional: If all 5 subject folders live inside one single master Drive folder */
  rootFolderId: (env.VITE_DRIVE_ROOT_FOLDER_ID as string | undefined) || '',

  /**
   * Public Google Drive Folder IDs for each subject ("Anyone with the link can view").
   * Env vars take precedence if provided.
   */
  subjectFolderIds: {
    fr: (env.VITE_DRIVE_FOLDER_FR as string | undefined) || '1scHG_sh9f5FM80eiBAAvn9vNFMjgn-04',
    afm: (env.VITE_DRIVE_FOLDER_AFM as string | undefined) || '1zx08ZNsB4S_FV9slYEiT2HjZSy5v8HMt',
    audit:
      (env.VITE_DRIVE_FOLDER_AUDIT as string | undefined) || '1F3K3qtlu0-HI8VXn3J34QMeiKW7lB9s0',
    dt: (env.VITE_DRIVE_FOLDER_DT as string | undefined) || '1eSWrHuAP-Rdgn6Ids81HNarncsZXb80l',
    idt: (env.VITE_DRIVE_FOLDER_IDT as string | undefined) || '1cZKL0uXtZThb0-9jatPKXVD6o0WBOaY9',
  } as Record<SubjectId, string>,

  /**
   * Free Google Apps Script Web App URL (/exec) that writes student feedback into
   * your PRIVATE Google Sheet (never shared with anyone).
   * See docs/google-apps-script-feedback.gs for the 2-minute setup.
   */
  feedbackScriptUrl: (env.VITE_FEEDBACK_SCRIPT_URL as string | undefined) || '',

  /**
   * Optional Free Google Apps Script Web App URL (/exec) for saving future
   * student descriptive PDF/text submissions into your private Google Drive folder.
   */
  descriptiveUploadScriptUrl:
    (env.VITE_DESCRIPTIVE_UPLOAD_SCRIPT_URL as string | undefined) || '',

  /** GitHub Pages repository reference */
  githubRepoName: 'cafinalrevisionpage',
};

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'fr',
    paperCode: 'Paper 1',
    name: 'Financial Reporting',
    shortName: 'FR',
    driveFolderMatchNames: ['financial reporting', 'fr', 'paper 1'],
    description:
      'Ind AS recognition, measurement, consolidation, business combinations, and financial instruments.',
    defaultReadiness: 'complete',
  },
  {
    id: 'afm',
    paperCode: 'Paper 2',
    name: 'Advanced Financial Management',
    shortName: 'AFM',
    driveFolderMatchNames: ['advanced financial management', 'afm', 'sfm', 'paper 2'],
    description:
      'Derivatives valuation, foreign exchange risk hedging, portfolio theory, and corporate restructuring.',
    defaultReadiness: 'complete',
  },
  {
    id: 'audit',
    paperCode: 'Paper 3',
    name: 'Advanced Audit',
    shortName: 'Audit',
    driveFolderMatchNames: ['advanced audit', 'advanced auditing', 'audit', 'paper 3'],
    description:
      'Standards on Auditing (SA), SQC 1 quality management, audit reporting, CARO 2020, and ethics.',
    defaultReadiness: 'complete',
  },
  {
    id: 'dt',
    paperCode: 'Paper 4',
    name: 'Direct Taxes',
    shortName: 'DT',
    driveFolderMatchNames: ['direct taxes', 'direct tax', 'dt', 'paper 4'],
    description:
      'Income-tax Act provisions, international taxation, transfer pricing, and appellate remedies.',
    defaultReadiness: 'in_progress',
  },
  {
    id: 'idt',
    paperCode: 'Paper 5',
    name: 'Indirect Taxes',
    shortName: 'IDT',
    driveFolderMatchNames: ['indirect taxes', 'indirect tax', 'idt', 'gst', 'paper 5'],
    description:
      'CGST, IGST levy & supply, input tax credit, exemptions, customs valuation, and FTP.',
    defaultReadiness: 'complete',
  },
];

export const SUBJECT_MAP: Record<SubjectId, SubjectMeta> = SUBJECTS.reduce(
  (acc, subject) => {
    acc[subject.id] = subject;
    return acc;
  },
  {} as Record<SubjectId, SubjectMeta>,
);

export function hasPublicDriveConfiguration(): boolean {
  if (!DRIVE_CONFIG.apiKey.trim()) return false;
  if (DRIVE_CONFIG.rootFolderId.trim()) return true;
  return Object.values(DRIVE_CONFIG.subjectFolderIds).some((id) => Boolean(id && id.trim()));
}
