"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useSession } from "@/features/session/use-session";
import type { LinkedStudent } from "./types";
import { useLinkedStudents } from "./use-linked-students";

// "5.º B", o "5.º" si el curso no tiene división; vacío si no tiene curso
function courseText(course: LinkedStudent["course"]): string {
    if (!course) return "Sin curso asignado";
    return course.division ? `${course.year}.º ${course.division}` : `${course.year}.º`;
}

function ChildrenList() {
    const { state, retry } = useLinkedStudents();

    if (state.status === "loading") {
        return (
            <div className="rounded-2xl border border-line bg-surface p-4">
                <SkeletonLines lines={3} />
                <p className="mt-3 text-xs font-semibold text-muted">Cargando…</p>
            </div>
        );
    }

    if (state.status === "error") {
        return <ErrorState message={state.message} onRetry={retry} />;
    }

    if (state.students.length === 0) {
        return (
            <EmptyState
                title="Aún no tienes hijos asociados"
                description="Pide a la institución que vincule tu cuenta."
            />
        );
    }

    return (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.students.map((student) => (
                <li key={student.id}>
                    <Link
                        href={`/hijos/${student.id}/notas`}
                        className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface p-4 outline-blue/40 hover:border-blue focus-visible:outline-3"
                    >
                        {/* Avatar con la inicial (decorativo: el nombre está al lado) */}
                        <span
                            aria-hidden="true"
                            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-white"
                        >
                            {student.firstName.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-semibold text-ink">
                                {student.firstName} {student.lastName}
                            </span>
                            <span className="block text-sm text-muted">
                                {courseText(student.course)}
                            </span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

// Solo el tutor tiene hijos: Back responde /me/students únicamente a ese rol
export function ChildrenScreen() {
    const { active } = useSession();

    if (active.role !== "guardian") {
        return (
            <EmptyState
                title="Esta pantalla es para tutores"
                description="Con tu perfil no tienes hijos asociados."
            />
        );
    }

    return <ChildrenList />;
}
