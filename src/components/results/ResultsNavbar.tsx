import Link from 'next/link';

export default function ResultsNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent-blue">
              <span className="text-sm font-bold text-white">E3</span>
            </div>
            <span className="text-lg font-bold text-navy">E3 Digital</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <Link
              href="/assessment"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-accent-blue"
            >
              Assessment
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-accent-blue"
            >
              Home
            </Link>
          </nav>

          {/* Right actions */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-accent-blue"
            >
              Login
            </Link>
            <Link
              href="/assessment"
              className="rounded-lg bg-accent-blue px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
