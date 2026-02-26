type Step = {
  number: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: '01',
    iconBg: 'bg-accent-blue-light',
    icon: (
      <svg className="size-6 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: 'Answer Questions',
    description: 'Work through ~40 targeted questions across 10 investor criteria in under 10 minutes.',
  },
  {
    number: '02',
    iconBg: 'bg-score-green-bg',
    icon: (
      <svg className="size-6 text-score-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'Get Analyzed',
    description: 'Our AI engine evaluates your responses against real investor criteria used by seed-stage VCs.',
  },
  {
    number: '03',
    iconBg: 'bg-purple-100',
    icon: (
      <svg className="size-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Receive Report',
    description: 'Get your personalised score, gap analysis, and actionable recommendations delivered instantly.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-page-bg py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-text-primary">How It Works</h2>
          <p className="mt-3 text-base text-text-secondary">
            Three simple steps to understand your investment readiness
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-card-border bg-white p-6 shadow-card"
            >
              {/* Connector line (desktop only, between cards) */}
              {index < steps.length - 1 && (
                <div
                  className="absolute right-0 top-1/2 hidden h-px w-6 translate-x-full bg-card-border md:block"
                  aria-hidden="true"
                />
              )}

              {/* Step number */}
              <div className="mb-4 text-4xl font-bold text-text-muted/30">{step.number}</div>

              {/* Icon circle */}
              <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${step.iconBg}`}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="mb-2 text-xl font-semibold text-text-primary">{step.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
