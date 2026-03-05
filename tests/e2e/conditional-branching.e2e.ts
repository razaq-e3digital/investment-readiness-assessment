/**
 * E2E: Conditional question branching
 *
 * Tests that the hasPayingCustomers conditional logic works correctly:
 * - Selecting "yes-recurring" or "yes-oneoff" reveals currentMRR and
 *   customerGrowthRate questions.
 * - Selecting "no-free-users" or "no-users" hides those conditional questions.
 *
 * These tests only require the Next.js server to be running.
 * No database or AI API is needed — the branching is purely client-side.
 */

import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper: navigate through section 1 with minimum valid answers
// so we reach section 2 (Product & Traction).
// ---------------------------------------------------------------------------
async function completeSectionOne(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/assessment');

  // Q1: problemClarity (radio)
  await page.getByRole('button', { name: 'Very clearly' }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  // Q2: targetCustomer (textarea — min 10 chars)
  await page.getByRole('textbox', { name: /target customer/i }).fill(
    'B2B SaaS companies with 50–200 employees struggling with data silos.',
  );
  await page.getByRole('button', { name: /continue/i }).click();

  // Q3: marketSize (radio)
  await page.getByRole('button', { name: '£1B+' }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  // Q4: competitorAwareness (radio)
  await page.getByRole('button', { name: 'Deep understanding' }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  // Q5: uniqueAdvantage (textarea — min 10 chars)
  await page.getByRole('textbox', { name: /unique advantage/i }).fill(
    'Purpose-built automation cuts manual effort by 80% with zero code required.',
  );
  await page.getByRole('button', { name: /continue/i }).click();

  // Now on Section 2: Product & Traction
  await expect(page.getByRole('heading', { name: /product.*traction/i })).toBeVisible();
}

// ---------------------------------------------------------------------------
// Helper: advance past a radio question within the current section.
// ---------------------------------------------------------------------------
async function selectAndContinue(
  page: import('@playwright/test').Page,
  radioTitle: string,
): Promise<void> {
  await page.getByRole('button', { name: radioTitle }).click();
  await page.getByRole('button', { name: /continue/i }).click();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Conditional branching — hasPayingCustomers', () => {
  test('selecting "Yes, recurring revenue" reveals MRR and growth rate questions', async ({
    page,
  }) => {
    await completeSectionOne(page);

    // Section 2, Q1: productStage
    await selectAndContinue(page, 'Revenue-generating product');

    // Section 2, Q2: hasPayingCustomers — choose "yes-recurring"
    await page.getByRole('button', { name: 'Yes, recurring revenue' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Conditional Q: currentMRR number input MUST be visible
    await expect(page.getByRole('spinbutton', { name: /mrr/i })).toBeVisible();
  });

  test('selecting "Yes, some one-off payments" reveals MRR and growth rate questions', async ({
    page,
  }) => {
    await completeSectionOne(page);

    await selectAndContinue(page, 'Revenue-generating product');

    // hasPayingCustomers — "yes-oneoff"
    await page.getByRole('button', { name: 'Yes, some one-off payments' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // currentMRR input should appear
    await expect(page.getByRole('spinbutton', { name: /mrr/i })).toBeVisible();
  });

  test('selecting "No, but have free users" hides MRR and growth rate questions', async ({
    page,
  }) => {
    await completeSectionOne(page);

    await selectAndContinue(page, 'Live product with users');

    // hasPayingCustomers — "no-free-users"
    await page.getByRole('button', { name: 'No, but have free users' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // MRR field must NOT be visible
    await expect(page.getByRole('spinbutton', { name: /mrr/i })).toBeHidden();

    // evidenceOfDemand multiselect should appear (the next question after skipping conditionals)
    await expect(page.getByText(/evidence of demand/i)).toBeVisible();
  });

  test('selecting "No users yet" hides MRR and growth rate questions', async ({ page }) => {
    await completeSectionOne(page);

    await selectAndContinue(page, 'Concept/idea only');

    // hasPayingCustomers — "no-users"
    await page.getByRole('button', { name: 'No users yet' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // MRR field must NOT be visible
    await expect(page.getByRole('spinbutton', { name: /mrr/i })).toBeHidden();

    // Should jump straight to evidenceOfDemand
    await expect(page.getByText(/evidence of demand/i)).toBeVisible();
  });

  test('changing from "yes-recurring" to "no" hides the MRR question', async ({ page }) => {
    await completeSectionOne(page);

    await selectAndContinue(page, 'Revenue-generating product');

    // First select yes-recurring → MRR appears
    await page.getByRole('button', { name: 'Yes, recurring revenue' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // MRR should be visible
    await expect(page.getByRole('spinbutton', { name: /mrr/i })).toBeVisible();

    // Go back to hasPayingCustomers question
    await page.getByRole('button', { name: /back/i }).click();

    // Change selection to "No, but have free users"
    await page.getByRole('button', { name: 'No, but have free users' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // MRR should now be hidden
    await expect(page.getByRole('spinbutton', { name: /mrr/i })).toBeHidden();
  });

  test('MRR field is required when hasPayingCustomers is yes-recurring', async ({ page }) => {
    await completeSectionOne(page);

    await selectAndContinue(page, 'Revenue-generating product');

    // Select yes-recurring
    await page.getByRole('button', { name: 'Yes, recurring revenue' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // MRR field visible — click Continue without filling it
    await expect(page.getByRole('spinbutton', { name: /mrr/i })).toBeVisible();

    await page.getByRole('button', { name: /continue/i }).click();

    // Should show validation error
    await expect(page.getByText(/mrr|arr|please enter/i)).toBeVisible();
  });

  test('MRR field accepts a valid numeric value and advances', async ({ page }) => {
    await completeSectionOne(page);

    await selectAndContinue(page, 'Revenue-generating product');

    // Select yes-recurring
    await page.getByRole('button', { name: 'Yes, recurring revenue' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill MRR
    await page.getByRole('spinbutton', { name: /mrr/i }).fill('5000');
    await page.getByRole('button', { name: /continue/i }).click();

    // Should advance to customerGrowthRate question
    await expect(page.getByText(/customer growth rate/i)).toBeVisible();
  });
});
