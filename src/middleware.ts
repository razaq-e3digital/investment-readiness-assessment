import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that require authentication
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
    return;
  }

  // Protect dashboard and other authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
    });
  }
});

export const config = {
  // Run middleware on all routes except static files, Next.js internals, and Sentry tunnel
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
