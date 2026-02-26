import Link from 'next/link';

import { Logo } from '@/components/Logo';

export default function AssessmentNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-card-border bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="E3 Digital home">
          <Logo />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          Save & Exit
        </Link>
      </div>
    </nav>
  );
}
