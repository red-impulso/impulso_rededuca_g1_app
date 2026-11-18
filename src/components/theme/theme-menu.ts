// Reglas puras del selector de tema (sin React, con tests).

export type ThemeChoice = "light" | "dark" | "system";

// Opciones en orden: texto del menú, nombre accesible del grupo y símbolo de /icons/tema.svg
export const THEME_OPTIONS: {
  value: ThemeChoice;
  label: string;
  radioLabel: string;
  icon: string;
}[] = [
  { value: "light", label: "Claro", radioLabel: "Tema claro", icon: "sol" },
  { value: "dark", label: "Oscuro", radioLabel: "Tema oscuro", icon: "luna" },
  { value: "system", label: "Sistema", radioLabel: "Tema del sistema", icon: "sistema" },
];

export const THEME_ICONS_HREF = "/icons/tema.svg";

function findOption(theme: string | undefined) {
  return THEME_OPTIONS.find((option) => option.value === theme);
}

// Ícono del botón: el de la opción elegida. Sin tema conocido (en el servidor), "sistema".
export function themeIcon(theme: string | undefined): string {
  return findOption(theme)?.icon ?? "sistema";
}

// Nombre accesible del botón: "Tema: Claro". Sin tema conocido, solo "Tema".
export function themeButtonLabel(theme: string | undefined): string {
  const option = findOption(theme);
  return option ? `Tema: ${option.label}` : "Tema";
}

// Abrir y cerrar el menú desplegable
export type ThemeMenuAction =
  | { type: "toggle" }
  | { type: "select" }
  | { type: "close" }
  | { type: "key"; key: string };

export function themeMenuReducer(open: boolean, action: ThemeMenuAction): boolean {
  switch (action.type) {
    case "toggle":
      return !open;
    case "select":
    case "close":
      return false;
    case "key":
      // Escape cierra; Tab también (el foco sale del menú)
      return action.key === "Escape" || action.key === "Tab" ? false : open;
  }
}

// Flechas, Inicio y Fin: a qué opción pasa el foco (vuelve al principio al llegar al final).
// null si la tecla no mueve el foco.
export function nextMenuIndex(current: number, key: string, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case "ArrowDown":
      return current < 0 ? 0 : (current + 1) % count;
    case "ArrowUp":
      return current < 0 ? count - 1 : (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
