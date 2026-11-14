import { DashboardScreen } from "@/features/dashboard/dashboard-screen";
import { SCREEN_TITLE } from "@/features/dashboard/dashboard-ui";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

// El subtítulo lo pone DashboardScreen: a docentes y tutores solo se les muestra el aviso
export default function DashboardPage() {
    return (
        <>
            <h1 className="text-2xl font-semibold text-ink">{SCREEN_TITLE}</h1>
            <DashboardScreen />
        </>
    );
}
