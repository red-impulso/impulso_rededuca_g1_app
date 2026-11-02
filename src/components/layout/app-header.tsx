"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
<<<<<<< Updated upstream
import { getNavItems } from "@/config/navigation";
import { useSession } from "@/features/session/use-session";
import { setActiveInstitutionId } from "@/lib/api";
=======
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getNavItemsForRole } from "@/config/navigation";
import { useSession } from "@/features/session/session";
import type { Role } from "@/features/session/session";
>>>>>>> Stashed changes
import { signOut } from "@/lib/supabase/sign-out";

export function AppHeader() {
const pathname = usePathname();
const router = useRouter();
<<<<<<< Updated upstream
const { profile, active } = useSession();
=======
const { setActive } = useSession();
>>>>>>> Stashed changes
const [open, setOpen] = useState(false);
const [confirmOpen, setConfirmOpen] = useState(false);
const [loggingOut, setLoggingOut] = useState(false);

  // Solo los ítems que puede ver el rol de la membresía activa
const items = getNavItems(active.role);

  // Cierra la sesión de Supabase y vuelve a /ingresar
async function handleLogout() {
    await signOut();
    setActiveInstitutionId(null);
    router.push("/ingresar");
}

  // Cierra la sesión de Supabase y vuelve a /ingresar
async function handleLogout() {
    setLoggingOut(true);
    try {
    await signOut();
    } catch {
      // Si falla el cierre remoto, igual limpiamos el estado local
    }
    setActive(null);
    router.push("/ingresar");
}

return (
    <header className="border-b border-line bg-surface">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
        <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand font-bold text-white"
            aria-hidden="true"
        >
            R
        </div>
        <div className="min-w-0 leading-tight">
            <p className="font-semibold text-ink">RedEduca</p>
            <p className="truncate text-xs text-muted">{active.institutionName}</p>
        </div>
        </div>

        {/* Menú en escritorio */}
        <nav aria-label="Principal" className="hidden lg:block">
        <ul className="flex items-center gap-1">
            {items.map((item) => {
            const isActive = pathname === item.href;
            return (
                <li key={item.href}>
                <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                        isActive ? "bg-brand text-white" : "text-ink hover:bg-page"
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
        <span className="hidden text-sm text-muted sm:inline">{profile.fullName}</span>
          {/* Botón del menú en celular */}
        <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink lg:hidden"
        >
            {open ? "Cerrar" : "Menú"}
        </button>
<<<<<<< Updated upstream
        <button
            type="button"
            onClick={handleLogout}
=======
          {/* Abre la confirmación antes de cerrar la sesión */}
        <button
            type="button"
            onClick={() => setConfirmOpen(true)}
>>>>>>> Stashed changes
            className="rounded-lg px-2 py-2 text-sm font-medium text-brand hover:underline"
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
            className="border-t border-line px-4 py-2 lg:hidden"
        >
        <ul className="flex flex-col">
            {items.map((item) => {
            const isActive = pathname === item.href;
            return (
                <li key={item.href}>
                <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-lg px-3 py-3 font-medium ${
                        isActive ? "bg-brand text-white" : "text-ink"
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