"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { canManageSchool, schoolYearsOf } from "../school/school-rules";
import { CLEAR_FILTERS_LABEL, FORBIDDEN_TEXT } from "../school/school-texts";
import { errorInfo, useCourses } from "../school/use-school-data";
import { StudentFiltersBar } from "./student-filters-bar";
import { StudentFormDialog } from "./student-form-dialog";
import { StudentsList } from "./students-list";
import { DEFAULT_STUDENT_FILTERS, hasStudentFilters, readStudentFilters, studentFiltersQuery, withFilter } from "./students-rules";
import {
    NEW_STUDENT_LABEL,
    STUDENT_CREATED_TEXT,
    STUDENT_UPDATED_TEXT,
    STUDENTS_EMPTY_TEXT,
    STUDENTS_EMPTY_TITLE,
    STUDENTS_LOAD_ERROR_TEXT,
    STUDENTS_NO_RESULTS_TEXT,
    STUDENTS_NO_RESULTS_TITLE,
    STUDENTS_OFFLINE_TEXT,
    STUDENTS_TITLE,
    studentsTotalText,
} from "./students-texts";
import type { StudentFilters, StudentProfile } from "./types";
import { useStudentProfile, useStudents } from "./use-students-data";

const PRIMARY_BUTTON =
    "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-blue px-4 font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3";

function Header({ subtitle, onCreate }: { subtitle?: string; onCreate?: () => void }) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold text-ink">{STUDENTS_TITLE}</h1>
                {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
            </div>
            {onCreate && (
                <button type="button" onClick={onCreate} className={`${PRIMARY_BUTTON} hidden lg:inline-flex`}>
                    <span aria-hidden="true">+</span> {NEW_STUDENT_LABEL}
                </button>
            )}
        </div>
    );
}

// La lista no trae todos los campos: para editar se pide la ficha
function EditStudentDialog({ studentId, onClose, onSaved }: { studentId: string; onClose: () => void; onSaved: () => void }) {
    const profile = useStudentProfile(studentId);
    if (profile.isPending || profile.isError) return null;
    return <StudentFormDialog open profile={profile.data as StudentProfile} onOpenChange={(open) => !open && onClose()} onSaved={onSaved} />;
}

function StudentsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const filters = readStudentFilters(searchParams);
    const students = useStudents(filters);
    const courses = useCourses();
    const [dialog, setDialog] = useState<{ type: "none" } | { type: "create" } | { type: "edit"; id: string }>({ type: "none" });
    const setFilters = useCallback(
        (next: StudentFilters) => router.replace(`${pathname}${studentFiltersQuery(next)}`, { scroll: false }),
        [router, pathname],
    );
    const close = () => setDialog({ type: "none" });
    const openCreate = () => setDialog({ type: "create" });
    const courseList = courses.data ?? [];
    const filtered = hasStudentFilters(filters);

    let content: ReactNode;
    if (students.isPending) {
        content = <div className="rounded-2xl border border-line bg-surface p-4"><SkeletonLines lines={8} /></div>;
    } else if (students.isError) {
        const info = errorInfo(students.error, STUDENTS_LOAD_ERROR_TEXT);
        content =
            info.kind === "offline" ? (
                <p role="alert" className="rounded-[10px] bg-warning-bg px-4 py-3 text-sm text-warning">{STUDENTS_OFFLINE_TEXT}</p>
            ) : (
                <ErrorState message={info.message === STUDENTS_LOAD_ERROR_TEXT ? info.message : `${STUDENTS_LOAD_ERROR_TEXT} ${info.message}`} onRetry={() => void students.refetch()} />
            );
    } else if (students.data.total === 0 && !filtered) {
        content = (
            <EmptyState title={STUDENTS_EMPTY_TITLE} description={STUDENTS_EMPTY_TEXT} action={<button type="button" onClick={openCreate} className={PRIMARY_BUTTON}>{NEW_STUDENT_LABEL}</button>} />
        );
    } else if (students.data.data.length === 0) {
        content = (
            <EmptyState
                title={STUDENTS_NO_RESULTS_TITLE}
                description={STUDENTS_NO_RESULTS_TEXT}
                action={
                    <div className="flex flex-wrap justify-center gap-2">
                        <button type="button" onClick={() => setFilters(DEFAULT_STUDENT_FILTERS)} className="h-11 rounded-[10px] border border-line bg-surface px-4 font-semibold text-ink outline-blue/40 focus-visible:outline-3">{CLEAR_FILTERS_LABEL}</button>
                        <button type="button" onClick={openCreate} className={PRIMARY_BUTTON}>{NEW_STUDENT_LABEL}</button>
                    </div>
                }
            />
        );
    } else {
        content = (
            <StudentsList
                students={students.data.data}
                page={students.data.page}
                limit={students.data.limit}
                total={students.data.total}
                onEdit={(student) => setDialog({ type: "edit", id: student.id })}
                onPage={(page) => setFilters(withFilter(filters, { page }))}
            />
        );
    }

    return (
        <>
            <Header subtitle={students.data ? studentsTotalText(students.data.total) : undefined} onCreate={openCreate} />
            <div className="flex flex-col gap-4 pb-20 lg:pb-0">
                <StudentFiltersBar filters={filters} courses={courseList} years={schoolYearsOf(courseList)} hasFilters={filtered} onChange={setFilters} onClear={() => setFilters(DEFAULT_STUDENT_FILTERS)} />
                {content}
            </div>
            <button type="button" onClick={openCreate} className={`${PRIMARY_BUTTON} fixed right-4 bottom-4 z-20 shadow-lg lg:hidden`}>
                <span aria-hidden="true">+</span> {NEW_STUDENT_LABEL}
            </button>
            <StudentFormDialog
                open={dialog.type === "create"}
                profile={null}
                defaultCourseId={filters.courseId ?? ""}
                onOpenChange={(open) => !open && close()}
                onSaved={() => {
                    close();
                    showToast(STUDENT_CREATED_TEXT);
                }}
            />
            {dialog.type === "edit" && (
                <EditStudentDialog
                    studentId={dialog.id}
                    onClose={close}
                    onSaved={() => {
                        close();
                        showToast(STUDENT_UPDATED_TEXT);
                    }}
                />
            )}
        </>
    );
}

// Lista de alumnos (SDD 5.1): administración y dirección, igual que Back
export function StudentsScreen() {
    const { active } = useSession();
    if (!canManageSchool(active.role)) {
        return (
            <>
                <Header />
                <EmptyState title={FORBIDDEN_TEXT} />
            </>
        );
    }
    return <StudentsContent />;
}
