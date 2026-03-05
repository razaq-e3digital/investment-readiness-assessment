'use client';

import {
  BarChart2,
  BookOpen,
  Grid,
  HelpCircle,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/Helpers';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const MANAGEMENT_NAV: NavItem[] = [
  {
    href: '/dashboard/admin',
    label: 'Dashboard',
    icon: <Grid className="size-4 shrink-0" />,
  },
  {
    href: '/dashboard/admin/assessments',
    label: 'Assessments',
    icon: <BookOpen className="size-4 shrink-0" />,
  },
  {
    href: '/dashboard/admin/analytics',
    label: 'Analytics',
    icon: <BarChart2 className="size-4 shrink-0" />,
  },
  {
    href: '/dashboard/admin/assessments?view=founders',
    label: 'Founders',
    icon: <Users className="size-4 shrink-0" />,
  },
];

const SYSTEM_NAV: NavItem[] = [
  {
    href: '/dashboard/admin/settings',
    label: 'Settings',
    icon: <Settings className="size-4 shrink-0" />,
  },
  {
    href: '/dashboard/admin/support',
    label: 'Support',
    icon: <HelpCircle className="size-4 shrink-0" />,
  },
];

type Props = {
  userName: string;
};

export default function AdminSidebar({ userName }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard/admin') {
      return pathname === '/dashboard/admin';
    }
    return pathname.startsWith(href.split('?')[0]!);
  }

  const initials = userName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy">
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="px-6 pb-4 pt-6">
        <Link href="/dashboard/admin" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent-blue">
            <span className="text-sm font-bold text-white">E3</span>
          </div>
          <span className="text-base font-semibold text-white">E3 Digital</span>
        </Link>
        <p className="mt-1 pl-11 text-xs uppercase tracking-wider text-text-muted">
          Admin Panel
        </p>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-4">
        {/* Management section */}
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[#64748b]">
            Management
          </p>
          <ul className="space-y-1">
            {MANAGEMENT_NAV.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-[#94a3b8] hover:text-white',
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* System section */}
        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[#64748b]">
            System
          </p>
          <ul className="space-y-1">
            {SYSTEM_NAV.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:text-white"
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── User info ────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent-blue text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-text-muted">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
