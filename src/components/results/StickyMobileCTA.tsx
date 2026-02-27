'use client';

import { useEffect, useState } from 'react';

type Props = {
  bookingUrl: string;
};

export default function StickyMobileCTA({ bookingUrl }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const ctaSection = document.getElementById('consultation-cta');
      if (!ctaSection) {
        setVisible(window.scrollY > 500);
        return;
      }
      const rect = ctaSection.getBoundingClientRect();
      // Show when the CTA section has scrolled fully out of view (above or below)
      setVisible(rect.bottom < 0 || rect.top > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!bookingUrl || bookingUrl === '#') {
    return null;
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <div className="bg-white px-4 pb-4 pt-3">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg bg-cta-green py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-cta-green-hover"
        >
          Book Strategy Call
        </a>
      </div>
    </div>
  );
}
