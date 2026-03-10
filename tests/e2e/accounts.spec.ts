import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

function uniqueEmail(): string {
  return `accounts.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function signup(page: Page, email: string, password: string) {
  await page.goto("/auth/signup");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function logout(page: Page) {
  await page
    .getByRole("button", { name: /log out/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/auth\/login$/);
}

async function createAccount(
  page: Page,
  name: string,
  type: "asset" | "liability",
  currency: string
): Promise<string> {
  await page.goto("/accounts/new");
  await page.getByLabel(/nombre/i).fill(name);
  await page.getByLabel(/tipo/i).selectOption(type);
  await page.getByLabel(/moneda/i).selectOption(currency);
  await page.getByRole("button", { name: /crear cuenta/i }).click();
  await expect(page).toHaveURL(/\/accounts\/(?!new$)[^/]+$/);
  return page.url();
}

test("create, edit and archive account flow works", async ({ page }) => {
  const email = uniqueEmail();
  const password = "secret12";

  await signup(page, email, password);

  await page.goto("/accounts");
  await expect(page.getByText(/aún no tienes cuentas/i)).toBeVisible();

  await createAccount(page, "Cuenta principal", "asset", "PEN");
  await expect(page.getByRole("heading", { name: /cuenta principal/i })).toBeVisible();

  await page.getByRole("link", { name: /editar cuenta/i }).click();
  await expect(page).toHaveURL(/\/accounts\/.+\/edit$/);
  await page.getByLabel(/nombre/i).fill("Cuenta principal editada");
  await page.getByLabel(/tipo/i).selectOption("liability");
  await page.getByLabel(/cuenta archivada/i).check();
  await page.getByRole("button", { name: /guardar cambios/i }).click();

  await expect(page).toHaveURL(/\/accounts\/.+$/);
  await expect(page.getByRole("heading", { name: /cuenta principal editada/i })).toBeVisible();
  await expect(page.getByText(/archivada/i).first()).toBeVisible();

  await page.goto("/accounts");
  await expect(page.getByText(/aún no tienes cuentas/i)).toBeVisible();
  await page.getByRole("link", { name: /mostrar archivadas/i }).click();
  await expect(page.getByText(/cuenta principal editada/i)).toBeVisible();
  await expect(page.getByText(/archivada/i).first()).toBeVisible();
});

test("account detail shows CTA to create movement", async ({ page }) => {
  const email = uniqueEmail();
  const password = "secret12";

  await signup(page, email, password);
  await createAccount(page, "Cuenta CTA", "asset", "USD");

  const createMovementLink = page.getByRole("link", { name: /crear movimiento/i });
  await expect(createMovementLink).toBeVisible();
  await expect(createMovementLink).toHaveAttribute("href", /\/transactions\?accountId=/);
});

test("users cannot access another user's account details", async ({ page }) => {
  const emailA = uniqueEmail();
  const emailB = uniqueEmail();
  const password = "secret12";

  await signup(page, emailA, password);
  const accountUrl = await createAccount(page, "Cuenta privada", "asset", "EUR");
  await logout(page);

  await signup(page, emailB, password);
  await page.goto(accountUrl);

  await expect(page.getByRole("heading", { name: /cuenta no encontrada/i })).toBeVisible();
});
