import { getBaseUrl } from './Helpers';

describe('Helpers', () => {
  describe('getBaseUrl', () => {
    it('should return localhost URL in development when no env var set', () => {
      const originalUrl = process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXT_PUBLIC_APP_URL;

      expect(getBaseUrl()).toBe('http://localhost:3000');

      process.env.NEXT_PUBLIC_APP_URL = originalUrl;
    });

    it('should return NEXT_PUBLIC_APP_URL when set', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://assess.e3digital.net';

      expect(getBaseUrl()).toBe('https://assess.e3digital.net');

      delete process.env.NEXT_PUBLIC_APP_URL;
    });
  });
});
