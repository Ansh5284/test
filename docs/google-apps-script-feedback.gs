/**
 * FREE ZERO-COST GOOGLE APPS SCRIPT WEBHOOK
 * -----------------------------------------------------------------------------
 * Purpose 1: Logs website student feedback into a COMPLETELY PRIVATE Google Sheet
 *            in your Google Drive (Sheet sharing stays Restricted: "Only you").
 * Purpose 2: (Future Scope) Saves student descriptive answers (typed text or PDF)
 *            into a private Google Drive folder for Gemini evaluation tasks.
 *
 * Setup (2 minutes, 100% Free, No Credit Card):
 * 1. Create a private Google Sheet in your Drive named "CA Final Vault Feedback".
 *    Add row 1 headers: Timestamp | Name | Attempt | Subject | Rating | Category | Message
 * 2. Open Extensions -> Apps Script in that Sheet and paste this entire file.
 * 3. (Optional) Set DESCRIPTIVE_SUBMISSIONS_FOLDER_ID below for future PDF uploads.
 * 4. Click Deploy -> New Deployment -> Select type: Web App.
 *      - Execute as: Me (your Google account)
 *      - Who has access: Anyone
 * 5. Copy the Web App URL (ending in /exec) into VITE_FEEDBACK_SCRIPT_URL
 *    (and VITE_DESCRIPTIVE_UPLOAD_SCRIPT_URL) in src/config/driveConfig.ts or GitHub Secrets.
 */

const FEEDBACK_SHEET_NAME = 'Sheet1';
const DESCRIPTIVE_SUBMISSIONS_FOLDER_ID = ''; // Optional: Private Drive folder ID for student answer uploads

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);

    if (payload.type === 'descriptive_submission') {
      return handleDescriptiveSubmission(payload);
    }

    return handleFeedbackSubmission(payload);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function handleFeedbackSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME) || ss.getSheets()[0];

  const timestamp = new Date().toISOString();
  const name = sanitizeCell(data.name || 'Anonymous Student', 120);
  const attempt = sanitizeCell(data.attempt || 'Unspecified', 60);
  const subject = sanitizeCell(data.subject || 'General Website', 80);
  const rating = Number(data.rating) || 0;
  const category = sanitizeCell(data.category || 'General Feedback', 60);
  const message = sanitizeCell(data.message || '', 3000);

  if (!message) {
    return jsonResponse({ ok: false, error: 'Feedback message is required.' });
  }

  sheet.appendRow([timestamp, name, attempt, subject, rating, category, message]);
  return jsonResponse({ ok: true, recordedAt: timestamp });
}

function handleDescriptiveSubmission(data) {
  if (!DESCRIPTIVE_SUBMISSIONS_FOLDER_ID) {
    return jsonResponse({ ok: false, error: 'Descriptive folder ID not configured in Apps Script.' });
  }

  const folder = DriveApp.getFolderById(DESCRIPTIVE_SUBMISSIONS_FOLDER_ID);
  const safeStudent = sanitizeFilename(data.studentName || 'student');
  const safeQuestion = sanitizeFilename(data.questionId || 'question');
  const stamp = Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd-HHmmss');

  if (data.mode === 'pdf' && data.fileBase64) {
    const bytes = Utilities.base64Decode(data.fileBase64);
    const blob = Utilities.newBlob(bytes, 'application/pdf', `${stamp}_${safeQuestion}_${safeStudent}.pdf`);
    const file = folder.createFile(blob);
    return jsonResponse({ ok: true, fileId: file.getId(), fileName: file.getName() });
  }

  const content = [
    `Question ID: ${data.questionId || ''}`,
    `Subject: ${data.subjectName || ''}`,
    `Student: ${data.studentName || 'Anonymous'}`,
    `Submitted At: ${new Date().toISOString()}`,
    '------------------------------------------------------------',
    data.typedAnswer || '',
  ].join('\n');

  const textFile = folder.createFile(`${stamp}_${safeQuestion}_${safeStudent}.txt`, content, MimeType.PLAIN_TEXT);
  return jsonResponse({ ok: true, fileId: textFile.getId(), fileName: textFile.getName() });
}

function sanitizeCell(value, maxLen) {
  const str = String(value).trim().slice(0, maxLen);
  // Prevent spreadsheet formula injection
  if (/^[=+\-@]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function sanitizeFilename(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
