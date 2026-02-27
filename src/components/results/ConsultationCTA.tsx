type Props = {
  bookingUrl: string;
};

export default function ConsultationCTA({ bookingUrl }: Props) {
  return (
    <section id="consultation-cta" className="bg-navy px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white">Ready to close those gaps?</h2>
        <p className="mt-4 text-base text-text-muted">
          Book a free strategy call to discuss your results and create a personalised action plan.
        </p>

        <div className="mt-8">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-cta-green px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-cta-green-hover"
          >
            {/* Calendar icon */}
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Book Your Free Strategy Call
          </a>
        </div>

        <p className="mt-4 text-xs text-text-muted">Free · No obligation · 30 minutes</p>
      </div>
    </section>
  );
}
