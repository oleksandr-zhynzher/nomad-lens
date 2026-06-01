import { expect, test } from "@playwright/test";

test("loads the app shell and navigates primary views", async ({ page }) => {
  await page.goto("/");

  const header = page.getByRole("banner");

  await expect(page.getByRole("link", { name: /nomad lens/i })).toBeVisible();
  await expect(header.getByRole("link", { name: /^list$/i })).toBeVisible();
  await expect(header.getByRole("link", { name: /^map$/i })).toBeVisible();
  await expect(header.getByRole("link", { name: /^compare$/i })).toBeVisible();

  await header.getByRole("link", { name: /^map$/i }).click();
  await expect(page).toHaveURL(/\/map$/);

  await header.getByRole("link", { name: /^compare$/i }).click();
  await expect(page).toHaveURL(/\/compare$/);
});
