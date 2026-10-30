import { expect, test } from "@playwright/test";

const FOOTER_TEXT = "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina";

test.describe("rutas protegidas", () => {
test("visitar /inicio sin sesión termina en /ingresar", async ({ page }) => {
    await page.goto("/inicio");
    await expect(page).toHaveURL(/\/ingresar$/);
});

test("visitar / sin sesión termina en /ingresar", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ingresar$/);
});
});

test.describe("/ingresar", () => {
test("muestra el pie exacto", async ({ page }) => {
    await page.goto("/ingresar");
    await expect(page.getByRole("contentinfo")).toHaveText(FOOTER_TEXT);
});

test("muestra el formulario de correo y contraseña", async ({ page }) => {
    await page.goto("/ingresar");
    await expect(page.getByRole("heading", { name: "Ingresar" })).toBeVisible();
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
});

test("avisa si faltan datos", async ({ page }) => {
    await page.goto("/ingresar");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByRole("alert")).toHaveText(
    "Completá tu correo y tu contraseña.",
    );
});

test("muestra un error visible si el ingreso falla", async ({ page }) => {
    await page.goto("/ingresar");
    await page.getByLabel("Correo electrónico").fill("nadie@demo.rededuca");
    await page.getByLabel("Contraseña").fill("contraseña-incorrecta");
    await page.getByRole("button", { name: "Ingresar" }).click();
    // Sin variables de entorno avisa que faltan; con Supabase real, "Correo o contraseña incorrectos."
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/ingresar$/);
});
});