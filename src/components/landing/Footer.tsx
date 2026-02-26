import Link from 'next/link';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Col 1 — Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent-blue">
                <span className="text-sm font-bold text-white">E3</span>
              </div>
              <span className="text-base font-bold text-white">E3 Digital</span>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-text-muted">
              Helping founders prepare for investment with clarity and confidence.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/razaqsherif/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/e3digital"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Product */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/assessment" className="text-sm text-text-muted transition-colors hover:text-white">
                  Assessment
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-text-muted transition-colors hover:text-white">
                  How it works
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-text-muted transition-colors hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 — Resources */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-text-muted transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-text-muted transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 — Company */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://e3.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-muted transition-colors hover:text-white"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="mailto:razaq@e3.digital"
                  className="text-sm text-text-muted transition-colors hover:text-white"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-text-muted">
            {`© ${currentYear} E3 Digital. All rights reserved.`}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-text-muted transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <span className="text-text-muted/40" aria-hidden="true">·</span>
            <Link href="/terms" className="text-xs text-text-muted transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
