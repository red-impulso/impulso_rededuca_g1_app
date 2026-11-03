"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { StudentGradesView } from "./student-grades-view";
import { groupGradesBySubject, summarizeStudent } from "./student-grades";
import type { StudentGrade } from "./types";
import { useStudentGrades } from "./use-student-grades";

const NO_GRADES: StudentGrade[] = [];

// Pantalla de notas de un hijo: pide los datos y elige qué mostrar
export function StudentGradesScreen() {
    const params = useParams<{ studentId: string }>();
    const { state, retry } = useStudentGrades(params.studentId);

    const grades = state.status === "ready" ? state.grades : NO_GRADES;
    const subjects = useMemo(() => groupGradesBySubject(grades), [grades]);
    const summary = useMemo(() => summarizeStudent(subjects), [subjects]);

    if (state.status === "loading") {
        return (
            <div className="rounded-2xl border border-line bg-surface p-4">
                <SkeletonLines lines={4} />
                <p className="mt-3 text-xs font-semibold text-muted">Cargando notas…</p>
            </div>
        );
    }

    if (state.status === "error") {
        return <ErrorState message={state.message} onRetry={retry} />;
    }

    if (subjects.length === 0) {
        return (
            <EmptyState
                title="Todavía no hay notas cargadas"
                description="Cuando los docentes carguen notas, las vas a ver acá."
            />
        );
    }

    return <StudentGradesView subjects={subjects} summary={summary} />;
}
