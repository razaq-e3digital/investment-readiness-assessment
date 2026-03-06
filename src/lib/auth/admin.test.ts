import { auth } from '@clerk/nextjs/server';

import { isAdmin, requireAdmin } from './admin';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

type SessionClaims = {
  metadata?: { role?: string };
  [key: string]: unknown;
};

type AuthResult = {
  userId: string | null;
  sessionClaims: SessionClaims | null;
};

const mockAuth = vi.mocked(auth);

function setupAuth(result: AuthResult): void {
  mockAuth.mockResolvedValue(result as never);
}

describe('isAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when there is no userId (unauthenticated)', async () => {
    setupAuth({ userId: null, sessionClaims: null });
    const result = await isAdmin();

    expect(result).toBe(false);
  });

  it('returns true when userId is present and role is "admin"', async () => {
    setupAuth({
      userId: 'user_abc123',
      sessionClaims: { metadata: { role: 'admin' } },
    });
    const result = await isAdmin();

    expect(result).toBe(true);
  });

  it('returns false when userId is present but role is "user"', async () => {
    setupAuth({
      userId: 'user_abc123',
      sessionClaims: { metadata: { role: 'user' } },
    });
    const result = await isAdmin();

    expect(result).toBe(false);
  });

  it('returns false when userId is present but sessionClaims has no metadata', async () => {
    setupAuth({
      userId: 'user_abc123',
      sessionClaims: {},
    });
    const result = await isAdmin();

    expect(result).toBe(false);
  });

  it('returns false when userId is present but sessionClaims is null', async () => {
    setupAuth({
      userId: 'user_abc123',
      sessionClaims: null,
    });
    const result = await isAdmin();

    expect(result).toBe(false);
  });

  it('returns false when userId is present but metadata.role is an empty string', async () => {
    setupAuth({
      userId: 'user_abc123',
      sessionClaims: { metadata: { role: '' } },
    });
    const result = await isAdmin();

    expect(result).toBe(false);
  });
});

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a 401 response when there is no userId', async () => {
    setupAuth({ userId: null, sessionClaims: null });

    const response = await requireAdmin();

    expect(response).not.toBeNull();
    expect(response?.status).toBe(401);

    const body = await response?.json() as { error: string };

    expect(body).toEqual({ error: 'unauthorized' });
  });

  it('returns a 403 response when logged in but not an admin', async () => {
    setupAuth({
      userId: 'user_abc123',
      sessionClaims: { metadata: { role: 'user' } },
    });

    const response = await requireAdmin();

    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);

    const body = await response?.json() as { error: string };

    expect(body).toEqual({ error: 'forbidden' });
  });

  it('returns null when the user is an authenticated admin', async () => {
    setupAuth({
      userId: 'user_abc123',
      sessionClaims: { metadata: { role: 'admin' } },
    });

    const response = await requireAdmin();

    expect(response).toBeNull();
  });

  it('returns a 401 response (not 403) when completely unauthenticated', async () => {
    setupAuth({ userId: null, sessionClaims: null });

    const response = await requireAdmin();

    expect(response?.status).toBe(401);
  });

  it('returns a 403 when session has no metadata at all', async () => {
    setupAuth({ userId: 'user_abc123', sessionClaims: {} });

    const response = await requireAdmin();

    expect(response?.status).toBe(403);
  });
});
