"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItemsForRole } from "@/config/navigation";
import type { Role } from "@/features/session/session";

type AppHeaderProps = {
    role: Role;
    userName: string;
    institutionName: string;
};

export function AppHeader({ role, userName, institutionName }: AppHeaderProps) {
const pathname = usePathname();
const [open, setOpen] = useState(false);

  // Solo los ítems que puede ver el rol del perfil elegido
const items = getNavItemsForRole(role);

return (
    <header className="border-b border-line bg-surface">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
        <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand font-bold text-white"
            aria-hidden="true"
        >
            R
        </div>
        <div className="leading-tight">
            <p className="font-semibold text-ink">RedEduca</p>
            <p className="text-xs text-muted">{institutionName}</p>
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
                    isActive
                        ? "bg-brand text-white"
                        : "text-ink hover:bg-page"
                    }`}
                >
                    {item.label}
                </Link>
                </li>
            );
            })}
        </ul>
        </nav>

        <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted sm:inline">{userName}</span>
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
    </header>
);
}