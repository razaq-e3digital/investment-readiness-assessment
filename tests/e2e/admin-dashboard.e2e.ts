/**
 * E2E: Admin dashboard
 *
 * Tests cover unauthenticated access (which must redirect to /sign-in) and
 * document what full admin tests would require.
 *
 * Full admin tests require:
 * 1. A Clerk test-mode account with `publicMetadata.role === 'admin'` set.
 * 2. A signed-in session — use Playwright's storageState or a setup fixture
 *    that calls the Clerk API to create and sign in a test user.
 * 3. A seeded database with assessment records.
 *
 * See the Playwright docs on authentication setup:
 * https://playwright.dev/docs/auth
 *
 * The boilerplate ships with a `tests/e2e/*.setup.ts` pattern for auth flows.
 * Implement `tests/e2e/admin.setup.ts` once Clerk test credentials are
 * configured in the CI environment.
 */

import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Unauthenticated access — no Clerk session
// ---------------------------------------------------------------------------

test.describe('Admin dashboard — unauthenticated access', () => {
  test('redirects unauthenticated user from /dashboard/admin to /sign-in', async ({ page }) => {
    await page.goto('/dashboard/admin');

    // Clerk middleware redirects to /sign-in for unauthenticated admin routes
    await page.waitForURL(/\/sign-in/, { timeout: 10000 });

    expect(page.url()).toContain('/sign-in');
  });

  test('redirects unauthenticated user from /dashboard to /sign-in', async ({ page }) => {
    await page.goto('/dashboard');

    await page.waitForURL(/\/sign-in/, { timeout: 10000 });

    expect(page.url()).toContain('/sign-in');
  });

  test('returns 403 for unauthenticated /api/admin/stats request', async ({ request }) => {
    const response = await request.get('/api/admin/stats');

    // Clerk middleware rejects unauthenticated API admin routes.
    // The actual status may be 401 (Clerk) or 403 (middleware), depending on
    // middleware configuration.
    expect([401, 403]).toContain(response.status());
  });

  test('returns 403 for unauthenticated /api/admin/assessments request', async ({ request }) => {
    const response = await request.get('/api/admin/assessments');

    expect([401, 403]).toContain(response.status());
  });

  test('sign-in page renders correctly', async ({ page }) => {
    await page.goto('/sign-in');

    // Clerk renders the sign-in form — look for an email input or heading
    await expect(
      page.getByRole('heading', { name: /sign in/i })
        .or(page.getByLabel(/email/i))
        .or(page.getByPlaceholder(/email/i)),
    ).toBeVisible({ timeout: 15000 });
  });
});

// ---------------------------------------------------------------------------
// Authenticated non-admin access
// ---------------------------------------------------------------------------

test.describe('Admin dashboard — authenticated non-admin access (requires auth setup)', () => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(
    !process.env.ENABLE_AUTH_TESTS,
    'Skipped — set ENABLE_AUTH_TESTS=true and configure Clerk test credentials '
    + 'in tests/e2e/auth.setup.ts.',
  );

  // When these tests are enabled, use storageState from the auth setup fixture:
  // test.use({ storageState: 'playwright/.auth/user.json' });

  test('authenticated non-admin is redirected from /dashboard/admin to /dashboard', async ({
    page,
  }) => {
    await page.goto('/dashboard/admin');

    // A user without role:admin is redirected to the regular dashboard
    await page.waitForURL(/\/dashboard$/, { timeout: 10000 });

    expect(page.url()).toMatch(/\/dashboard$/);
  });
});

// ---------------------------------------------------------------------------
// Admin access (requires Clerk admin credentials + seeded DB)
// ---------------------------------------------------------------------------

test.describe('Admin dashboard — admin access (requires admin auth + seeded DB)', () => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(
    !process.env.ENABLE_ADMIN_TESTS,
    'Skipped — set ENABLE_ADMIN_TESTS=true, configure admin auth in '
    + 'tests/e2e/admin.setup.ts, and seed the test database.',
  );

  // When these tests are enabled, use storageState from the admin auth setup fixture:
  // test.use({ storageState: 'playwright/.auth/admin.json' });

  test('admin user can access /dashboard/admin', async ({ page }) => {
    await page.goto('/dashboard/admin');

    await expect(page.getByRole('heading', { name: /admin|dashboard/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test('admin dashboard shows the KPI summary cards', async ({ page }) => {
    await page.goto('/dashboard/admin');

    // KPICard components show total assessments, this week, avg score, booked
    await expect(page.getByText(/total assessments/i)).toBeVisible();
    await expect(page.getByText(/this week/i)).toBeVisible();
    await expect(page.getByText(/avg.*score|average score/i)).toBeVisible();
    await expect(page.getByText(/booked/i)).toBeVisible();
  });

  test('admin dashboard renders the assessments table', async ({ page }) => {
    await page.goto('/dashboard/admin');

    // AssessmentTable renders a data table — look for table or list headers
    await expect(
      page.getByRole('table').or(page.getByRole('grid')),
    ).toBeVisible({ timeout: 15000 });
  });

  test('admin can view individual assessment detail', async ({ page }) => {
    await page.goto('/dashboard/admin');

    // Click the first row in the table
    const firstRow = page.getByRole('row').nth(1);
    await firstRow.click();

    // Should navigate to /dashboard/admin/assessments/[id]
    await page.waitForURL(/\/dashboard\/admin\/assessments\/.+/, { timeout: 10000 });

    expect(page.url()).toMatch(/\/dashboard\/admin\/assessments\//);
  });

  test('admin can export CSV', async ({ page }) => {
    await page.goto('/dashboard/admin');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export.*csv/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  });

  test('admin can mark an assessment as booked', async ({ page }) => {
    await page.goto('/dashboard/admin');

    // Click the first row to open assessment detail
    await page.getByRole('row').nth(1).click();
    await page.waitForURL(/\/dashboard\/admin\/assessments\/.+/, { timeout: 10000 });

    // Click "Mark as Booked" button
    await page.getByRole('button', { name: /mark as booked/i }).click();

    // Should show a success confirmation
    await expect(page.getByText(/booked|updated/i)).toBeVisible({ timeout: 5000 });
  });

  test('/api/admin/stats returns valid JSON for admin user', async ({ request }) => {
    // This test relies on the admin auth cookies being set via storageState.
    const response = await request.get('/api/admin/stats');

    expect(response.status()).toBe(200);

    const json = await response.json() as Record<string, unknown>;

    expect(typeof json.totalAssessments).toBe('number');
    expect(typeof json.averageScore).toBe('number');
  });

  test('admin analytics page renders charts', async ({ page }) => {
    await page.goto('/dashboard/admin?tab=analytics');

    // Recharts renders SVG elements
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 15000 });
  });
});
