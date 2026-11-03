import { StudentGradesScreen } from "@/features/grades/student-grades-screen";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function StudentGradesPage() {
    return <StudentGradesScreen />;
}
