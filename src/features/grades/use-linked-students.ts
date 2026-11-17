"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/session/use-session";
import { apiFetch } from "@/lib/api";
import type { LinkedStudent } from "./types";

type LinkedStudentsState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; students: LinkedStudent[] };

// Resultado del pedido (key = de qué membresía e intento es)
type LinkedStudentsResult =
    | { key: string; status: "error"; message: string }
    | { key: string; status: "ready"; students: LinkedStudent[] };

// Trae los hijos del tutor con GET /me/students (solo responde al rol guardian).
// La clave lleva la membresía activa: al cambiar de escuela no se ven los hijos de la anterior.
export function useLinkedStudents() {
    const { active } = useSession();
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<LinkedStudentsResult | null>(null);
    const key = `${active.id}:${attempt}`;

    useEffect(() => {
        let cancelled = false;
        apiFetch<LinkedStudent[]>("/me/students")
            .then((students) => {
                if (!cancelled) setResult({ key, status: "ready", students: Array.isArray(students) ? students : [] });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setResult({
                    key,
                    status: "error",
                    message: error instanceof Error ? error.message : "No pudimos cargar tus hijos.",
                });
            });
        return () => {
            cancelled = true;
        };
    }, [key]);

    let state: LinkedStudentsState;
    if (result?.key !== key) {
        state = { status: "loading" };
    } else if (result.status === "ready") {
        state = { status: "ready", students: result.students };
    } else {
        state = { status: "error", message: result.message };
    }

    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    return { state, retry };
}
