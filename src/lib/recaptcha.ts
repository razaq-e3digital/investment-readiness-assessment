// ── Client-side reCAPTCHA v3 helpers ─────────────────────────────────────────
// Call these only from 'use client' components.

type GrecaptchaInstance = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

// Circuit-breaker flag — set to true when reCAPTCHA is known to have failed.
// Once true, all getRecaptchaToken() calls return '' without attempting execution.
let recaptchaLoadFailed = false;

// Guard: global window error listener is registered at most once per module lifecycle.
let globalHandlerRegistered = false;

/**
 * Append the reCAPTCHA v3 script to <head> if not already present.
 * Safe to call multiple times — idempotent.
 *
 * If siteKey is empty or falsy, the circuit-breaker flag is set immediately
 * and no script tag is created. Leaving the key empty disables bot protection
 * but does NOT block form submissions.
 */
export function loadRecaptchaScript(siteKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Empty key — disable reCAPTCHA gracefully without any script load attempt
  if (!siteKey) {
    recaptchaLoadFailed = true;
    return;
  }

  // Register a global handler that suppresses uncaught exceptions thrown by
  // Google's reCAPTCHA script (e.g. "Invalid site key or not loaded") and
  // trips the circuit-breaker so subsequent token requests short-circuit.
  if (!globalHandlerRegistered) {
    globalHandlerRegistered = true;
    window.addEventListener('error', (event: ErrorEvent) => {
      if (event.filename && event.filename.includes('recaptcha')) {
        recaptchaLoadFailed = true;
        event.preventDefault();
      }
    });
  }

  if (document.querySelector('#recaptcha-script')) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'recaptcha-script';
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  script.async = true;
  script.onerror = () => {
    recaptchaLoadFailed = true;
  };
  document.head.appendChild(script);
}

/**
 * Generate an invisible reCAPTCHA v3 token for the given action.
 *
 * Returns '' if any of the following are true:
 *  - Not running in a browser
 *  - Circuit-breaker is tripped (empty key, script load error, or invalid key)
 *  - grecaptcha is not yet available on window
 *  - execute() rejects or throws synchronously
 *  - grecaptcha.ready() never fires within 5 seconds
 */
export async function getRecaptchaToken(siteKey: string, action: string): Promise<string> {
  if (typeof window === 'undefined') {
    return '';
  }

  // Circuit-breaker: skip immediately if reCAPTCHA is known to have failed
  if (recaptchaLoadFailed) {
    return '';
  }

  const w = window as Window & { grecaptcha?: GrecaptchaInstance };
  if (!w.grecaptcha) {
    return '';
  }

  return new Promise<string>((resolve) => {
    // 5-second timeout: if grecaptcha.ready() never fires, resolve with ''
    // rather than hanging the form submission indefinitely
    const timeoutId = setTimeout(() => {
      console.warn('[reCAPTCHA] Timed out waiting for grecaptcha.ready() — proceeding without token');
      resolve('');
    }, 5000);

    try {
      w.grecaptcha!.ready(() => {
        clearTimeout(timeoutId);
        try {
          w.grecaptcha!
            .execute(siteKey, { action })
            .then(resolve)
            .catch((err: unknown) => {
              console.warn('[reCAPTCHA] execute() failed — proceeding without token:', err);
              resolve('');
            });
        } catch (err) {
          console.warn('[reCAPTCHA] execute() threw synchronously — proceeding without token:', err);
          resolve('');
        }
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[reCAPTCHA] ready() threw — proceeding without token:', err);
      resolve('');
    }
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
