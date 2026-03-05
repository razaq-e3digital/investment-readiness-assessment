import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that require admin role
const isAdminRoute = createRouteMatcher([
  '/dashboard/admin(.*)',
  '/api/admin(.*)',
]);

// Routes that only require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

// Public API routes (no auth check) — assessment submit, webhooks, results
const isPublicApiRoute = createRouteMatcher([
  '/api/assessment(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip auth check for public API routes
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // Admin routes: require authentication + admin role
  if (isAdminRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
    });

    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;

    if (metadata?.role !== 'admin') {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  }

  // Protect dashboard and other authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
    });
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on all routes except static files, Next.js internals, and Sentry tunnel
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
