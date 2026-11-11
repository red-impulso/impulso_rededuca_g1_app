import { StudentProfileScreen } from "@/features/students/student-profile-screen";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function StudentProfilePage() {
    return <StudentProfileScreen />;
}
