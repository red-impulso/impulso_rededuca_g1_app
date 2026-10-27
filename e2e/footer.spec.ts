import { expect, test } from "@playwright/test";

test('el pie muestra "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina"', async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo")).toHaveText(
    "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina",
  );
});
