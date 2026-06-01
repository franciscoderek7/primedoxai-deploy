// @ts-check
const { test, expect } = require('@playwright/test');

// Visual regression snapshots — run `playwright test --update-snapshots` once to
// generate the baseline, then CI catches unintended visual changes on every push.

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test(`full-page snapshot — ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    // Wait for fonts / CSS transitions to settle
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`index-${vp.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02, // Allow up to 2% pixel difference before failing
    });
  });
}
