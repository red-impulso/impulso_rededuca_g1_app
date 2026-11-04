"use client";

import { useParams } from "next/navigation";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { StudentAttendanceView } from "./student-attendance-view";
import { useStudentAttendance } from "./use-student-attendance";

// Pantalla de asistencia de un hijo: pide los datos y elige qué mostrar
export function StudentAttendanceScreen() {
    const params = useParams<{ studentId: string }>();
    const { state, retry } = useStudentAttendance(params.studentId);

    if (state.status === "loading") {
        return (
            <div className="rounded-2xl border border-line bg-surface p-4">
                <SkeletonLines lines={4} />
                <p className="mt-3 text-xs font-semibold text-muted">Cargando asistencia…</p>
            </div>
        );
    }

    if (state.status === "error") {
        return <ErrorState message={state.message} onRetry={retry} />;
    }

    return <StudentAttendanceView records={state.data.records} summary={state.data.summary} />;
}
