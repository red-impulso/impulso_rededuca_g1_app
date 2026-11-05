import { AnnouncementsScreen } from "@/features/announcements/announcements-screen";
import { SCREEN_TITLE } from "@/features/announcements/announcements-ui";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function AnnouncementsPage() {
    return (
        <>
            <h1 className="mb-6 text-2xl font-semibold text-ink">{SCREEN_TITLE}</h1>
            <AnnouncementsScreen />
        </>
    );
}
