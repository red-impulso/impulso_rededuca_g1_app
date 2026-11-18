"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getNavItems } from "@/config/navigation";
import { NotificationBell } from "@/features/notifications/notification-bell";
import { SchoolSelector } from "@/features/session/school-selector";
import { useSession } from "@/features/session/use-session";
import { setActiveInstitutionId } from "@/lib/api";
import { reloadToLogin, signOut } from "@/lib/supabase/sign-out";

// Ítem activo también en sus subpantallas (por ejemplo /alumnos/123)
function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const pathname = usePathname();
  const { profile, active } = useSession();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  // Al cambiar de pantalla (por la campanita, atrás, etc.) se cierra el menú del celular
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // Escape cierra el menú del celular
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Solo los ítems que puede ver el rol de la membresía activa
  const items = getNavItems(active.role);

  // Cierra la sesión de Supabase y vuelve al formulario de ingreso
  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    setActiveInstitutionId(null);
    // Recarga completa: borra cualquier estado que haya quedado en memoria
    // y muestra siempre el formulario de ingreso
    reloadToLogin();
  }

  return (
    // Header "medio": degradé de verde agua a durazno (en oscuro, petróleo), texto en tinta
    <header className="border-b border-header-line bg-linear-to-r from-header-from via-header-via via-60% to-header-to text-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark size={36} />
          <div className="min-w-0 leading-tight">
            <Wordmark tone="light" className="block" />
            <SchoolSelector />
          </div>
        </div>

        {/* Menú en escritorio */}
        <nav aria-label="Principal" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex flex-wrap items-center justify-center gap-1">
            {items.map((item) => {
              const isActive = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium outline-blue/40 focus-visible:outline-3 ${
                      isActive ? "bg-brand text-on-color" : "fx-nav-item text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Selector de tema en escritorio: botón que abre un menú.
              En celular va dentro del menú desplegable (3 botones). */}
          <div className="hidden lg:block">
            <ThemeToggle variant="menu" />
          </div>
          {/* Campanita: lleva a la bandeja y muestra las no leídas (diseño provisorio de UX) */}
          <NotificationBell />
          <span className="hidden max-w-40 truncate text-sm text-muted sm:inline">{profile.fullName}</span>
          {/* Botón del menú en celular */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="min-h-11 rounded-lg border border-header-line px-3 text-sm font-medium outline-blue/40 focus-visible:outline-3 lg:hidden text-ink hover:bg-white/50 dark:hover:bg-white/10"
          >
            {open ? "Cerrar" : "Menú"}
          </button>
          {/* Abre la confirmación antes de cerrar la sesión */}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="fx-lift-glow fx-glow-brand min-h-11 rounded-lg px-2 text-sm font-medium text-brand outline-blue/40 hover:underline focus-visible:outline-3"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Menú desplegable en celular */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Principal (celular)"
          className="border-t border-header-line px-4 py-2 lg:hidden"
        >
          {/* Tema: "Tema" a la izquierda y los 3 botones a la derecha */}
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="text-sm font-medium text-ink">Tema</span>
            <ThemeToggle variant="group" />
          </div>
          <ul className="flex flex-col">
            {items.map((item) => {
              const isActive = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-lg px-3 py-3 font-medium outline-blue/40 focus-visible:outline-3 ${
                      isActive ? "bg-brand text-on-color" : "fx-nav-item text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="¿Cerrar sesión?"
        description="Tendrás que ingresar de nuevo."
        confirmLabel="Cerrar sesión"
        destructive
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmOpen(false)}
      />
    </header>
  );
}
