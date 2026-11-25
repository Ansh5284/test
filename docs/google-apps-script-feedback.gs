/**
 * FREE ZERO-COST GOOGLE APPS SCRIPT WEBHOOK
 * -----------------------------------------------------------------------------
 * Purpose 1: Logs website student feedback into a COMPLETELY PRIVATE Google Sheet
 *            in your Google Drive (Sheet sharing stays Restricted: "Only you").
 * Purpose 2: (Future Scope) Saves student descriptive answers (typed text or PDF)
 *            into a private Google Drive folder for Gemini evaluation tasks.
 *
 * Setup (2 minutes, 100% Free, No Credit Card):
 * 1. Create a private Google Sheet in your Drive named "CA Final Feedback".
 *    (Keep sharing as "Restricted — Only you".)
 * 2. Inside that Sheet, click: Extensions -> Apps Script.
 *    (Or if you created a standalone script at script.google.com, paste your
 *    Sheet's ID into SPREADSHEET_ID below.)
 * 3. Paste this entire file and click Save (Ctrl+S).
 * 4. Click Deploy -> New deployment -> Gear icon -> select "Web app":
 *      - Execute as: Me (your Google account)
 *      - Who has access: Anyone   <-- CRITICAL! Do NOT leave as "Only myself"
 * 5. Click Deploy, authorize when prompted, and copy the EXACT "Web app URL"
 *    shown on screen (it already starts with https://script.google.com/macros/s/
 *    and ALREADY ends with /exec — do NOT manually type /exec onto another URL).
 * 6. Quick verification: paste that Web app URL into an Incognito browser window.
 *    You should immediately see: {"ok":true,"status":"CA Final Feedback Webhook Active"}
 *    If Google asks you to sign in instead, "Who has access" is NOT set to "Anyone".
 * 7. Save that exact URL in GitHub Repo -> Settings -> Secrets -> Actions as:
 *    VITE_FEEDBACK_SCRIPT_URL
 */

const SPREADSHEET_ID = ''; // Optional if opened via Extensions -> Apps Script inside the Sheet; REQUIRED if standalone script
const FEEDBACK_SHEET_NAME = 'Sheet1';
const DESCRIPTIVE_SUBMISSIONS_FOLDER_ID = ''; // Optional: Private Drive folder ID for student answer uploads

function getTargetSheet() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error(
      'No spreadsheet linked. Either create this script via Extensions -> Apps Script inside your Sheet, or paste your Sheet ID into SPREADSHEET_ID.'
    );
  }

  const sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME) || ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Attempt', 'Subject', 'Rating', 'Category', 'Message']);
  }
  return sheet;
}

/**
 * Health check: open your Web App /exec URL in an Incognito browser tab to confirm
 * deployment permissions are public ("Anyone") while your Sheet remains private.
 */
function doGet() {
  try {
    const sheet = getTargetSheet();
    return jsonResponse({
      ok: true,
      status: 'CA Final Feedback Webhook Active',
      sheetName: sheet.getName(),
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    if (payload.type === 'descriptive_submission') {
      return handleDescriptiveSubmission(payload);
    }

    return handleFeedbackSubmission(payload);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function handleFeedbackSubmission(data) {
  const sheet = getTargetSheet();

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
    return jsonResponse({
      ok: false,
      error: 'Descriptive folder ID not configured in Apps Script.',
    });
  }

  const folder = DriveApp.getFolderById(DESCRIPTIVE_SUBMISSIONS_FOLDER_ID);
  const safeStudent = sanitizeFilename(data.studentName || 'student');
  const safeQuestion = sanitizeFilename(data.questionId || 'question');
  const stamp = Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd-HHmmss');

  if (data.mode === 'pdf' && data.fileBase64) {
    const bytes = Utilities.base64Decode(data.fileBase64);
    const blob = Utilities.newBlob(
      bytes,
      'application/pdf',
      `${stamp}_${safeQuestion}_${safeStudent}.pdf`
    );
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

  const textFile = folder.createFile(
    `${stamp}_${safeQuestion}_${safeStudent}.txt`,
    content,
    MimeType.PLAIN_TEXT
  );
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
  return String(value)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
