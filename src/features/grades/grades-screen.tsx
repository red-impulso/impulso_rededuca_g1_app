"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { useSession } from "@/features/session/use-session";
import { GradesSheet } from "./grades-sheet";

// Solo el docente carga notas: Back responde las materias (/me/subjects) únicamente a ese rol
export function GradesScreen() {
    const { active } = useSession();

    if (active.role !== "teacher") {
        return (
            <EmptyState
                title="Esta pantalla es para docentes"
                description="Con tu perfil no puedes cargar notas desde acá."
            />
        );
    }

    return <GradesSheet />;
}
