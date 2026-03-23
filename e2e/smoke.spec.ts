import { test, expect } from '@playwright/test';

test('homepage has title and hero text', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SlicePizza/);

  // Check for hero text
  const heroText = page.getByText(/Premium Artisan Pizzas/i);
  await expect(heroText).toBeVisible();
});

test('can view menu items', async ({ page }) => {
  await page.goto('/');
  
  // Wait for initial load if necessary
  await expect(page.getByText(/Firing up the oven/i)).toBeVisible();

  // Wait for menu to load (increased timeout for API call)
  const menuTitle = page.getByText(/Our Menu/i);
  await expect(menuTitle).toBeVisible({ timeout: 30000 });

  // Check if at least one pizza card is visible
  // The PizzaCard component uses a "Customize" button
  const pizzaButton = page.getByRole('button', { name: /Customize/i }).first();
  await expect(pizzaButton).toBeVisible();
});

test('can open auth modal', async ({ page }) => {
  await page.goto('/');
  
  // Click sign in button
  await page.getByRole('button', { name: /Sign In/i }).click();

  // Check if modal is visible (using text that should be in the modal)
  const modalTitle = page.getByText(/Welcome Back/i);
  await expect(modalTitle).toBeVisible();
});
