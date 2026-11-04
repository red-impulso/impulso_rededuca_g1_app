"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { describeLoadError } from "./student-attendance";
import type { StudentAttendanceResponse } from "./student-attendance";

type AttendanceResult =
    | { studentId: string; status: "ready"; data: StudentAttendanceResponse }
    | { studentId: string; status: "error"; message: string };

export type StudentAttendanceState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; data: StudentAttendanceResponse };

// Trae la asistencia de un hijo con GET /students/:studentId/attendance
export function useStudentAttendance(studentId: string) {
    const [result, setResult] = useState<AttendanceResult | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        apiFetch<StudentAttendanceResponse>(`/students/${encodeURIComponent(studentId)}/attendance`)
            .then((data) => {
                if (!cancelled) setResult({ studentId, status: "ready", data });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                const status = error instanceof ApiError ? error.status : null;
                const message = error instanceof Error ? error.message : "";
                setResult({ studentId, status: "error", message: describeLoadError(status, message) });
            });
        return () => {
            cancelled = true;
        };
    }, [studentId, attempt]);

    // Si lo guardado es de otro hijo, todavía está cargando
    const state: StudentAttendanceState =
        result && result.studentId === studentId ? result : { status: "loading" };

    const retry = useCallback(() => {
        setResult(null);
        setAttempt((value) => value + 1);
    }, []);

    return { state, retry };
}
