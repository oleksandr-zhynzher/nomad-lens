import { expect, test } from "@playwright/test";

test("loads the app shell and navigates primary views", async ({ page }) => {
  await page.goto("/");

  const header = page.getByRole("banner");

  await expect(page.getByRole("button", { name: /nomad lens/i })).toBeVisible();
  await expect(header.getByRole("button", { name: /^list$/i })).toBeVisible();
  await expect(header.getByRole("button", { name: /^map$/i })).toBeVisible();
  await expect(header.getByRole("button", { name: /^compare$/i })).toBeVisible();

  await header.getByRole("button", { name: /^map$/i }).click();
  await expect(page).toHaveURL(/\/map$/);

  await header.getByRole("button", { name: /^compare$/i }).click();
  await expect(page).toHaveURL(/\/compare$/);
});
