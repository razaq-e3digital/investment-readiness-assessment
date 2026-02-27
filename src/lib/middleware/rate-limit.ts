import { and, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { rateLimits } from '@/models/Schema';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 3;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number };

/**
 * Check whether the given (ipHash, action) pair has exceeded the rate limit.
 * Uses a fixed 1-hour window keyed on the floored hour.
 *
 * If under the limit, increments the counter and returns { allowed: true }.
 * If over the limit, returns { allowed: false, retryAfter } (seconds until window resets).
 */
export async function checkRateLimit(
  ipHash: string,
  action: string,
): Promise<RateLimitResult> {
  const now = new Date();
  // Floor to the current hour boundary
  const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
  const windowEnd = new Date(windowStart.getTime() + WINDOW_MS);

  const existing = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.ipHash, ipHash),
        eq(rateLimits.action, action),
        eq(rateLimits.windowStart, windowStart),
      ),
    )
    .limit(1);

  const current = existing[0];

  if (current && current.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((windowEnd.getTime() - now.getTime()) / 1000);
    return { allowed: false, retryAfter };
  }

  if (current) {
    await db
      .update(rateLimits)
      .set({ count: current.count + 1 })
      .where(eq(rateLimits.id, current.id));
  } else {
    await db.insert(rateLimits).values({
      ipHash,
      action,
      windowStart,
    });
  }

  return { allowed: true };
}
