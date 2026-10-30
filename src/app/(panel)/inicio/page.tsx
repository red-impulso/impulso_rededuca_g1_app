"use client";

import Link from "next/link";
import { getNavItems } from "@/config/navigation";
import { useSession } from "@/features/session/use-session";
import { ROLE_LABELS } from "@/features/session/types";

export default function InicioPage() {
    const { profile, active } = useSession();

    // Accesos rápidos: los ítems del menú del rol, sin "Inicio"
    const shortcuts = getNavItems(active.role).filter((item) => item.href !== "/inicio");

    return (
        <>
            <h1 className="text-2xl font-semibold text-ink">Hola, {profile.fullName}</h1>
            <p className="mt-1 text-muted">
                {ROLE_LABELS[active.role]} · {active.institutionName}
            </p>

            <h2 className="mt-8 text-lg font-semibold text-ink">Accesos rápidos</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {shortcuts.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className="block rounded-xl border border-line bg-surface px-4 py-4 font-medium text-ink hover:border-brand"
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Estado: vacío (todavía no hay novedades reales) */}
            <div className="mt-8 rounded-xl border border-dashed border-line bg-surface px-4 py-8 text-center">
                <p className="font-medium text-ink">Todavía no hay novedades</p>
                <p className="mt-1 text-sm text-muted">
                    Cuando haya avisos o cambios, los vas a ver acá.
                </p>
            </div>
        </>
    );
}
