import { redirect } from "next/navigation";

<<<<<<< Updated upstream
// La raíz lleva al inicio del panel
export default function RootPage() {
    redirect("/inicio");
}
=======
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { SkeletonLines } from "@/components/ui/skeleton";
import { ROLE_LABELS, useSession } from "@/features/session/session";

export default function HomePage() {
  const router = useRouter();
  const { profile, active, ready } = useSession();

  // Sin perfil elegido, vuelve a la pantalla de ingreso
  useEffect(() => {
    if (ready && !active) {
      router.replace("/ingresar");
    }
  }, [ready, active, router]);

  // Estado: cargando
  if (!ready || !active) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <SkeletonLines lines={4} />
      </main>
    );
  }

  return (
    <>
      <AppHeader
        role={active.role}
        userName={profile.fullName}
        institutionName={active.institutionName}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <HomeDashboard
          userName={profile.fullName}
          context={`${ROLE_LABELS[active.role]} · ${active.institutionName}`}
        />
      </main>
    </>
  );
}
>>>>>>> Stashed changes
