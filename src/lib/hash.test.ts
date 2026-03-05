import { hashIp } from './hash';

describe('hashIp', () => {
  it('returns a 64-character hex string', () => {
    const result = hashIp('192.168.1.1');

    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic — same input produces same output', () => {
    const ip = '10.0.0.1';

    expect(hashIp(ip)).toBe(hashIp(ip));
  });

  it('produces different hashes for different IPs', () => {
    const hash1 = hashIp('192.168.1.1');
    const hash2 = hashIp('192.168.1.2');

    expect(hash1).not.toBe(hash2);
  });

  it('handles IPv6 addresses', () => {
    const result = hashIp('::1');

    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('handles empty string input', () => {
    const result = hashIp('');

    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });
});
