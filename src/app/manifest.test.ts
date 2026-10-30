import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

const root = process.cwd();
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

// Lee el valor de una variable de marca (--brand, --page...) de globals.css
function cssVar(name: string) {
  return new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1];
}

describe("manifiesto de la app", () => {
  const m = manifest();

  it("es instalable como app independiente", () => {
    expect(m.name).toBe("RedEduca");
    expect(m.short_name).toBe("RedEduca");
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/");
    expect(m.lang).toBe("es");
  });

  it("incluye íconos PNG de 192 y 512 px que existen en public/", () => {
    for (const size of ["192x192", "512x512"]) {
      const icon = m.icons?.find((i) => i.sizes === size);
      expect(icon, `falta el ícono de ${size}`).toBeDefined();
      expect(icon?.type).toBe("image/png");
      expect(() => readFileSync(join(root, "public", icon!.src))).not.toThrow();
    }
  });

  it("usa los colores de la marca de globals.css", () => {
    expect(m.theme_color?.toLowerCase()).toBe(cssVar("brand")?.toLowerCase());
    expect(m.background_color?.toLowerCase()).toBe(cssVar("page")?.toLowerCase());
  });
});
