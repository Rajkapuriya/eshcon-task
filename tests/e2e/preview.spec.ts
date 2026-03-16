import { test, expect } from '@playwright/test';

test.describe('Page Preview Smoke Tests', () => {
  test('should render the mocked page sections', async ({ page }) => {
    // Navigating to the preview with the stubbed adapter
    await page.goto('/preview/smoke-test-slug');

    // Hero section should be visible
    await expect(page.locator('section').filter({ hasText: 'Welcome to the Studio' })).toBeVisible();

    // CTA section has a visible button
    const ctaButton = page.getByRole('link', { name: 'Go to Editor' });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '/studio/smoke-test-slug');
  });
});

test.describe('Studio Editor Smoke Tests', () => {
  test('should allow interacting with editor state', async ({ page, context }) => {
    // Set mock cookie to bypass RBAC
    await context.addCookies([
      { name: 'user_role', value: 'editor', domain: 'localhost', path: '/' }
    ]);

    await page.goto('/studio/smoke-test-slug');
    
    // Sidebar and canvas frame should be visible
    await expect(page.getByText('Page Studio')).toBeVisible();

    // Click on the hero section to select it
    await page.getByRole('heading', { name: 'Welcome to the Studio' }).click({ force: true });

    // Ensure editor shows up in sidebar for hero
    await expect(page.getByText('Edit hero')).toBeVisible();
    
    // Change a property
    const input = page.getByPlaceholder('Enter title...');
    await input.fill('Updated E2E Title');
    
    // Assert visual canvas updated
    await expect(page.locator('text=Updated E2E Title')).toBeVisible();
    
    // Publish button should activate
    const publishBtn = page.getByRole('button', { name: 'Publish' });
    await expect(publishBtn).toBeEnabled();
  });
});
