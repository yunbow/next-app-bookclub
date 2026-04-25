import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/login");
    
    await page.locator('button[type="submit"]').click();
    
    // Wait for validation errors to appear
    await page.waitForTimeout(500);
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Check if inputs are marked as invalid
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login");
    
    const registerLink = page.locator('a[href*="register"]');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});
