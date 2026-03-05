import { auth, currentUser } from '@clerk/nextjs/server';
import { Bell } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'Admin Dashboard — E3 Digital',
  description: 'E3 Digital admin panel',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout(props: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  if (metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  const user = await currentUser();
  const userName = user?.fullName ?? user?.firstName ?? 'Admin';

  return (
    <div className="flex min-h-screen bg-page-bg">
      {/* Dark sidebar */}
      <AdminSidebar userName={userName} />

      {/* Main area (offset by sidebar width) */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-card-border bg-white px-6">
          <div className="relative w-72">
            <svg
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-full rounded-lg border border-card-border bg-page-bg py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button
              type="button"
              className="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-page-bg hover:text-text-primary"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {/* Red dot */}
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
            </button>

            {/* Create new button */}
            <Link
              href="/assessment"
              className="flex h-9 items-center gap-1.5 rounded-lg bg-accent-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
            >
              <span aria-hidden="true">+</span>
              Create New
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {props.children}
        </main>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
