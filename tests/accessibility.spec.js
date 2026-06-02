// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility (axe)', () => {
  test('page has no critical or serious accessibility violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalOrSerious.length > 0) {
      const summary = criticalOrSerious.map(v =>
        `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map(n => n.html).join(', ')}`
      ).join('\n\n');
      expect.soft(criticalOrSerious, `Accessibility violations:\n${summary}`).toHaveLength(0);
    }

    expect(criticalOrSerious).toHaveLength(0);
  });

  test('all buttons have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      // Button text, aria-label, or aria-labelledby must provide an accessible name
      const accessibleName = await btn.evaluate(el => {
        return (
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          el.textContent?.trim()
        );
      });
      expect(
        accessibleName,
        `Button at index ${i} is missing an accessible name`
      ).toBeTruthy();
    }
  });

  test('page has a document title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('html element has a lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });
});
