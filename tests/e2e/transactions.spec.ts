import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

function uniqueEmail(): string {
  return `transactions.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function signup(page: Page, email: string, password: string) {
  await page.goto("/auth/signup");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/$/);
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

async function createCategory(page: Page, name: string, kind: "income" | "expense") {
  await page.goto("/categories/new");
  await page.getByLabel(/nombre/i).fill(name);
  await page.getByLabel(/tipo/i).selectOption(kind);
  await page.getByRole("button", { name: /crear categoría/i }).click();
  await expect(page).toHaveURL(/\/categories$/);
}

test("create income transaction from transactions page updates balances", async ({ page }) => {
  const email = uniqueEmail();
  const password = "secret12";

  await signup(page, email, password);
  await createAccount(page, "Cuenta ingresos", "asset", "PEN");
  await createCategory(page, "Sueldo base", "income");

  await page.goto("/transactions");
  await expect(page.getByText(/aún no tienes movimientos/i)).toBeVisible();

  await page.getByLabel(/cuenta/i).selectOption({ label: "Cuenta ingresos (PEN)" });
  await page.getByLabel(/monto/i).fill("120.00");
  await page.getByLabel(/dirección/i).selectOption("in");
  await page.getByLabel(/fecha/i).fill("2026-03-23T10:30");
  await page.getByLabel(/categoría/i).selectOption({ label: "Sueldo base" });
  await page.getByLabel(/nota/i).fill("Pago mensual");
  await page.getByRole("button", { name: /guardar movimiento/i }).click();

  await expect(page).toHaveURL(/\/transactions$/);
  await expect(page.getByText(/pago mensual/i)).toBeVisible();
  await expect(page.getByText(/ingreso · sueldo base/i)).toBeVisible();

  await page.goto("/accounts");
  await expect(page.getByText(/120\.00/).first()).toBeVisible();

  await page.getByRole("link", { name: /ver/i }).first().click();
  await expect(page.getByText(/pago mensual/i)).toBeVisible();
});

test("account-scoped transactions flow keeps the filter and updates recent activity", async ({
  page,
}) => {
  const email = uniqueEmail();
  const password = "secret12";

  await signup(page, email, password);
  const accountUrl = await createAccount(page, "Cuenta gastos", "asset", "PEN");
  await createCategory(page, "Mercado", "expense");

  await page.goto(accountUrl);
  await page.getByRole("link", { name: /crear movimiento/i }).click();
  await expect(page).toHaveURL(/\/transactions\?accountId=/);
  await expect(page.getByText(/filtro activo/i)).toBeVisible();
  await expect(page.getByLabel(/cuenta/i)).toHaveValue(/Cuenta gastos \(PEN\)/i);

  await page.getByLabel(/monto/i).fill("10.00");
  await page.getByLabel(/fecha/i).fill("2026-03-23T12:00");
  await page.getByLabel(/categoría/i).selectOption({ label: "Mercado" });
  await page.getByLabel(/nota/i).fill("Compra de prueba");
  await page.getByRole("button", { name: /guardar movimiento/i }).click();

  await expect(page).toHaveURL(/\/transactions\?accountId=/);
  await expect(page.getByText(/compra de prueba/i)).toBeVisible();

  await page.goto(accountUrl);
  await expect(page.getByText(/compra de prueba/i)).toBeVisible();
  await expect(page.getByText(/10\.00/).first()).toBeVisible();
});

test("archived account cannot be used from the transactions page", async ({ page }) => {
  const email = uniqueEmail();
  const password = "secret12";

  await signup(page, email, password);
  const accountUrl = await createAccount(page, "Cuenta archivada", "asset", "USD");

  await page.goto(accountUrl);
  await page.getByRole("link", { name: /editar cuenta/i }).click();
  await page.getByLabel(/cuenta archivada/i).check();
  await page.getByRole("button", { name: /guardar cambios/i }).click();

  await expect(page).toHaveURL(/\/accounts\/.+$/);
  await expect(page.getByText(/cuenta archivada/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /crear movimiento/i })).toHaveCount(0);

  const accountId = accountUrl.split("/").pop();
  await page.goto(`/transactions?accountId=${accountId}`);

  await page.getByLabel(/monto/i).fill("20.00");
  await page.getByLabel(/fecha/i).fill("2026-03-23T15:15");
  await page.getByRole("button", { name: /guardar movimiento/i }).click();

  await expect(page.getByText(/cuenta archivada/i).first()).toBeVisible();
  await expect(
    page.getByText(/no puedes registrar movimientos en una cuenta archivada/i)
  ).toBeVisible();
});
