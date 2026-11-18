import { isValidElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextMenuIndex, themeButtonLabel, themeIcon, themeMenuReducer } from "./theme-menu";
import { ThemeToggle } from "./theme-toggle";
import { ThemeGroupView, ThemeMenuView } from "./theme-toggle-view";

const setTheme = vi.fn();

// next-themes simulado: el tema guardado es "dark"
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme }),
}));

beforeEach(() => setTheme.mockClear());

type AnyProps = Record<string, unknown> & { children?: ReactNode; onClick?: () => void };

// Sin navegador: busca en el árbol de React el elemento que cumple la condición
function findElement(node: ReactNode, match: (props: AnyProps) => boolean): AnyProps | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, match);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement<AnyProps>(node)) return undefined;
  if (match(node.props)) return node.props;
  return findElement(node.props.children, match);
}

const menuProps = {
  menuId: "menu-tema",
  onToggle: () => {},
  onSelect: () => {},
};

describe("selector de tema: variante menu", () => {
  it("cerrado: el botón tiene aria-expanded=false y no hay menú", () => {
    const html = renderToStaticMarkup(<ThemeMenuView {...menuProps} theme="light" open={false} />);
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="menu-tema"');
    expect(html).toContain('aria-label="Tema: Claro"');
    expect(html).toContain("/icons/tema.svg#sol");
    expect(html).not.toContain('role="menu"');
  });

  it("al tocar el botón se abre el menú con las 3 opciones", () => {
    const onToggle = vi.fn();
    const tree = ThemeMenuView({ ...menuProps, onToggle, theme: "light", open: false });
    findElement(tree, (props) => props["aria-haspopup"] === "menu")?.onClick?.();
    expect(onToggle).toHaveBeenCalled();
    expect(themeMenuReducer(false, { type: "toggle" })).toBe(true);

    const html = renderToStaticMarkup(<ThemeMenuView {...menuProps} theme="light" open />);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('role="menu"');
    expect(html.match(/role="menuitemradio"/g)).toHaveLength(3);
    for (const label of ["Claro", "Oscuro", "Sistema"]) expect(html).toContain(label);
    // La elegida va marcada y con tilde
    expect(html).toMatch(/aria-checked="true"[^>]*>.*Claro.*✓/);
  });

  it('al tocar "Oscuro" llama a setTheme("dark") y el menú se cierra', () => {
    const tree = ThemeMenuView({ ...menuProps, onSelect: setTheme, theme: "light", open: true });
    const dark = findElement(
      tree,
      (props) => props.role === "menuitemradio" && renderToStaticMarkup(<>{props.children}</>).includes("Oscuro"),
    );
    dark?.onClick?.();
    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(themeMenuReducer(true, { type: "select" })).toBe(false);
  });

  it("Escape, Tab y un clic afuera cierran el menú; otras teclas no", () => {
    expect(themeMenuReducer(true, { type: "key", key: "Escape" })).toBe(false);
    expect(themeMenuReducer(true, { type: "key", key: "Tab" })).toBe(false);
    expect(themeMenuReducer(true, { type: "close" })).toBe(false);
    expect(themeMenuReducer(true, { type: "key", key: "a" })).toBe(true);
  });

  it("las flechas recorren las opciones y vuelven al principio", () => {
    expect(nextMenuIndex(0, "ArrowDown", 3)).toBe(1);
    expect(nextMenuIndex(2, "ArrowDown", 3)).toBe(0);
    expect(nextMenuIndex(0, "ArrowUp", 3)).toBe(2);
    expect(nextMenuIndex(-1, "ArrowDown", 3)).toBe(0);
    expect(nextMenuIndex(1, "Home", 3)).toBe(0);
    expect(nextMenuIndex(1, "End", 3)).toBe(2);
    expect(nextMenuIndex(1, "Enter", 3)).toBeNull();
  });

  it("sin tema conocido muestra el ícono sistema y ninguna opción marcada", () => {
    expect(themeIcon(undefined)).toBe("sistema");
    expect(themeButtonLabel(undefined)).toBe("Tema");
    // En el servidor el componente todavía no está montado
    const html = renderToStaticMarkup(<ThemeToggle variant="menu" />);
    expect(html).toContain("/icons/tema.svg#sistema");
    expect(html).toContain('aria-label="Tema"');
  });
});

describe("selector de tema: variante group", () => {
  it("muestra los 3 botones con su nombre accesible", () => {
    const html = renderToStaticMarkup(<ThemeToggle variant="group" />);
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Tema"');
    expect(html.match(/role="radio"/g)).toHaveLength(3);
    for (const label of ["Tema claro", "Tema oscuro", "Tema del sistema"]) {
      expect(html).toContain(`aria-label="${label}"`);
    }
    // En el servidor no se marca ninguno
    expect(html).not.toContain('aria-checked="true"');
  });

  it("marca el tema elegido con el estilo activo", () => {
    const html = renderToStaticMarkup(<ThemeGroupView theme="dark" onSelect={() => {}} />);
    expect(html).toMatch(/aria-checked="true" aria-label="Tema oscuro"[^>]*bg-orange-soft text-petroleum-900/);
  });

  it('al tocar la luna llama a setTheme("dark")', () => {
    const tree = ThemeGroupView({ theme: "light", onSelect: setTheme });
    findElement(tree, (props) => props["aria-label"] === "Tema oscuro")?.onClick?.();
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
