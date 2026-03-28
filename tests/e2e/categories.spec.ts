import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

function uniqueEmail(): string {
  return `categories.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
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

async function createCategory(page: Page, name: string, kind: "income" | "expense") {
  await page.goto("/categories/new");
  await page.getByLabel(/nombre/i).fill(name);
  await page.getByLabel(/tipo/i).selectOption(kind);
  await page.getByRole("button", { name: /crear categoría/i }).click();
  await expect(page).toHaveURL(/\/categories$/);
}

test("create and edit category flow works", async ({ page }) => {
  const email = uniqueEmail();
  const password = "secret12";

  await signup(page, email, password);
  await page.goto("/categories");
  await expect(page.getByText(/aún no tienes categorías/i)).toBeVisible();

  await createCategory(page, "Gasto financiero", "expense");
  await expect(page.getByText("Gasto financiero")).toBeVisible();
  await expect(page.getByText("Gasto").first()).toBeVisible();

  await page
    .getByRole("link", { name: /editar/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/categories\/.+\/edit$/);
  await page.getByLabel(/nombre/i).fill("Ingreso principal");
  await page.getByLabel(/tipo/i).selectOption("income");
  await page.getByRole("button", { name: /guardar cambios/i }).click();

  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.getByText("Ingreso principal")).toBeVisible();
  await expect(page.getByText("Ingreso").first()).toBeVisible();
});

test("users cannot access another user's category edit page", async ({ page }) => {
  const emailA = uniqueEmail();
  const emailB = uniqueEmail();
  const password = "secret12";

  await signup(page, emailA, password);
  await createCategory(page, "Privada", "expense");
  const editLink = page.getByRole("link", { name: /editar/i }).first();
  const editHref = await editLink.getAttribute("href");
  if (!editHref) {
    throw new Error("Missing category edit href");
  }
  await logout(page);

  await signup(page, emailB, password);
  await page.goto(editHref);
  await expect(page.getByRole("heading", { name: /categoría no encontrada/i })).toBeVisible();
});
