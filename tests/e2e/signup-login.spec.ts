import { test, expect } from '@playwright/test';

test.describe('Signup → Login → Dashboard', () => {
  const timestamp = Date.now();
  const name = `E2E User ${timestamp}`;
  const email = `e2e.user.${timestamp}@example.test`;
  const password = 'password123';

  test('should sign up, log in, and reach dashboard', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/signup/);

    // Fill signup form
    await page.fill('#name', name);
    await page.fill('#email', email);
    await page.fill('#phone', '+911234567890');
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);

    // Click Create Account
    await page.click('text=Create Account');

    // After signup, should navigate to login
    await page.waitForURL(/\/login/);

    // Fill login form
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('text=Sign In');

    // After login, should reach dashboard
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify there's a greeting or dashboard element
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
  });
});
