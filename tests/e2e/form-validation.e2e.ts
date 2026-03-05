/**
 * E2E: Assessment form validation behaviour
 *
 * These tests verify that the form correctly shows inline error messages
 * when a user tries to advance without answering, enters invalid data,
 * and that errors clear when valid values are entered.
 *
 * These tests only require the Next.js dev/production server to be running
 * (no database or AI API needed — validation is purely client-side).
 */

import { expect, test } from '@playwright/test';

test.describe('Assessment form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assessment');

    // Section 1, question 1 (problemClarity) is a radio — visible immediately
    await expect(page.getByRole('heading', { name: /problem.market fit/i })).toBeVisible();
  });

  // ── Section 1, Q1: Radio required ─────────────────────────────────────────

  test('shows error when clicking Continue without selecting a radio option', async ({ page }) => {
    // Do not select any radio card — click Continue immediately
    await page.getByRole('button', { name: /continue/i }).click();

    // Expect an inline error message
    await expect(page.getByText(/please answer this question/i)).toBeVisible();
  });

  test('error clears after selecting a radio option', async ({ page }) => {
    // Trigger the error first
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText(/please answer this question/i)).toBeVisible();

    // Select a valid option
    await page.getByRole('button', { name: 'Very clearly' }).click();

    // Error should be gone (or hidden)
    await expect(page.getByText(/please answer this question/i)).toBeHidden();
  });

  test('can advance after selecting a valid radio option', async ({ page }) => {
    await page.getByRole('button', { name: 'Somewhat clearly' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Should advance to question 2 (targetCustomer textarea)
    await expect(page.getByRole('textbox', { name: /target customer/i })).toBeVisible();
  });

  // ── Section 1, Q2: Textarea min-length ────────────────────────────────────

  test('shows error when textarea has fewer than 10 characters', async ({ page }) => {
    // Navigate to targetCustomer (question 2 in section 1)
    await page.getByRole('button', { name: 'Very clearly' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByRole('textbox', { name: /target customer/i })).toBeVisible();

    // Enter fewer than 10 characters
    await page.getByRole('textbox', { name: /target customer/i }).fill('Too short');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText(/at least 10 characters/i)).toBeVisible();
  });

  test('textarea error clears when 10+ characters are entered', async ({ page }) => {
    await page.getByRole('button', { name: 'Very clearly' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    const textarea = page.getByRole('textbox', { name: /target customer/i });

    // Trigger error
    await textarea.fill('Short');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText(/at least 10 characters/i)).toBeVisible();

    // Fix the input
    await textarea.fill('B2B SaaS companies with 50-500 employees.');
    await page.getByRole('button', { name: /continue/i }).click();

    // Should advance — textarea error no longer visible
    await expect(page.getByText(/at least 10 characters/i)).toBeHidden();
  });

  // ── Section 11: Email format validation ────────────────────────────────────

  test('shows error for invalid email format', async ({ page }) => {
    // Navigate to section 11 (Contact Information) by going directly
    // We navigate using a helper to speed up the test.
    // Inject form state programmatically to skip the earlier sections.
    await page.evaluate(() => {
      // Store a completed form state in sessionStorage so that when the
      // AssessmentForm mounts we can pre-fill.  Since the form state is
      // managed by React Hook Form (in-memory), we reach section 11
      // by clicking through via JS dispatch.  The quickest approach is
      // to use the URL approach or click through.  We skip to the
      // contact section by simulating completed sections.
    });

    // Faster approach: click through sections with minimum valid answers,
    // then arrive at section 11 to test email validation.
    // Section 1: problemClarity → radio
    await page.getByRole('button', { name: 'Very clearly' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // targetCustomer → textarea
    await page.getByRole('textbox', { name: /target customer/i }).fill(
      'Mid-market B2B SaaS companies with manual reporting pain.',
    );
    await page.getByRole('button', { name: /continue/i }).click();

    // marketSize → radio
    await page.getByRole('button', { name: '£1B+' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // competitorAwareness → radio
    await page.getByRole('button', { name: 'Deep understanding' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // uniqueAdvantage → textarea
    await page.getByRole('textbox', { name: /unique advantage/i }).fill(
      'AI-native approach: 15 minutes vs 3 days. Validated with 20 design partners.',
    );
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 2: productStage → radio
    await page.getByRole('button', { name: 'Live product with users' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // hasPayingCustomers → radio (no — skip MRR/growth rate conditionals)
    await page.getByRole('button', { name: 'No, but have free users' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // evidenceOfDemand → multiselect
    await page.getByRole('button', { name: 'Waitlist signups' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 3: revenueModelClarity → radio
    await page.getByRole('button', { name: 'Clear but unvalidated' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // primaryRevenueModel → dropdown
    await page.getByRole('combobox', { name: /primary revenue model/i }).selectOption('saas');
    await page.getByRole('button', { name: /continue/i }).click();

    // unitEconomics → radio
    await page.getByRole('button', { name: 'Negative but path to positive' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // pricingConfidence → radio
    await page.getByRole('button', { name: 'Still experimenting' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 4: coFounderCount → radio
    await page.getByRole('button', { name: '2 co-founders' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // teamCoverage → radio
    await page.getByRole('button', { name: 'Most covered, one gap' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // founderExperience → radio
    await page.getByRole('button', { name: 'No, but relevant industry experience' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // fullTimeTeamSize → number
    await page.getByRole('spinbutton', { name: /full.time team/i }).fill('3');
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 5: financialModel → radio
    await page.getByRole('button', { name: 'Basic projections' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // monthlyBurnRate → number
    await page.getByRole('spinbutton', { name: /monthly burn/i }).fill('8000');
    await page.getByRole('button', { name: /continue/i }).click();

    // runwayMonths → radio
    await page.getByRole('button', { name: '6–12 months' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // priorFunding → radio
    await page.getByRole('button', { name: 'Bootstrapped only' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 6: gtmStrategy → radio
    await page.getByRole('button', { name: 'Planned but not started' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // acquisitionChannels → multiselect
    await page.getByRole('button', { name: 'Content marketing' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // cacKnowledge → radio
    await page.getByRole('button', { name: 'Don\'t know yet' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // salesRepeatability → radio
    await page.getByRole('button', { name: 'Ad hoc' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 7: companyIncorporation → radio
    await page.getByRole('button', { name: 'Yes, Ltd company' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // ipProtection → multiselect
    await page.getByRole('button', { name: 'No IP protection' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // keyAgreements → radio
    await page.getByRole('button', { name: 'Most in place' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 8: hasPitchDeck → radio
    await page.getByRole('button', { name: 'Yes, but needs work' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // fundingAskClarity → radio
    await page.getByRole('button', { name: 'General idea' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // investmentStage → dropdown
    await page.getByRole('combobox', { name: /investment stage/i }).selectOption('pre-seed');
    await page.getByRole('button', { name: /continue/i }).click();

    // investorConversations → radio
    await page.getByRole('button', { name: 'Not yet' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 9: trackingMetrics → radio
    await page.getByRole('button', { name: 'Tracking basics' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // metricsTracked → multiselect
    await page.getByRole('button', { name: 'MRR/ARR' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // canDemonstrateGrowth → radio
    await page.getByRole('button', { name: 'Too early for trends' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 10: visionScale → radio
    await page.getByRole('button', { name: '£10M–£100M' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // scalabilityStrategy → textarea
    await page.getByRole('textbox', { name: /scalability strategy/i }).fill(
      'Expand internationally via channel partners and a product-led growth motion.',
    );
    await page.getByRole('button', { name: /continue/i }).click();

    // biggestRisks → textarea
    await page.getByRole('textbox', { name: /biggest risks/i }).fill(
      'Churn risk — investing in onboarding. Competition risk — building moats via integrations.',
    );
    await page.getByRole('button', { name: /continue/i }).click();

    // ── Now on Section 11: Contact Information ─────────────────────────────
    await expect(page.getByRole('heading', { name: /contact information/i })).toBeVisible();

    // contactName
    await page.getByRole('textbox', { name: /full name/i }).fill('Test User');
    await page.getByRole('button', { name: /continue/i }).click();

    // contactEmail — enter invalid email format
    const emailField = page.getByRole('textbox', { name: /email/i });
    await emailField.fill('not-a-valid-email');
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show email validation error
    await expect(page.getByText(/valid email/i)).toBeVisible();

    // Fix the email
    await emailField.fill('test@example.com');
    await page.getByRole('button', { name: /continue/i }).click();

    // Error should clear — moved past the email question
    await expect(page.getByText(/valid email/i)).toBeHidden();
  });

  // ── Multiselect: must select at least one ──────────────────────────────────

  test('shows error when multiselect has no options selected', async ({ page }) => {
    // Navigate to section 2, evidenceOfDemand (a multiselect)
    // First complete section 1
    await page.getByRole('button', { name: 'Very clearly' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('textbox', { name: /target customer/i }).fill(
      'Enterprise HR teams in companies with 200+ employees struggling with manual reviews.',
    );
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: '£100M–£1B' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: 'General awareness' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('textbox', { name: /unique advantage/i }).fill(
      'Purpose-built for HR workflows — saves 8 hours per review cycle per manager.',
    );
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 2, Q1: productStage
    await page.getByRole('button', { name: 'MVP/beta' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 2, Q2: hasPayingCustomers
    await page.getByRole('button', { name: 'No users yet' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Section 2, Q5: evidenceOfDemand (multiselect) — click Continue without selecting
    await expect(page.getByText(/evidence of demand/i)).toBeVisible();

    await page.getByRole('button', { name: /continue/i }).click();

    // Should show validation error for multiselect
    await expect(page.getByText(/select at least one/i)).toBeVisible();
  });
});
