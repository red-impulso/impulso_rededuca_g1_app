import { Suspense } from "react";
import { SkeletonLines } from "@/components/ui/skeleton";
import { AssignmentScreen } from "@/features/teachers/assignment-screen";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function AssignmentPage() {
    return (
        <Suspense fallback={<SkeletonLines lines={8} />}>
            <AssignmentScreen />
        </Suspense>
    );
}
