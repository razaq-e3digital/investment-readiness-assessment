'use client';

import { ClerkProvider } from '@clerk/nextjs';

// ClerkProvider is scoped to the (auth) route group only.
// Public pages (landing, results) are outside this group and do not require Clerk.
export default function AuthLayout(props: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
    >
      {props.children}
    </ClerkProvider>
  );
}
