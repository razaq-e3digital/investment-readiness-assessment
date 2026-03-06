/**
 * E2E: Assessment happy-path flow
 *
 * These tests require a fully running server with a live database and
 * OpenRouter API key.  The submission endpoint calls the AI scoring model,
 * inserts a row, and redirects to /results/[uuid].  Without those services
 * the final redirect cannot be verified.
 *
 * To run against a live dev server:
 *   npm run dev        (in one terminal)
 *   npx playwright test tests/e2e/assessment-flow.e2e.ts
 *
 * In CI the test suite is configured to start the server automatically via
 * the `webServer` option in playwright.config.ts.
 */

import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper: fill a radio-card question by visible option title
// ---------------------------------------------------------------------------
async function selectRadioCard(
  page: import('@playwright/test').Page,
  optionTitle: string,
): Promise<void> {
  await page.getByRole('button', { name: optionTitle }).click();
}

// ---------------------------------------------------------------------------
// Helper: fill a multiselect question by option title (checkboxes/toggle cards)
// ---------------------------------------------------------------------------
async function selectMulti(
  page: import('@playwright/test').Page,
  optionTitles: string[],
): Promise<void> {
  for (const title of optionTitles) {
    await page.getByRole('button', { name: title }).click();
  }
}

// ---------------------------------------------------------------------------
// Helper: advance to next section
// ---------------------------------------------------------------------------
async function clickContinue(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: /continue/i }).click();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Assessment happy-path flow (requires live API)', () => {
  // Skip entire suite in environments without a real database/AI backend.
  // Remove this `test.skip` call to run locally once services are available.
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(
    !!process.env.CI && !process.env.ENABLE_LIVE_API_TESTS,
    'Skipped in CI — needs live database + OpenRouter API key. '
    + 'Set ENABLE_LIVE_API_TESTS=true to run.',
  );

  test('navigates from landing page to assessment form', async ({ page }) => {
    await page.goto('/');

    // Multiple CTAs exist on the landing page — use the hero one
    const startButton = page.getByRole('link', { name: /start.*assessment/i }).first();

    await expect(startButton).toBeVisible();

    await startButton.click();

    await expect(page).toHaveURL(/\/assessment/);

    // Progress bar and section indicator should be present
    await expect(page.getByRole('progressbar')).toBeVisible();
    // Section heading: "Problem-Market Fit" is section 1
    await expect(page.getByRole('heading', { name: /problem.market fit/i })).toBeVisible();
  });

  test('navigates directly to /assessment and shows section 1', async ({ page }) => {
    await page.goto('/assessment');

    await expect(page.getByRole('heading', { name: /problem.market fit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  test('completes all 11 sections and submits (full happy path)', async ({ page }) => {
    await page.goto('/assessment');

    // ── Section 1: Problem-Market Fit ──────────────────────────────────────
    await selectRadioCard(page, 'Very clearly');
    await clickContinue(page);

    // targetCustomer — textarea, wait for field to appear
    await page.getByRole('textbox', { name: /target customer/i }).fill(
      'Mid-market B2B SaaS companies with 50–500 employees struggling with manual reporting.',
    );
    await clickContinue(page);

    await selectRadioCard(page, '£1B+');
    await clickContinue(page);

    await selectRadioCard(page, 'Deep understanding');
    await clickContinue(page);

    await page.getByRole('textbox', { name: /unique advantage/i }).fill(
      'Our AI-native approach reduces report generation time from 3 days to 15 minutes with 95% accuracy.',
    );
    await clickContinue(page);

    // ── Section 2: Product & Traction ──────────────────────────────────────
    await selectRadioCard(page, 'Revenue-generating product');
    await clickContinue(page);

    await selectRadioCard(page, 'Yes, recurring revenue');
    await clickContinue(page);

    // currentMRR — conditional number field
    await page.getByRole('spinbutton', { name: /mrr/i }).fill('12000');
    await clickContinue(page);

    // customerGrowthRate — conditional radio
    await selectRadioCard(page, '>20%');
    await clickContinue(page);

    // evidenceOfDemand — multiselect
    await selectMulti(page, ['Paying customers', 'Signed LOIs']);
    await clickContinue(page);

    // ── Section 3: Business Model ───────────────────────────────────────────
    await selectRadioCard(page, 'Clear and validated');
    await clickContinue(page);

    // primaryRevenueModel — dropdown
    await page.getByRole('combobox', { name: /primary revenue model/i }).selectOption('saas');
    await clickContinue(page);

    await selectRadioCard(page, 'Positive and improving');
    await clickContinue(page);

    await selectRadioCard(page, 'Very confident – tested');
    await clickContinue(page);

    // ── Section 4: Team ────────────────────────────────────────────────────
    await selectRadioCard(page, '2 co-founders');
    await clickContinue(page);

    await selectRadioCard(page, 'Yes, all covered');
    await clickContinue(page);

    await selectRadioCard(page, 'Yes, successful exit');
    await clickContinue(page);

    await page.getByRole('spinbutton', { name: /full.time team/i }).fill('6');
    await clickContinue(page);

    // ── Section 5: Financials ──────────────────────────────────────────────
    await selectRadioCard(page, 'Detailed 3-year model');
    await clickContinue(page);

    await page.getByRole('spinbutton', { name: /monthly burn/i }).fill('18000');
    await clickContinue(page);

    await selectRadioCard(page, '12+ months');
    await clickContinue(page);

    await selectRadioCard(page, 'Yes, institutional (VC/angel)');
    await clickContinue(page);

    // ── Section 6: Go-to-Market ────────────────────────────────────────────
    await selectRadioCard(page, 'Detailed and executing');
    await clickContinue(page);

    await selectMulti(page, ['Content marketing', 'Sales team', 'Referrals']);
    await clickContinue(page);

    await selectRadioCard(page, 'Known and optimising');
    await clickContinue(page);

    await selectRadioCard(page, 'Highly repeatable');
    await clickContinue(page);

    // ── Section 7: Legal & IP ──────────────────────────────────────────────
    await selectRadioCard(page, 'Yes, Ltd company');
    await clickContinue(page);

    await selectMulti(page, ['Patents filed', 'Trade secrets']);
    await clickContinue(page);

    await selectRadioCard(page, 'All in place');
    await clickContinue(page);

    // ── Section 8: Investment Readiness ────────────────────────────────────
    await selectRadioCard(page, 'Yes, investor-ready');
    await clickContinue(page);

    await selectRadioCard(page, 'Clear ask with use of funds');
    await clickContinue(page);

    // investmentStage — dropdown
    await page.getByRole('combobox', { name: /investment stage/i }).selectOption('seed');
    await clickContinue(page);

    await selectRadioCard(page, 'Yes, active discussions');
    await clickContinue(page);

    // ── Section 9: Metrics & Data ──────────────────────────────────────────
    await selectRadioCard(page, 'Comprehensive dashboard');
    await clickContinue(page);

    await selectMulti(page, ['MRR/ARR', 'Customer acquisition cost', 'Lifetime value', 'Churn rate']);
    await clickContinue(page);

    await selectRadioCard(page, 'Yes, clear upward trends');
    await clickContinue(page);

    // ── Section 10: Vision & Scalability ──────────────────────────────────
    await selectRadioCard(page, '£100M+ revenue potential');
    await clickContinue(page);

    await page.getByRole('textbox', { name: /scalability strategy/i }).fill(
      'We will expand from the UK market to the US and EU by year 3, leveraging our existing '
      + 'integrations and partner network. Our platform architecture supports multi-tenant '
      + 'scaling without linear cost increases.',
    );
    await clickContinue(page);

    await page.getByRole('textbox', { name: /biggest risks/i }).fill(
      'Main risks: 1) Enterprise sales cycle length — mitigating with a self-serve SMB tier. '
      + '2) AI model costs — managing via caching and model fine-tuning. '
      + '3) Regulation — monitoring EU AI Act compliance proactively.',
    );
    await clickContinue(page);

    // ── Section 11: Contact Information ────────────────────────────────────
    await page.getByRole('textbox', { name: /full name/i }).fill('Jane Smith');
    await clickContinue(page);

    await page.getByRole('textbox', { name: /email/i }).fill('jane@testfounder.com');
    await clickContinue(page);

    // Optional fields — skip company and LinkedIn, contactSource
    await clickContinue(page); // company (optional)
    await clickContinue(page); // linkedin (optional)
    await clickContinue(page); // source (optional)

    // Consent checkbox
    await page.getByRole('checkbox', { name: /consent/i }).check();

    // Submit
    await page.getByRole('button', { name: /submit assessment/i }).click();

    // ── Processing screen ──────────────────────────────────────────────────
    // Should show the processing animation
    await expect(page.getByText(/preparing your personalised report/i)).toBeVisible({
      timeout: 5000,
    });

    // After AI scoring completes, expect redirect to /results/[uuid]
    await page.waitForURL(/\/results\/[\da-f-]{36}/, { timeout: 60000 });

    // Verify results page loaded
    await expect(page.getByText(/investor readiness score/i)).toBeVisible();
  });

  test('Back button returns to previous section', async ({ page }) => {
    await page.goto('/assessment');

    // Answer section 1, question 1 (problemClarity) and advance
    await selectRadioCard(page, 'Very clearly');
    await clickContinue(page);

    // Now on question 2 (targetCustomer textarea)
    await expect(page.getByRole('textbox', { name: /target customer/i })).toBeVisible();

    // Click Back — should return to question 1
    await page.getByRole('button', { name: /back/i }).click();

    // Radio option "Very clearly" should still be selected (checked state)
    await expect(page.getByRole('button', { name: 'Very clearly' })).toBeVisible();
  });
});
