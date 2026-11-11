import { Suspense } from "react";
import { SkeletonLines } from "@/components/ui/skeleton";
import { UsersScreen } from "@/features/users/users-screen";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function UsersPage() {
    return (
        <Suspense fallback={<SkeletonLines lines={8} />}>
            <UsersScreen />
        </Suspense>
    );
}
