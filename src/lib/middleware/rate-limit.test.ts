import { checkRateLimit } from './rate-limit';

// ── Hoisted mock objects ───────────────────────────────────────────────────────
// vi.mock() is hoisted above variable declarations, so we use vi.hoisted()
// to create the mock functions before the factory runs.

const { mockLimit, mockWhere, mockFrom, mockSelect, mockUpdateWhere, mockSet, mockUpdate, mockValues, mockInsert, mockDb } = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));

  const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
  const mockSet = vi.fn(() => ({ where: mockUpdateWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));

  const mockValues = vi.fn().mockResolvedValue(undefined);
  const mockInsert = vi.fn(() => ({ values: mockValues }));

  const mockDb = {
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
  };

  return { mockLimit, mockWhere, mockFrom, mockSelect, mockUpdateWhere, mockSet, mockUpdate, mockValues, mockInsert, mockDb };
});

vi.mock('@/libs/Env', () => ({
  Env: { DATABASE_URL: 'postgresql://test' },
}));

vi.mock('@/libs/DB', () => ({
  db: mockDb,
}));

// ── Test data ─────────────────────────────────────────────────────────────────

const IP_HASH = 'abc123hashed';
const ACTION = 'assessment_submit';

type RateLimitRow = {
  id: number;
  ipHash: string;
  action: string;
  windowStart: Date;
  count: number;
  createdAt: Date;
};

function makeRow(count: number): RateLimitRow {
  return {
    id: 1,
    ipHash: IP_HASH,
    action: ACTION,
    windowStart: new Date(),
    count,
    createdAt: new Date(),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-wire chain return values after clearAllMocks resets them
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdateWhere.mockResolvedValue(undefined);
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined);
  });

  it('inserts a new record and returns {allowed: true} when no existing record', async () => {
    mockLimit.mockResolvedValueOnce([]);

    const result = await checkRateLimit(IP_HASH, ACTION);

    expect(result).toEqual({ allowed: true });
    expect(mockInsert).toHaveBeenCalledOnce();
    expect(mockValues).toHaveBeenCalledOnce();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('increments count and returns {allowed: true} when count is below the limit', async () => {
    mockLimit.mockResolvedValueOnce([makeRow(1)]);

    const result = await checkRateLimit(IP_HASH, ACTION);

    expect(result).toEqual({ allowed: true });
    expect(mockUpdate).toHaveBeenCalledOnce();
    expect(mockSet).toHaveBeenCalledWith({ count: 2 });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns {allowed: false, retryAfter > 0} when count equals the default max (3)', async () => {
    mockLimit.mockResolvedValueOnce([makeRow(3)]);

    const result = await checkRateLimit(IP_HASH, ACTION);

    expect(result.allowed).toBe(false);

    if (!result.allowed) {
      expect(result.retryAfter).toBeGreaterThan(0);
    }

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('increments count and returns {allowed: true} when count is 2 (just below default max)', async () => {
    mockLimit.mockResolvedValueOnce([makeRow(2)]);

    const result = await checkRateLimit(IP_HASH, ACTION);

    expect(result).toEqual({ allowed: true });
    expect(mockUpdate).toHaveBeenCalledOnce();
    expect(mockSet).toHaveBeenCalledWith({ count: 3 });
  });

  it('returns {allowed: false} with custom maxRequests=1 when count=1', async () => {
    mockLimit.mockResolvedValueOnce([makeRow(1)]);

    const result = await checkRateLimit(IP_HASH, ACTION, { maxRequests: 1 });

    expect(result.allowed).toBe(false);

    if (!result.allowed) {
      expect(result.retryAfter).toBeGreaterThan(0);
    }
  });

  it('allows request with custom maxRequests=5 when count=4', async () => {
    mockLimit.mockResolvedValueOnce([makeRow(4)]);

    const result = await checkRateLimit(IP_HASH, ACTION, { maxRequests: 5 });

    expect(result).toEqual({ allowed: true });
    expect(mockUpdate).toHaveBeenCalledOnce();
    expect(mockSet).toHaveBeenCalledWith({ count: 5 });
  });

  it('retryAfter is within the custom windowMs when blocked', async () => {
    const windowMs = 60_000; // 1 minute
    mockLimit.mockResolvedValueOnce([makeRow(3)]);

    const result = await checkRateLimit(IP_HASH, ACTION, { windowMs, maxRequests: 3 });

    expect(result.allowed).toBe(false);

    if (!result.allowed) {
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(windowMs / 1000);
    }
  });

  it('passes the correct arguments through the select query chain', async () => {
    mockLimit.mockResolvedValueOnce([]);

    await checkRateLimit(IP_HASH, ACTION);

    expect(mockSelect).toHaveBeenCalledOnce();
    expect(mockFrom).toHaveBeenCalledOnce();
    expect(mockWhere).toHaveBeenCalledOnce();
    expect(mockLimit).toHaveBeenCalledWith(1);
  });
});
