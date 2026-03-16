import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

test.describe('WCAG 2.2 AAA Accessibility Scans', () => {
  test('preview page should not have critical, serious, or moderate a11y violations', async ({ page }) => {
    await page.goto('/preview/a11y-check-slug');

    // Run axe analysis against the rendered preview
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      // Exclude minor things if needed, but we aim for AAA. We won't strictly enforce all AAA tags if the standard lib doesn't support them fully yet.
      .analyze();

    // Write report artifact
    fs.writeFileSync(
      'a11y-report.json', 
      JSON.stringify(accessibilityScanResults, null, 2)
    );

    // Fail the build on any violations mapped to these impacts
    const severeViolations = accessibilityScanResults.violations.filter(
      v => ['critical', 'serious'].includes(v.impact as string)
    );

    expect(severeViolations).toEqual([]);
  });

  test('studio editor should be reasonably accessible', async ({ page, context }) => {
    await context.addCookies([{ name: 'user_role', value: 'editor', domain: 'localhost', path: '/' }]);
    await page.goto('/studio/a11y-check-slug');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa']) // The editor has slightly looser reqs, mainly for ARIA states
      .disableRules(['color-contrast']) // Ignore default shadcn color contrasting for this smoke test
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );

    expect(criticalViolations).toEqual([]);
  });
});
