"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getNavItemsForRole } from "@/config/navigation";
import { ROLE_LABELS, useSession } from "@/features/session/session";
import { signOut } from "@/lib/supabase/sign-out";

export default function HomePage() {
  const router = useRouter();
  const { profile, active, ready, setActive } = useSession();

  // Sin perfil elegido, vuelve a la pantalla de ingreso
  useEffect(() => {
    if (ready && !active) {
      router.replace("/ingresar");
    }
  }, [ready, active, router]);

  // Estado: cargando
  if (!ready || !active) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <p role="status" className="text-muted">
          Cargando...
        </p>
      </main>
    );
  }

  // Accesos rápidos: los ítems del menú del rol, sin "Inicio"
  const shortcuts = getNavItemsForRole(active.role).filter(
    (item) => item.href !== "/",
  );

  // Cierra la sesión de Supabase, borra el perfil activo y vuelve a /ingresar
  async function handleLogout() {
    await signOut();
    setActive(null);
    router.push("/ingresar");
  }

  return (
    <>
      <AppHeader
        role={active.role}
        userName={profile.fullName}
        institutionName={active.institutionName}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold text-ink">
          Hola, {profile.fullName}
        </h1>
        <p className="mt-1 text-muted">
          Estás ingresando como {ROLE_LABELS[active.role]} en{" "}
          {active.institutionName}.
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

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 text-sm font-medium text-brand hover:underline"
        >
          ‹ Salir
        </button>
      </main>
    </>
  );
}