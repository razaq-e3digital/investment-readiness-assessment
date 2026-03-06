/**
 * E2E: Results page
 *
 * Tests cover:
 * - Loading a results URL with a valid-format UUID (even if no DB record exists,
 *   the page should gracefully 404 rather than throw an unhandled error).
 * - Loading an invalid UUID format → immediate notFound() redirect.
 * - The page is public — no authentication required.
 * - Key UI elements are visible when a real assessment is present.
 *
 * The "score/category/gap elements visible" test requires a seeded database
 * row matching SEEDED_ASSESSMENT_ID.  See tests/fixtures/seed-data.ts for the
 * expected record.  Tests that need a real DB row are guarded by
 * ENABLE_SEEDED_DB_TESTS=true.
 */

import { expect, test } from '@playwright/test';

// A UUID that matches the v4 format but will not exist in any real database.
const VALID_UUID_NO_RECORD = '00000000-0000-4000-a000-000000000001';

// A UUID seeded into the test DB by the db:seed script (see seed-data.ts).
const SEEDED_ASSESSMENT_ID = '11111111-1111-4111-a111-111111111111';

// Strings that do not conform to the UUID v4 format — the page should call
// Next.js notFound() before even querying the database.
const INVALID_UUIDS = [
  'not-a-uuid',
  '12345',
  'abc-def-ghi',
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  '',
] as const;

// ---------------------------------------------------------------------------
// Public access — no auth needed
// ---------------------------------------------------------------------------

test.describe('Results page — public access', () => {
  test('does not redirect to sign-in (page is public)', async ({ page }) => {
    await page.goto(`/results/${VALID_UUID_NO_RECORD}`);

    // Must not be redirected to Clerk's sign-in page
    expect(page.url()).not.toContain('/sign-in');
  });

  test('shows a 404 page for a valid UUID with no matching record', async ({ page }) => {
    await page.goto(`/results/${VALID_UUID_NO_RECORD}`);

    // The custom not-found page renders "Results not found"
    await expect(page.getByRole('heading', { name: /results not found/i })).toBeVisible();

    // 404 indicator text
    await expect(page.getByText('404')).toBeVisible();

    // Link back to assessment
    await expect(page.getByRole('link', { name: /start a new assessment/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Invalid UUID format — immediate 404 (no DB query attempted)
// ---------------------------------------------------------------------------

test.describe('Results page — invalid UUID format', () => {
  for (const invalidId of INVALID_UUIDS) {
    if (invalidId === '') {
      // An empty segment produces a different routing result — skip
      continue;
    }

    test(`shows 404 for invalid UUID: "${invalidId}"`, async ({ page }) => {
      await page.goto(`/results/${invalidId}`);

      // The custom not-found page renders "Results not found".
      // If the custom page is not shown, Next.js renders its own 404.
      // Either way, the user must land on a 404 — expect the custom page.
      await expect(
        page.getByRole('heading', { name: /results not found/i }),
      ).toBeVisible({ timeout: 5000 });
    });
  }
});

// ---------------------------------------------------------------------------
// Results page with a real seeded assessment (needs DB seed + running server)
// ---------------------------------------------------------------------------

test.describe('Results page — seeded assessment (requires seeded DB)', () => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(
    !process.env.ENABLE_SEEDED_DB_TESTS,
    'Skipped — set ENABLE_SEEDED_DB_TESTS=true after running `npm run db:seed`.',
  );

  test.beforeEach(async ({ page }) => {
    await page.goto(`/results/${SEEDED_ASSESSMENT_ID}`);

    // Wait for the page to fully load (not the 404 path)
    await expect(page.getByRole('heading', { name: /investor readiness score/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test('shows the score gauge', async ({ page }) => {
    // ScoreGauge renders an SVG — look for the numeric score or gauge element
    const gauge = page.locator('svg[aria-label*="score"], [data-testid="score-gauge"]');
    const scoreNumber = page.getByText('68');

    const gaugeVisible = (await gauge.count()) > 0;
    const scoreVisible = await scoreNumber.isVisible().catch(() => false);

    expect(gaugeVisible || scoreVisible).toBe(true);
  });

  test('shows the readiness level badge', async ({ page }) => {
    // The seeded record has readinessLevel "nearly_there"
    await expect(
      page.getByText(/nearly there/i),
    ).toBeVisible();
  });

  test('shows the category breakdown section', async ({ page }) => {
    await expect(page.getByText(/category breakdown/i)).toBeVisible();

    // At least one category bar should be rendered
    await expect(page.getByText(/problem.market fit/i)).toBeVisible();
  });

  test('shows the top gaps section', async ({ page }) => {
    await expect(page.getByText(/top.*gaps/i)).toBeVisible();
    // The seeded record has "Financial Model" as a gap
    await expect(page.getByText(/financial model/i)).toBeVisible();
  });

  test('shows next steps / recommendations', async ({ page }) => {
    await expect(page.getByText(/next steps|quick wins|recommendations/i)).toBeVisible();
  });

  test('shows the consultation CTA', async ({ page }) => {
    // ConsultationCTA renders a "Book Strategy Call" or similar button
    const cta = page.getByRole('link', { name: /book.*strategy|book.*call|get.*consultation/i });

    await expect(cta).toBeVisible();
  });

  test('shows the Save Results / Clerk sign-up prompt', async ({ page }) => {
    // SaveResults component offers to save results via Clerk sign-up
    await expect(
      page.getByText(/save your results|create.*account|sign up/i),
    ).toBeVisible();
  });

  test('has the score section with navy background', async ({ page }) => {
    // The hero section uses bg-navy — verify the section exists
    const heroSection = page.locator('section.bg-navy, [class*="bg-navy"]').first();

    await expect(heroSection).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Pending review state (AI not yet scored)
// ---------------------------------------------------------------------------

test.describe('Results page — pending review state (requires seeded DB)', () => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(
    !process.env.ENABLE_SEEDED_DB_TESTS,
    'Skipped — requires a seeded assessment with aiScored=false.',
  );

  test('shows pending review message when AI has not scored yet', async ({ page }) => {
    // This test requires a separate seeded assessment with aiScored=false.
    // Replace with the actual UUID of a pending assessment in your test DB.
    const PENDING_ASSESSMENT_ID = '22222222-2222-4222-b222-222222222222';

    await page.goto(`/results/${PENDING_ASSESSMENT_ID}`);

    await expect(page.getByText(/pending.*review|being processed|generating/i)).toBeVisible({
      timeout: 10000,
    });
  });
});
