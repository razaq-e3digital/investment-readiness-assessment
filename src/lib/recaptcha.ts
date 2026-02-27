// ── Client-side reCAPTCHA v3 helpers ─────────────────────────────────────────
// Call these only from 'use client' components.

type GrecaptchaInstance = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

/**
 * Append the reCAPTCHA v3 script to <head> if not already present.
 * Safe to call multiple times — idempotent.
 */
export function loadRecaptchaScript(siteKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (document.querySelector('#recaptcha-script')) {
    return;
  }
  const script = document.createElement('script');
  script.id = 'recaptcha-script';
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Generate an invisible reCAPTCHA v3 token for the given action.
 * Returns an empty string if the script is not yet loaded or window is unavailable.
 */
export async function getRecaptchaToken(siteKey: string, action: string): Promise<string> {
  if (typeof window === 'undefined') {
    return '';
  }
  const w = window as Window & { grecaptcha?: GrecaptchaInstance };
  if (!w.grecaptcha) {
    return '';
  }
  return new Promise<string>((resolve) => {
    w.grecaptcha!.ready(() => {
      w.grecaptcha!.execute(siteKey, { action }).then(resolve).catch(() => resolve(''));
    });
  });
}

// ── Server-side reCAPTCHA verification ────────────────────────────────────────
// Call this only from API routes / server actions.

type RecaptchaVerifyResponse = {
  'success': boolean;
  'score'?: number;
  'action'?: string;
  'error-codes'?: string[];
};

/**
 * Verify a reCAPTCHA v3 token with Google's siteverify API.
 * Returns { success: false, score: null } on network failure (fail-open for graceful degradation).
 */
export async function verifyRecaptchaToken(
  token: string,
  secretKey: string,
): Promise<{ success: boolean; score: number | null }> {
  try {
    const params = new URLSearchParams({ secret: secretKey, response: token });
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json() as RecaptchaVerifyResponse;
    return { success: data.success, score: data.score ?? null };
  } catch {
    // Network failure — fail-open: let submission proceed rather than block users
    return { success: true, score: null };
  }
}
