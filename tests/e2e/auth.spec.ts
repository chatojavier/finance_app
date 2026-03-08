import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

function uniqueEmail(): string {
  return `codex.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function signup(page: Page, email: string, password: string) {
  await page.goto("/auth/signup");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
}

test("anonymous users are redirected from private routes", async ({ page }) => {
  const privateRoutes = [
    "/",
    "/accounts",
    "/transactions",
    "/categories",
    "/transfers",
    "/credit-card",
    "/fx",
    "/reports",
  ];

  for (const route of privateRoutes) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/auth\/login$/);
  }
});

test("signup, refresh, logout and login work end-to-end", async ({ page }) => {
  const email = uniqueEmail();
  const password = "secret12";

  await signup(page, email, password);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /home/i }).first()).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/$/);

  await page
    .getByRole("button", { name: /log out/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/auth\/login$/);

  await login(page, email, password);
  await expect(page).toHaveURL(/\/$/);
});

test("authenticated users are redirected away from auth routes", async ({ page }) => {
  const email = uniqueEmail();
  const password = "secret12";

  await signup(page, email, password);
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/auth/login");
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/auth/signup");
  await expect(page).toHaveURL(/\/$/);
});

test("invalid credentials show an error", async ({ page }) => {
  await login(page, uniqueEmail(), "wrong12");

  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
});

test.describe("mobile overflow menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows secondary routes and logout", async ({ page }) => {
    const email = uniqueEmail();
    const password = "secret12";

    await signup(page, email, password);
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole("button", { name: /more/i }).click();

    await expect(page.getByRole("link", { name: /categories/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /transfers/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /credit card/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^fx$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /log out/i })).toBeVisible();
  });
});
