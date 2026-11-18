"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";
import { useTheme } from "next-themes";
import { nextMenuIndex, themeMenuReducer } from "./theme-menu";
import type { ThemeChoice, ThemeMenuAction } from "./theme-menu";
import { ThemeGroupView, ThemeMenuView } from "./theme-toggle-view";

// No hay nada que escuchar: solo interesa saber si ya se está en el navegador
function subscribeToNothing() {
  return () => {};
}

// Tema elegido y cómo cambiarlo. En el servidor el tema no se conoce: hasta estar
// montado se devuelve undefined (ninguna opción marcada, ícono "sistema").
// useSyncExternalStore da false en el servidor y true en el navegador, sin setState en un efecto.
function useThemeChoice() {
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  return { theme: mounted ? theme : undefined, setTheme };
}

type ThemeToggleProps = {
  // "menu": un botón que abre un menú (escritorio y login).
  // "group": 3 botones a la vista (dentro del menú del celular).
  variant: "menu" | "group";
};

// Selector de tema: claro, oscuro o el del sistema
export function ThemeToggle({ variant }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeChoice();
  if (variant === "group") return <ThemeGroupView theme={theme} onSelect={setTheme} />;
  return <ThemeMenu theme={theme} onSelect={setTheme} />;
}

// Menú desplegable: se cierra al elegir, con Escape o Tab y con un clic afuera.
// Al cerrarse con Escape o al elegir, el foco vuelve al botón (con un clic afuera,
// el foco queda donde la persona hizo clic). Flechas, Inicio y Fin recorren las opciones.
function ThemeMenu({
  theme,
  onSelect,
}: {
  theme: string | undefined;
  onSelect: (theme: ThemeChoice) => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function dispatch(action: ThemeMenuAction, returnFocus = false) {
    setOpen((current) => themeMenuReducer(current, action));
    if (returnFocus) buttonRef.current?.focus();
  }

  function menuItems() {
    return Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [],
    );
  }

  useEffect(() => {
    if (!open) return;

    // Al abrir, el foco va a la opción elegida (o a la primera)
    const items = menuItems();
    (items.find((item) => item.getAttribute("aria-checked") === "true") ?? items[0])?.focus();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Tab") {
      dispatch({ type: "key", key: "Tab" });
      return;
    }
    const items = menuItems();
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = nextMenuIndex(current, event.key, items.length);
    if (next === null) return;
    event.preventDefault();
    items[next]?.focus();
  }

  return (
    <ThemeMenuView
      theme={theme}
      open={open}
      menuId={menuId}
      buttonRef={buttonRef}
      menuRef={menuRef}
      onToggle={() => dispatch({ type: "toggle" })}
      onSelect={(value) => {
        onSelect(value);
        dispatch({ type: "select" }, true);
      }}
      onMenuKeyDown={handleMenuKeyDown}
    />
  );
}
