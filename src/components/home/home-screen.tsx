"use client";

import { HomeDashboard } from "@/components/home/home-dashboard";
import { useSession } from "@/features/session/use-session";
import { ROLE_LABELS } from "@/features/session/types";

// Pantalla de Inicio: lee la sesión y muestra el dashboard
export function HomeScreen() {
  const { profile, active } = useSession();

  return (
    <HomeDashboard
      userName={profile.fullName}
      context={`${ROLE_LABELS[active.role]} · ${active.institutionName}`}
    />
  );
}