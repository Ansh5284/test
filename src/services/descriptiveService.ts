import { DRIVE_CONFIG } from '../config/driveConfig';
import type { DescriptiveQuestion, DescriptiveSubmission } from '../types/archive';

const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB browser upload guard for Apps Script

export function validatePdfAnswerFile(file: File | null): string | null {
  if (!file) return 'Please select a PDF file of your handwritten or typed answer.';
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'Only PDF files (.pdf) are accepted for answer sheet uploads.';
  if (file.size > MAX_PDF_BYTES) return 'Please upload a PDF smaller than 15 MB.';
  return null;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read the selected PDF file.'));
    reader.readAsDataURL(file);
  });
}

export async function submitDescriptiveAnswer(params: {
  question: DescriptiveQuestion;
  studentName: string;
  mode: 'typed' | 'pdf';
  typedAnswer?: string;
  pdfFile?: File | null;
}): Promise<DescriptiveSubmission> {
  const endpoint =
    DRIVE_CONFIG.descriptiveUploadScriptUrl.trim() || DRIVE_CONFIG.feedbackScriptUrl.trim();
  const submittedAt = new Date().toISOString();
  const cleanName = params.studentName.trim() || 'Anonymous Candidate';

  let fileBase64: string | undefined;
  if (params.mode === 'pdf' && params.pdfFile) {
    fileBase64 = await readFileAsBase64(params.pdfFile);
  }

  let status: DescriptiveSubmission['status'] = 'queued_for_evaluation';

  if (endpoint) {
    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          type: 'descriptive_submission',
          questionId: params.question.id,
          subjectName: params.question.subjectName,
          studentName: cleanName,
          mode: params.mode,
          typedAnswer: params.typedAnswer?.trim(),
          fileName: params.pdfFile?.name,
          fileBase64,
        }),
      });
    } catch {
      throw new Error(
        'Could not reach the Google Apps Script endpoint. Verify your Web App is deployed with "Execute as: Me" and "Who has access: Anyone".',
      );
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        'Apps Script rejected the upload (401/403). Update Apps Script deployment access to "Anyone".',
      );
    }

    const rawText = await res.text().catch(() => '');
    let parsed: { ok?: boolean; error?: string } | null = null;
    try {
      parsed = JSON.parse(rawText) as { ok?: boolean; error?: string };
    } catch {
      parsed = null;
    }

    if (parsed && parsed.ok === false) {
      throw new Error(parsed.error || 'Apps Script could not save the descriptive submission.');
    }

    status = 'saved_to_drive';
  }

  return {
    id: `desc-${Date.now()}`,
    questionId: params.question.id,
    questionTitle: params.question.title,
    subjectName: params.question.subjectName,
    studentName: cleanName,
    mode: params.mode,
    typedAnswer: params.typedAnswer?.trim(),
    pdfFileName: params.pdfFile?.name,
    pdfSizeKb: params.pdfFile ? Math.max(1, Math.round(params.pdfFile.size / 1024)) : undefined,
    submittedAt,
    status,
  };
}
