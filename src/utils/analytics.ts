// GA4 event tracking utility — safe to call on server (no-ops) or before consent
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') {
    return;
  }
  if (typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', eventName, params ?? {});
}
