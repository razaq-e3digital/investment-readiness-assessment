type Props = {
  quickWins: string[];
  mediumTerm: string[];
};

export default function NextSteps({ quickWins, mediumTerm }: Props) {
  return (
    <div className="rounded-xl border border-card-border bg-white p-6 shadow-card">
      <h2 className="mb-6 text-xl font-semibold text-text-primary">Your Action Plan</h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Quick wins */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-score-green-bg">
              {/* Lightning bolt */}
              <svg
                className="size-4 text-score-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-text-primary">Do This Week</h3>
          </div>
          <ul className="space-y-3">
            {quickWins.map(win => (
              <li key={win} className="flex gap-3 text-sm text-text-secondary">
                <span
                  className="mt-1.5 size-1.5 flex-none rounded-full bg-score-green"
                  aria-hidden="true"
                />
                {win}
              </li>
            ))}
          </ul>
        </div>

        {/* Medium-term */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent-blue-light">
              {/* Calendar */}
              <svg
                className="size-4 text-accent-blue"
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
            </div>
            <h3 className="text-base font-semibold text-text-primary">Over Next 1–3 Months</h3>
          </div>
          <ul className="space-y-3">
            {mediumTerm.map(item => (
              <li key={item} className="flex gap-3 text-sm text-text-secondary">
                <span
                  className="mt-1.5 size-1.5 flex-none rounded-full bg-accent-blue"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
