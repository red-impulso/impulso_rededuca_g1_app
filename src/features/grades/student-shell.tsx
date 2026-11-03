"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { studentTabs } from "@/config/student-tabs";
import { useSession } from "@/features/session/use-session";
import type { LinkedStudent } from "./types";
import { useLinkedStudents } from "./use-linked-students";

// "5.º B", o "5.º" si el curso no tiene división; vacío si no tiene curso
function courseText(course: LinkedStudent["course"]): string | null {
    if (!course) return null;
    return course.division ? `${course.year}.º ${course.division}` : `${course.year}.º`;
}

function StudentFrame({ children }: { children: ReactNode }) {
    const params = useParams<{ studentId: string }>();
    const pathname = usePathname();
    const { state, retry } = useLinkedStudents();
    const studentId = params.studentId;

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

    // Solo se muestran los hijos que Back asocia a esta cuenta
    const student = state.students.find((item) => item.id === studentId);
    if (!student) {
        return (
            <EmptyState
                title="No encontramos a este hijo"
                description="Vuelve a Mis hijos y elige uno de la lista."
                action={
                    <Link href="/hijos" className="font-semibold text-blue">
                        Ir a Mis hijos
                    </Link>
                }
            />
        );
    }

    const course = courseText(student.course);

    return (
        <div className="flex flex-col gap-4">
            <Link
                href="/hijos"
                className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-blue"
            >
                ← Mis hijos
            </Link>

            <h1 className="text-2xl font-semibold text-ink">
                {student.firstName} {student.lastName}
                {course && ` · ${course}`}
            </h1>

            {/* Pestañas de la ficha: cada módulo suma la suya en config/student-tabs.ts */}
            <nav aria-label="Secciones del hijo">
                <ul className="flex gap-4 border-b border-line">
                    {studentTabs.map((tab) => {
                        const href = `/hijos/${studentId}/${tab.segment}`;
                        const active = pathname === href;
                        return (
                            <li key={tab.segment}>
                                <Link
                                    href={href}
                                    aria-current={active ? "page" : undefined}
                                    className={`inline-flex min-h-11 items-center border-b-2 px-1 text-sm ${
                                        active
                                            ? "border-blue font-semibold text-ink"
                                            : "border-transparent text-muted hover:text-ink"
                                    }`}
                                >
                                    {tab.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {children}
        </div>
    );
}

// Marco de la ficha de un hijo: solo para tutores
export function StudentShell({ children }: { children: ReactNode }) {
    const { active } = useSession();

    if (active.role !== "guardian") {
        return (
            <EmptyState
                title="Esta pantalla es para tutores"
                description="Con tu perfil no tienes hijos asociados."
            />
        );
    }

    return <StudentFrame>{children}</StudentFrame>;
}
