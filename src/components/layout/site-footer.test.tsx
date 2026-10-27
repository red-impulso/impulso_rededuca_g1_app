import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { SiteFooter } from "./site-footer";

test("el pie incluye la leyenda del grupo", () => {
  const html = renderToStaticMarkup(<SiteFooter />);
  expect(html).toContain(
    "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina",
  );
});
