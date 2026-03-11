// @vitest-environment jsdom
// Tests for the client-side helpers: loadRecaptchaScript + getRecaptchaToken
// Server-side verifyRecaptchaToken tests live in ../recaptcha.test.ts

describe('loadRecaptchaScript', () => {
  beforeEach(() => {
    vi.resetModules();
    document.getElementById('recaptcha-script')?.remove();
  });

  it('skips script creation when site key is empty', async () => {
    const { loadRecaptchaScript } = await import('../recaptcha');

    loadRecaptchaScript('');

    expect(document.getElementById('recaptcha-script')).toBeNull();
  });

  it('creates a script tag with the site key in the URL', async () => {
    const { loadRecaptchaScript } = await import('../recaptcha');

    loadRecaptchaScript('my-site-key');

    const script = document.getElementById('recaptcha-script') as HTMLScriptElement;

    expect(script).not.toBeNull();
    expect(script.src).toContain('my-site-key');
  });

  it('is idempotent — calling twice creates only one script tag', async () => {
    const { loadRecaptchaScript } = await import('../recaptcha');

    loadRecaptchaScript('my-site-key');
    loadRecaptchaScript('my-site-key');

    expect(document.querySelectorAll('#recaptcha-script')).toHaveLength(1);
  });
});

describe('getRecaptchaToken', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string when grecaptcha is not on window', async () => {
    const { getRecaptchaToken } = await import('../recaptcha');

    const result = await getRecaptchaToken('my-key', 'action');

    expect(result).toBe('');
  });

  it('returns empty string when recaptchaLoadFailed flag is set (empty key)', async () => {
    const { loadRecaptchaScript, getRecaptchaToken } = await import('../recaptcha');
    loadRecaptchaScript(''); // empty key trips the circuit-breaker
    vi.stubGlobal('grecaptcha', {
      ready: vi.fn(),
      execute: vi.fn(),
    });

    const result = await getRecaptchaToken('my-key', 'action');

    expect(result).toBe('');
  });

  it('returns empty string when execute() rejects', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getRecaptchaToken } = await import('../recaptcha');
    vi.stubGlobal('grecaptcha', {
      ready: (cb: () => void) => {
        cb();
      },
      execute: () => Promise.reject(new Error('Invalid site key')),
    });

    const result = await getRecaptchaToken('my-key', 'action');

    expect(result).toBe('');

    warnSpy.mockRestore();
  });

  it('returns empty string after 5-second timeout when ready() never fires', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getRecaptchaToken } = await import('../recaptcha');
    vi.stubGlobal('grecaptcha', {
      ready: () => { /* never calls callback */ },
      execute: vi.fn(),
    });

    const tokenPromise = getRecaptchaToken('my-key', 'action');
    vi.advanceTimersByTime(5001);
    const result = await tokenPromise;

    expect(result).toBe('');

    warnSpy.mockRestore();
  });

  it('returns the token string on happy path', async () => {
    const { getRecaptchaToken } = await import('../recaptcha');
    vi.stubGlobal('grecaptcha', {
      ready: (cb: () => void) => {
        cb();
      },
      execute: () => Promise.resolve('test-token-xyz'),
    });

    const result = await getRecaptchaToken('my-key', 'assessment_submit');

    expect(result).toBe('test-token-xyz');
  });
});
