import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const FOOTER_TEXT = "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina";

// Next agrega un <div role="alert"> propio (anunciador de rutas); buscamos solo el del formulario
const formAlert = (page: Page) => page.locator("form").getByRole("alert");

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
    await expect(
      page.getByRole("heading", { name: "Te damos la bienvenida" }),
    ).toBeVisible();
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
});

test("avisa si faltan datos", async ({ page }) => {
    await page.goto("/ingresar");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(formAlert(page)).toHaveText(
    "Completá tu correo y tu contraseña.",
    );
});

test("muestra un error visible si el ingreso falla", async ({ page }) => {
    await page.goto("/ingresar");
    await page.getByLabel("Correo electrónico").fill("nadie@demo.rededuca");
    await page.getByLabel("Contraseña").fill("contraseña-incorrecta");
    await page.getByRole("button", { name: "Ingresar" }).click();
    // Sin variables de entorno avisa que faltan; con Supabase real, "Correo o contraseña incorrectos."
    await expect(formAlert(page)).toBeVisible();
    await expect(page).toHaveURL(/\/ingresar$/);
});

test("muestra Recordarme y el enlace para recuperar la contraseña", async ({ page }) => {
    await page.goto("/ingresar");
    await expect(page.getByLabel("Recordarme")).not.toBeChecked();
    await page.getByRole("link", { name: "Recuperar contraseña" }).click();
    await expect(page).toHaveURL(/\/recuperar-contrasena$/);
});

test("avisa si el correo no es válido", async ({ page }) => {
    await page.goto("/ingresar");
    await page.getByLabel("Correo electrónico").fill("correo-sin-arroba");
    await page.getByLabel("Contraseña").fill("cualquiera");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(formAlert(page)).toHaveText("Ingresa un correo válido.");
});
});

test.describe("/recuperar-contrasena", () => {
test("es pública y muestra el pie exacto", async ({ page }) => {
    await page.goto("/recuperar-contrasena");
    await expect(page).toHaveURL(/\/recuperar-contrasena$/);
    await expect(page.getByRole("heading", { name: "Recuperar contraseña" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toHaveText(FOOTER_TEXT);
});

test("avisa si el correo no es válido", async ({ page }) => {
    await page.goto("/recuperar-contrasena");
    await page.getByRole("button", { name: "Enviar enlace" }).click();
    await expect(formAlert(page)).toHaveText("Ingresa un correo válido.");
});
});
