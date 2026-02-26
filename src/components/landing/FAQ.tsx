'use client';

import Link from 'next/link';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { trackEvent } from '@/utils/analytics';

type FaqItem = {
  value: string;
  question: string;
  answer: React.ReactNode;
};

const faqItems: FaqItem[] = [
  {
    value: 'how-long',
    question: 'How long does the assessment take?',
    answer: 'Most founders complete it in 8–10 minutes. There are around 40 questions across 10 categories, designed to be answered quickly and honestly. No preparation needed — just answer from where your business is today.',
  },
  {
    value: 'is-free',
    question: 'Is it really free?',
    answer: 'Yes, completely free. No credit card, no hidden fees. You\'ll receive your full score, category breakdown, and recommendations at no cost.',
  },
  {
    value: 'data-privacy',
    question: 'What happens with my data?',
    answer: (
      <>
        Your assessment responses and contact information are stored securely and used solely to generate your report and provide follow-up support.
        We do not sell your data. See our
        {' '}
        <Link href="/privacy" className="text-accent-blue underline hover:text-accent-blue-hover">
          Privacy Policy
        </Link>
        {' '}
        for full details.
      </>
    ),
  },
  {
    value: 'ai-accuracy',
    question: 'How accurate is the AI scoring?',
    answer: 'The assessment is based on the criteria used by real seed-stage investors — market size, team, traction, financials, and more. While no AI can guarantee investment outcomes, the scoring gives you a directional signal grounded in what investors actually look for.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-page-bg py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-text-primary">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-text-secondary">
            Everything you need to know about the assessment
          </p>
        </div>

        {/* Accordion — centred, max 768px wide */}
        <div className="mx-auto max-w-3xl">
          <Accordion
            type="single"
            collapsible
            className="rounded-xl border border-card-border bg-white shadow-card"
            onValueChange={(value) => {
              if (value) {
                trackEvent('faq_expand', { question: value });
              }
            }}
          >
            {faqItems.map(item => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border-b border-card-border px-6 last:border-b-0"
              >
                <AccordionTrigger className="text-base font-medium text-text-primary hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-text-secondary">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
