import { Suspense } from "react";
import { SkeletonLines } from "@/components/ui/skeleton";
import { CoursesScreen } from "@/features/school/courses-screen";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

// Suspense: la pantalla lee los filtros de la URL (useSearchParams)
export default function CoursesPage() {
    return (
        <Suspense fallback={<SkeletonLines lines={6} />}>
            <CoursesScreen />
        </Suspense>
    );
}
