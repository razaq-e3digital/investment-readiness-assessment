'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Benefits', href: '#what-you-get' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-slate-200 bg-white shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent-blue">
              <span className="text-sm font-bold text-white">E3</span>
            </div>
            <span
              className={`text-lg font-bold transition-colors ${
                isScrolled ? 'text-navy' : 'text-white'
              }`}
            >
              E3 Digital
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-accent-blue ${
                  isScrolled ? 'text-text-secondary' : 'text-slate-300'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/sign-in"
              className={`text-sm font-medium transition-colors hover:text-accent-blue ${
                isScrolled ? 'text-text-secondary' : 'text-slate-300'
              }`}
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

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className={`flex size-10 items-center justify-center rounded-lg transition-colors md:hidden ${
              isScrolled
                ? 'text-text-secondary hover:bg-slate-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen
              ? (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )
              : (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-white/10 bg-navy md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 p-4 sm:px-6">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 border-t border-white/10 pt-4">
              <Link
                href="/sign-in"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/assessment"
                className="mt-2 block rounded-lg bg-accent-blue px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start Assessment
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
