import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Check if the current Clerk session belongs to an admin user.
 * Admin role is set via Clerk Dashboard → User → Public Metadata → { "role": "admin" }
 */
export async function isAdmin(): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return false;
  }
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  return metadata?.role === 'admin';
}

/**
 * Guard for admin API routes. Returns a 401/403 response if the user is not an admin,
 * or null if the user is allowed to proceed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return null;
}
