import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investor Readiness Assessment — E3 Digital',
  description: 'Complete your investor readiness assessment.',
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
