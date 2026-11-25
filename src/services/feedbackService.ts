import { DRIVE_CONFIG } from '../config/driveConfig';
import type { FeedbackSubmission } from '../types/archive';

export interface FeedbackInput {
  name: string;
  attempt: string;
  subject: string;
  rating: number;
  category: string;
  message: string;
}

export interface FeedbackValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof FeedbackInput, string>>;
}

export function validateFeedbackInput(input: FeedbackInput): FeedbackValidationResult {
  const errors: Partial<Record<keyof FeedbackInput, string>> = {};

  if (!input.rating || input.rating < 1 || input.rating > 5) {
    errors.rating = 'Please choose an overall rating from 1 to 5.';
  }
  if (!input.subject.trim()) {
    errors.subject = 'Please select a subject or area.';
  }
  if (!input.category.trim()) {
    errors.category = 'Please select a feedback category.';
  }
  const trimmedMsg = input.message.trim();
  if (trimmedMsg.length < 10) {
    errors.message = 'Please share at least 10 characters so your feedback is actionable.';
  } else if (trimmedMsg.length > 2500) {
    errors.message = 'Feedback message must be under 2,500 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates and posts feedback to the owner's private Google Sheet via Google Apps Script Web App.
 * Uses CORS-simple `text/plain;charset=utf-8` (no preflight OPTIONS) with `redirect: 'follow'`
 * so real HTTP errors (such as 401 when "Who has access" is not set to "Anyone") are surfaced
 * honestly instead of silently hidden by `no-cors`.
 */
export async function submitFeedbackToPrivateSheet(
  input: FeedbackInput,
): Promise<FeedbackSubmission> {
  const endpoint = DRIVE_CONFIG.feedbackScriptUrl.trim();
  const submittedAt = new Date().toISOString();

  const payload = {
    type: 'feedback',
    name: input.name.trim() || 'Anonymous Student',
    attempt: input.attempt.trim() || 'Upcoming Attempt',
    subject: input.subject,
    rating: input.rating,
    category: input.category,
    message: input.message.trim(),
    submittedAt,
  };

  if (endpoint) {
    if (!endpoint.startsWith('https://script.google.com/macros/s/') || !endpoint.endsWith('/exec')) {
      throw new Error(
        'Invalid Apps Script URL configured. Copy the full Web App URL from Deploy -> New deployment (it starts with https://script.google.com/macros/s/ and already ends with /exec).',
      );
    }

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(
        'Could not reach the Google Apps Script Web App. Check that your Apps Script is deployed as a Web App with "Execute as: Me" and "Who has access: Anyone" (not "Only myself"), and re-deploy a new version.',
      );
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Google Apps Script returned ${res.status} Unauthorized. Open Apps Script -> Deploy -> Manage deployments -> set "Who has access" to "Anyone" and use the exact Web App URL generated there.`,
      );
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const rawText = await res.text().catch(() => '');

    if (!res.ok || contentType.includes('text/html') || rawText.trim().startsWith('<!DOCTYPE')) {
      throw new Error(
        'Apps Script returned a login/error page instead of JSON. Re-deploy as Web App with "Execute as: Me" and "Who has access: Anyone", then test opening the /exec URL in an Incognito tab.',
      );
    }

    let parsed: { ok?: boolean; error?: string } | null = null;
    try {
      parsed = JSON.parse(rawText) as { ok?: boolean; error?: string };
    } catch {
      parsed = null;
    }

    if (parsed && parsed.ok === false) {
      throw new Error(parsed.error || 'Apps Script failed to append the feedback row.');
    }

    return {
      id: `fb-${Date.now()}`,
      name: payload.name,
      attempt: payload.attempt,
      subject: payload.subject,
      rating: payload.rating,
      category: payload.category,
      message: payload.message,
      submittedAt,
      deliveryMode: 'apps_script_sheet',
    };
  }

  return {
    id: `fb-${Date.now()}`,
    name: payload.name,
    attempt: payload.attempt,
    subject: payload.subject,
    rating: payload.rating,
    category: payload.category,
    message: payload.message,
    submittedAt,
    deliveryMode: 'preview_local',
  };
}
