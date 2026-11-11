import { Suspense } from "react";
import { SkeletonLines } from "@/components/ui/skeleton";
import { TeachersScreen } from "@/features/teachers/teachers-screen";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function TeachersPage() {
    return (
        <Suspense fallback={<SkeletonLines lines={8} />}>
            <TeachersScreen />
        </Suspense>
    );
}
