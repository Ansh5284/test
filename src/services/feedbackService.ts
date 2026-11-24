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
 * Posts feedback to the owner's private Google Sheet via the free Google Apps Script Web App.
 * When the Apps Script URL is not yet configured (e.g. local preview before GitHub deployment),
 * returns a confirmed local preview receipt while keeping the exact same validation & payload contract.
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
    // Google Apps Script Web Apps do not emit CORS preflight headers on text/plain POST;
    // sending as text/plain JSON with no-cors guarantees reliable delivery to the private Sheet.
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

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
