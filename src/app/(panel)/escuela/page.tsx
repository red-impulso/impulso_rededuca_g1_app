import { SchoolScreen } from "@/features/school/school-screen";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function SchoolPage() {
    return <SchoolScreen />;
}
