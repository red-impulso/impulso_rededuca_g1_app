"use client";

import { HomeDashboard } from "@/components/home/home-dashboard";
import { useSession } from "@/features/session/use-session";
import { ROLE_LABELS } from "@/features/session/types";
import { getNavItems } from "@/config/navigation";

// Pantalla de Inicio: lee la sesión y muestra el dashboard
export function HomeScreen() {
  const { profile, active } = useSession();
  // Accesos rápidos: los ítems del menú de este rol (sin Inicio)
  const quickLinks = getNavItems(active.role)
    .filter((item) => item.href !== "/inicio")
    .map((item) => ({ label: item.label, href: item.href }));

  return (
    <HomeDashboard
      userName={profile.fullName}
      context={`${ROLE_LABELS[active.role]} · ${active.institutionName}`}
      quickLinks={quickLinks}
    />
  );
}