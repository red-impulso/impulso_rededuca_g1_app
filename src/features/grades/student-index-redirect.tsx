"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// /hijos/[studentId] sin pestaña: manda a la primera (Notas) para no caer en 404.
// El id se lee en el cliente (useParams), como en el resto de la ficha.
export function StudentIndexRedirect() {
    const { studentId } = useParams<{ studentId: string }>();
    const router = useRouter();

    useEffect(() => {
        if (studentId) router.replace(`/hijos/${studentId}/notas`);
    }, [router, studentId]);

    return null;
}
