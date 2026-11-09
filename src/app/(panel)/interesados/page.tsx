import { LeadsScreen } from "@/features/leads/leads-screen";
import { SCREEN_SUBTITLE, SCREEN_TITLE } from "@/features/leads/leads-ui";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function LeadsPage() {
    return (
        <>
            <h1 className="text-2xl font-semibold text-ink">{SCREEN_TITLE}</h1>
            <p className="mb-6 text-sm text-muted">{SCREEN_SUBTITLE}</p>
            <LeadsScreen />
        </>
    );
}
