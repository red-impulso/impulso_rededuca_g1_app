// Dibujo del selector de tema (sin estado ni hooks: se prueba con renderToStaticMarkup
// y recorriendo el árbol de React). Los íconos están en public/icons/tema.svg
// (símbolos "sol", "luna" y "sistema", con currentColor: toman el color del texto).
import type { KeyboardEvent, Ref } from "react";
import {
  THEME_ICONS_HREF,
  THEME_OPTIONS,
  themeButtonLabel,
  themeIcon,
} from "./theme-menu";
import type { ThemeChoice } from "./theme-menu";

function ThemeIcon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0">
      <use href={`${THEME_ICONS_HREF}#${name}`} />
    </svg>
  );
}

// ---- Variante "group": 3 botones (menú del celular) ----

type ThemeGroupViewProps = {
  // undefined mientras no se sabe el tema (en el servidor): no se marca ninguno
  theme: string | undefined;
  onSelect: (theme: ThemeChoice) => void;
};

export function ThemeGroupView({ theme, onSelect }: ThemeGroupViewProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="inline-flex shrink-0 gap-0.5 rounded-xl border border-header-line bg-white/60 p-0.5 dark:bg-white/10"
    >
      {THEME_OPTIONS.map((option) => {
        const checked = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.radioLabel}
            onClick={() => onSelect(option.value)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-[10px] outline-blue/40 focus-visible:outline-3 ${
              checked
                ? "bg-orange-soft text-petroleum-900"
                : "text-ink hover:bg-white/50 dark:hover:bg-white/10"
            }`}
          >
            <ThemeIcon name={option.icon} />
          </button>
        );
      })}
    </div>
  );
}

// ---- Variante "menu": un botón que abre un menú (escritorio y login) ----

type ThemeMenuViewProps = {
  theme: string | undefined;
  open: boolean;
  menuId: string;
  buttonRef?: Ref<HTMLButtonElement>;
  menuRef?: Ref<HTMLDivElement>;
  onToggle: () => void;
  onSelect: (theme: ThemeChoice) => void;
  onMenuKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function ThemeMenuView({
  theme,
  open,
  menuId,
  buttonRef,
  menuRef,
  onToggle,
  onSelect,
  onMenuKeyDown,
}: ThemeMenuViewProps) {
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={themeButtonLabel(theme)}
        onClick={onToggle}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-header-line bg-white/60 text-ink outline-blue/40 hover:bg-white/80 focus-visible:outline-3 dark:bg-white/10 dark:hover:bg-white/20"
      >
        <ThemeIcon name={themeIcon(theme)} />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Tema"
          onKeyDown={onMenuKeyDown}
          className="absolute top-full right-0 z-50 mt-2 w-[210px] rounded-2xl border border-line bg-surface p-2 text-ink shadow-lg"
        >
          <p aria-hidden="true" className="px-3 pt-1 pb-2 text-xs font-semibold tracking-wide text-muted uppercase">
            Tema
          </p>
          {THEME_OPTIONS.map((option) => {
            const checked = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={-1}
                onClick={() => onSelect(option.value)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-sm font-medium outline-blue/40 focus-visible:outline-3 ${
                  checked ? "bg-aqua-100 text-brand" : "text-ink hover:bg-page"
                }`}
              >
                <ThemeIcon name={option.icon} />
                {option.label}
                {checked && (
                  <span aria-hidden="true" className="ml-auto">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
