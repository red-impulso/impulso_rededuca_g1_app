import Link from "next/link";
import type { ReactNode } from "react";
import { RecordStatusBadge } from "./record-status-badge";
import { courseLabel, namesText, shiftLabel, studentsPreviewText, uniqueTeachers } from "./school-rules";
import {
    ASSIGN_TEACHER_LABEL,
    BACK_TO_COURSES_LABEL,
    COURSE_DETAIL_LABELS,
    COURSE_DETAIL_TITLE,
    EDIT_COURSE_LABEL,
    EMPTY_VALUE,
    LOADING_TEXT,
    RETRY_LABEL,
    SECTION_ERROR_TEXT,
    SEE_STUDENTS_LABEL,
} from "./school-texts";
import type { Course, CourseAssignment, StudentsPreview } from "./types";

// Estado de cada dato que se pide aparte
export type SectionState<T> = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

type CourseDetailProps = {
    course: Course;
    assignments: SectionState<CourseAssignment[]>;
    students: SectionState<StudentsPreview>;
    onRetryAssignments: () => void;
    onRetryStudents: () => void;
    onEdit: () => void;
    onAssign: () => void;
};

function SectionValue<T>({ state, render, onRetry }: { state: SectionState<T>; render: (data: T) => string; onRetry: () => void }) {
    if (state.status === "loading") return <span className="text-muted">{LOADING_TEXT}</span>;
    if (state.status === "error") {
        return (
            <span className="flex flex-wrap items-center gap-2">
                <span role="alert" className="text-error">{state.message || SECTION_ERROR_TEXT}</span>
                <button
                    type="button"
                    onClick={onRetry}
                    className="min-h-11 rounded-[10px] px-2 font-semibold text-blue outline-blue/40 hover:underline focus-visible:outline-3"
                >
                    {RETRY_LABEL}
                </button>
            </span>
        );
    }
    return <>{render(state.data)}</>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-1 border-t border-line px-4 py-3 first:border-t-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm font-semibold text-muted">{label}</dt>
            <dd className="min-w-0 text-sm break-words text-ink">{children}</dd>
        </div>
    );
}

// Detalle de curso (SDD 4.3): filas etiqueta/valor + acciones
export function CourseDetail({ course, assignments, students, onRetryAssignments, onRetryStudents, onEdit, onAssign }: CourseDetailProps) {
    const label = courseLabel(course);
    const buttonStyles =
        "inline-flex h-11 flex-1 items-center justify-center rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 sm:flex-none";

    return (
        <div className="flex flex-col gap-4">
            <Link
                href="/cursos"
                className="inline-flex min-h-11 items-center gap-1 self-start rounded-[10px] text-sm font-semibold text-blue outline-blue/40 hover:underline focus-visible:outline-3"
            >
                <span aria-hidden="true">←</span> {BACK_TO_COURSES_LABEL}
            </Link>

            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-ink">
                    {COURSE_DETAIL_TITLE} · {label}
                </h1>
                <RecordStatusBadge status={course.status} />
            </div>

            <dl className="rounded-2xl border border-line bg-surface">
                <Row label={COURSE_DETAIL_LABELS.division}>{course.division ?? EMPTY_VALUE}</Row>
                <Row label={COURSE_DETAIL_LABELS.shift}>{shiftLabel(course.shift)}</Row>
                <Row label={COURSE_DETAIL_LABELS.classroom}>{course.classroom ?? EMPTY_VALUE}</Row>
                <Row label={COURSE_DETAIL_LABELS.teachers}>
                    <SectionValue
                        state={assignments}
                        onRetry={onRetryAssignments}
                        render={(data) => namesText(uniqueTeachers(data).map((teacher) => teacher.fullName ?? EMPTY_VALUE))}
                    />
                </Row>
                <Row label={COURSE_DETAIL_LABELS.subjects}>
                    <SectionValue state={assignments} onRetry={onRetryAssignments} render={(data) => namesText(data.map((subject) => subject.name))} />
                </Row>
                <Row label={COURSE_DETAIL_LABELS.students}>
                    <SectionValue state={students} onRetry={onRetryStudents} render={studentsPreviewText} />
                </Row>
            </dl>

            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={onEdit} className={`${buttonStyles} bg-blue text-white hover:bg-blue/90`}>
                    {EDIT_COURSE_LABEL}
                </button>
                <button type="button" onClick={onAssign} className={`${buttonStyles} border border-line bg-surface text-ink hover:bg-page`}>
                    {ASSIGN_TEACHER_LABEL}
                </button>
                <Link
                    href={`/alumnos?curso=${course.id}`}
                    className={`${buttonStyles} border border-line bg-surface text-ink hover:bg-page`}
                >
                    {SEE_STUDENTS_LABEL}
                </Link>
            </div>
        </div>
    );
}
