import type { Metadata } from 'next';

import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export const metadata: Metadata = {
  title: 'Dashboard — E3 Digital Investor Readiness',
  description: 'Manage your investor readiness assessments',
};

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <div className="shadow-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-4">
          <DashboardHeader
            menu={[
              { href: '/dashboard', label: 'Home' },
            ]}
          />
        </div>
      </div>

      <div className="min-h-[calc(100vh-72px)] bg-muted">
        <div className="mx-auto max-w-screen-xl px-3 pb-16 pt-6">
          {props.children}
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
