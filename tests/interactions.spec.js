// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the PRIMEDOX logo and tagline', async ({ page }) => {
    await expect(page.locator('.logo')).toHaveText('PRIMEDOX');
    await expect(page.locator('.tagline')).toContainText('Constitutional Defense');
  });

  test('displays all three pricing cards', async ({ page }) => {
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(3);

    await expect(cards.nth(0).locator('.card-name')).toHaveText('Free');
    await expect(cards.nth(1).locator('.card-name')).toHaveText('Pro Defense');
    await expect(cards.nth(2).locator('.card-name')).toHaveText('Elite Defense');
  });

  test('shows correct prices for each tier', async ({ page }) => {
    const cards = page.locator('.card');
    await expect(cards.nth(0).locator('.card-price')).toContainText('$0');
    await expect(cards.nth(1).locator('.card-price')).toContainText('$49');
    await expect(cards.nth(2).locator('.card-price')).toContainText('$199');
  });

  test('displays all four feature items', async ({ page }) => {
    const features = page.locator('.feature-item');
    await expect(features).toHaveCount(4);
    await expect(features.nth(0)).toContainText('OmniaGuard Security');
    await expect(features.nth(1)).toContainText('BENO-X Framework');
    await expect(features.nth(2)).toContainText('12-Appearance Sovereignty');
    await expect(features.nth(3)).toContainText('Charter Defense');
  });

  test('footer shows correct company name', async ({ page }) => {
    await expect(page.locator('.footer')).toContainText('Francisco Holdings Inc.');
  });
});

test.describe('Button interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('emergency button shows correct alert message', async ({ page }) => {
    const dialogPromise = page.waitForEvent('dialog');
    await page.locator('.emergency-btn').click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Emergency Defense — Coming Soon');
    await dialog.dismiss();
  });

  test('Pro Defense upgrade button shows "Stripe coming soon" alert', async ({ page }) => {
    const proCard = page.locator('.card').nth(1);
    const dialogPromise = page.waitForEvent('dialog');
    await proCard.locator('.card-btn').click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Stripe coming soon!');
    await dialog.dismiss();
  });

  test('Elite Defense upgrade button shows "Stripe coming soon" alert', async ({ page }) => {
    const eliteCard = page.locator('.card').nth(2);
    const dialogPromise = page.waitForEvent('dialog');
    await eliteCard.locator('.card-btn').click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Stripe coming soon!');
    await dialog.dismiss();
  });

  test('Free tier "Current" button does not trigger a dialog', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    const freeCard = page.locator('.card').nth(0);
    await freeCard.locator('.card-btn').click();

    // Small wait to confirm no dialog appears
    await page.waitForTimeout(300);
    expect(dialogFired).toBe(false);
  });
});

test.describe('Responsive layout', () => {
  test('page renders without overflow on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('emergency button is fully visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const btn = page.locator('.emergency-btn');
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box.width).toBeGreaterThan(0);
  });

  test('all pricing cards stack vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const cards = page.locator('.card');
    const boxes = await Promise.all(
      [0, 1, 2].map(i => cards.nth(i).boundingBox())
    );

    // Each card should start below the previous one (vertical stacking)
    expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 1);
    expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height - 1);
  });
});
