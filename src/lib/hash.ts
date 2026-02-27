import { createHash } from 'node:crypto';

/**
 * Hash an IP address with SHA-256 before storing.
 * We never store raw IPs — only hashed representations.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}
