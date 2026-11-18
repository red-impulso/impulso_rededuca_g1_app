"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Tema claro, oscuro o el del sistema (la primera vez, el del sistema).
// next-themes guarda la elección en este navegador y pone la clase "dark" en <html>
// antes de que se vea la página, así no hay un "flash" blanco al cargar.
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
