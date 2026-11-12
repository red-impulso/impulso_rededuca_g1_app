import { StudentIndexRedirect } from "@/features/grades/student-index-redirect";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function StudentIndexPage() {
    return <StudentIndexRedirect />;
}
