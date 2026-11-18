import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LoadingBars } from "./loading-bars";

describe("LoadingBars", () => {
  it("anuncia la carga con texto y dibuja tres barras ocultas para lectores de pantalla", () => {
    const html = renderToStaticMarkup(<LoadingBars />);
    expect(html).toContain('role="status"');
    expect(html).toContain("Cargando…");
    expect(html.match(/fx-loading-bar/g)).toHaveLength(3);
    expect(html).toContain('aria-hidden="true"');
  });

  it("acepta otro texto", () => {
    expect(renderToStaticMarkup(<LoadingBars label="Cargando sesión…" />)).toContain("Cargando sesión…");
  });
});
