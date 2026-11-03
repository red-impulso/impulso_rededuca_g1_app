"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import type { StudentGrade } from "./types";

// Textos del diseño (M1-UX, sección 7)
export const SERVER_ERROR_MESSAGE = "Error del servidor. No pudimos recuperar las notas.";
export const OFFLINE_ERROR_MESSAGE = "Sin conexión. No pudimos recuperar las notas.";

type GradesResult =
    | { studentId: string; status: "ready"; grades: StudentGrade[] }
    | { studentId: string; status: "error"; message: string };

export type StudentGradesState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; grades: StudentGrade[] };

function describeError(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 0) return OFFLINE_ERROR_MESSAGE;
        // Rechazos de la API (por ejemplo, un hijo que no es de esta cuenta): su propio mensaje
        if (error.status >= 400 && error.status < 500 && error.message) return error.message;
    }
    return SERVER_ERROR_MESSAGE;
}

// Trae las notas de un hijo con GET /students/:studentId/grades
export function useStudentGrades(studentId: string) {
    const [result, setResult] = useState<GradesResult | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        apiFetch<StudentGrade[]>(`/students/${encodeURIComponent(studentId)}/grades`)
            .then((grades) => {
                if (!cancelled) setResult({ studentId, status: "ready", grades });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setResult({ studentId, status: "error", message: describeError(error) });
            });
        return () => {
            cancelled = true;
        };
    }, [studentId, attempt]);

    // Si lo guardado es de otro hijo, todavía está cargando
    const state: StudentGradesState =
        result && result.studentId === studentId ? result : { status: "loading" };

    const retry = useCallback(() => {
        setResult(null);
        setAttempt((value) => value + 1);
    }, []);

    return { state, retry };
}
