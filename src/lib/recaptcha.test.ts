import { verifyRecaptchaToken } from './recaptcha';

const TOKEN = 'test-token-abc';
const SECRET = 'test-secret-key';

describe('verifyRecaptchaToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns {success: true, score: 0.9} for a valid token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({ success: true, score: 0.9 }),
    } as Response);

    const result = await verifyRecaptchaToken(TOKEN, SECRET);

    expect(result).toEqual({ success: true, score: 0.9 });
  });

  it('returns {success: false, score: null} when Google returns success: false', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({ success: false }),
    } as Response);

    const result = await verifyRecaptchaToken(TOKEN, SECRET);

    expect(result).toEqual({ success: false, score: null });
  });

  it('returns {success: true, score: null} when score field is missing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({ success: true }),
    } as Response);

    const result = await verifyRecaptchaToken(TOKEN, SECRET);

    expect(result).toEqual({ success: true, score: null });
  });

  it('returns {success: true, score: null} on network error (fail-open)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network failure'));

    const result = await verifyRecaptchaToken(TOKEN, SECRET);

    expect(result).toEqual({ success: true, score: null });
  });

  it('calls the Google siteverify endpoint with correct params', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({ success: true, score: 0.7 }),
    } as Response);
    globalThis.fetch = mockFetch;

    await verifyRecaptchaToken(TOKEN, SECRET);

    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];

    expect(url).toBe('https://www.google.com/recaptcha/api/siteverify');
    expect(options.method).toBe('POST');
    expect(String(options.body)).toContain(SECRET);
    expect(String(options.body)).toContain(TOKEN);
  });
});
