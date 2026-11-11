"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { AssignTeacherDialog } from "./assign-teacher-dialog";
import { CourseFiltersBar } from "./course-filters-bar";
import { CourseFormDialog } from "./course-form-dialog";
import { CoursesList } from "./courses-list";
import {
    DEFAULT_COURSE_FILTERS,
    activeSchoolYear,
    canManageSchool,
    courseFiltersQuery,
    courseLabel,
    coursesSubtitle,
    filterCourses,
    hasCourseFilters,
    readCourseFilters,
    schoolYearsOf,
} from "./school-rules";
import {
    CLEAR_FILTERS_LABEL,
    COURSE_CREATED_TEXT,
    COURSE_DELETED_TEXT,
    COURSE_UPDATED_TEXT,
    COURSES_EMPTY_TEXT,
    COURSES_EMPTY_TITLE,
    COURSES_LOAD_ERROR_TEXT,
    COURSES_TITLE,
    CREATE_COURSE_LABEL,
    DELETE_COURSE_TEXT,
    DELETE_ERROR_TEXT,
    DELETE_LABEL,
    FORBIDDEN_TEXT,
    NEW_COURSE_LABEL,
    NO_RESULTS_TEXT,
    NO_RESULTS_TITLE,
    TEACHER_ASSIGNED_TEXT,
    deleteCourseTitle,
} from "./school-texts";
import type { Course, CourseFilters } from "./types";
import { errorInfo, useCourses, useDeleteCourse } from "./use-school-data";

const PRIMARY_BUTTON =
    "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-blue px-4 font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3";

function Header({ subtitle, onCreate }: { subtitle?: string; onCreate?: () => void }) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold text-ink">{COURSES_TITLE}</h1>
                {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
            </div>
            {onCreate && (
                <button type="button" onClick={onCreate} className={`${PRIMARY_BUTTON} hidden lg:inline-flex`}>
                    <span aria-hidden="true">+</span> {NEW_COURSE_LABEL}
                </button>
            )}
        </div>
    );
}

// Diálogos abiertos de la pantalla
type DialogState =
    | { type: "none" }
    | { type: "form"; course: Course | null }
    | { type: "assign"; course: Course }
    | { type: "delete"; course: Course };

function CoursesContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const courses = useCourses();
    const remove = useDeleteCourse();
    const [dialog, setDialog] = useState<DialogState>({ type: "none" });

    const filters = readCourseFilters(searchParams);
    const setFilters = useCallback(
        (next: CourseFilters) => router.replace(`${pathname}${courseFiltersQuery(next)}`, { scroll: false }),
        [router, pathname],
    );
    const close = () => setDialog({ type: "none" });

    if (courses.isPending) {
        return (
            <>
                <Header />
                <div className="rounded-2xl border border-line bg-surface p-4">
                    <SkeletonLines lines={6} />
                </div>
            </>
        );
    }

    if (courses.isError) {
        const info = errorInfo(courses.error, COURSES_LOAD_ERROR_TEXT);
        const message = info.message === COURSES_LOAD_ERROR_TEXT ? info.message : `${COURSES_LOAD_ERROR_TEXT} ${info.message}`;
        return (
            <>
                <Header />
                <ErrorState message={message} onRetry={() => void courses.refetch()} />
            </>
        );
    }

    const all = courses.data;
    const year = filters.schoolYear ?? activeSchoolYear(null, all);
    const subtitle = coursesSubtitle(all.filter((course) => course.schoolYear === year).length, year);
    const visible = filterCourses(all, filters);
    const openCreate = () => setDialog({ type: "form", course: null });

    let content: ReactNode;
    if (all.length === 0) {
        content = (
            <EmptyState
                title={COURSES_EMPTY_TITLE}
                description={COURSES_EMPTY_TEXT}
                action={
                    <button type="button" onClick={openCreate} className={PRIMARY_BUTTON}>
                        {CREATE_COURSE_LABEL}
                    </button>
                }
            />
        );
    } else if (visible.length === 0) {
        content = (
            <EmptyState
                title={NO_RESULTS_TITLE}
                description={NO_RESULTS_TEXT}
                action={
                    <button
                        type="button"
                        onClick={() => setFilters(DEFAULT_COURSE_FILTERS)}
                        className="h-11 rounded-[10px] border border-line bg-surface px-4 font-semibold text-ink outline-blue/40 focus-visible:outline-3"
                    >
                        {CLEAR_FILTERS_LABEL}
                    </button>
                }
            />
        );
    } else {
        content = (
            <CoursesList
                courses={visible}
                total={all.length}
                onEdit={(course) => setDialog({ type: "form", course })}
                onAssign={(course) => setDialog({ type: "assign", course })}
                onDelete={(course) => setDialog({ type: "delete", course })}
            />
        );
    }

    return (
        <>
            <Header subtitle={subtitle} onCreate={openCreate} />
            <div className="flex flex-col gap-4 pb-20 lg:pb-0">
                {all.length > 0 && (
                    <CourseFiltersBar
                        filters={filters}
                        years={schoolYearsOf(all)}
                        hasFilters={hasCourseFilters(filters)}
                        onChange={setFilters}
                        onClear={() => setFilters(DEFAULT_COURSE_FILTERS)}
                    />
                )}
                {content}
            </div>

            {/* "+ Nuevo curso" flotante en celular */}
            <button
                type="button"
                onClick={openCreate}
                className={`${PRIMARY_BUTTON} fixed right-4 bottom-4 z-20 shadow-lg lg:hidden`}
            >
                <span aria-hidden="true">+</span> {NEW_COURSE_LABEL}
            </button>

            <CourseFormDialog
                open={dialog.type === "form"}
                course={dialog.type === "form" ? dialog.course : null}
                courses={all}
                defaultSchoolYear={year}
                onOpenChange={(open) => !open && close()}
                onSaved={(_, created) => {
                    close();
                    showToast(created ? COURSE_CREATED_TEXT : COURSE_UPDATED_TEXT);
                }}
            />
            {dialog.type === "assign" && (
                <AssignTeacherDialog
                    open
                    courseId={dialog.course.id}
                    courseName={courseLabel(dialog.course)}
                    onOpenChange={(open) => !open && close()}
                    onAssigned={() => {
                        close();
                        showToast(TEACHER_ASSIGNED_TEXT);
                    }}
                />
            )}
            <ConfirmDialog
                open={dialog.type === "delete"}
                title={dialog.type === "delete" ? deleteCourseTitle(courseLabel(dialog.course)) : ""}
                description={DELETE_COURSE_TEXT}
                confirmLabel={DELETE_LABEL}
                destructive
                loading={remove.isPending}
                onConfirm={() => {
                    if (dialog.type !== "delete") return;
                    remove.mutate(dialog.course.id, {
                        onSuccess: () => {
                            close();
                            showToast(COURSE_DELETED_TEXT);
                        },
                        onError: (error) => {
                            close();
                            // 409: "No se puede eliminar el curso porque tiene alumnos asignados"
                            showToast(errorInfo(error, DELETE_ERROR_TEXT).message);
                        },
                    });
                }}
                onCancel={() => !remove.isPending && close()}
            />
        </>
    );
}

// Lista de cursos (SDD 4.2): administración y dirección
export function CoursesScreen() {
    const { active } = useSession();
    if (!canManageSchool(active.role)) {
        return (
            <>
                <Header />
                <EmptyState title={FORBIDDEN_TEXT} />
            </>
        );
    }
    return <CoursesContent />;
}
