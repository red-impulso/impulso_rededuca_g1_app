import Link from "next/link";
import type { ReactNode } from "react";
import { RecordStatusBadge } from "./record-status-badge";
import { courseLabel, formatUpdatedAt, studentsText, teacherLabel, weeklyHoursLong } from "./school-rules";
import {
    BACK_TO_SUBJECTS_LABEL,
    CHANGE_TEACHER_LABEL,
    DEACTIVATE_LABEL,
    EDIT_SUBJECT_LABEL,
    EMPTY_VALUE,
    SUBJECT_DETAIL_LABELS,
    SUBJECT_DETAIL_TITLE,
} from "./school-texts";
import type { Subject } from "./types";

type SubjectDetailProps = {
    subject: Subject;
    onEdit: () => void;
    onChangeTeacher: () => void;
    onDeactivate: () => void;
};

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-1 border-t border-line px-4 py-3 first:border-t-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm font-semibold text-muted">{label}</dt>
            <dd className="min-w-0 text-sm break-words text-ink">{children}</dd>
        </div>
    );
}

// Detalle de materia (SDD 4.4)
export function SubjectDetail({ subject, onEdit, onChangeTeacher, onDeactivate }: SubjectDetailProps) {
    const buttonStyles =
        "inline-flex h-11 flex-1 items-center justify-center rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-50 sm:flex-none";
    const inactive = subject.status === "inactive";

    return (
        <div className="flex flex-col gap-4">
            <Link
                href="/materias"
                className="inline-flex min-h-11 items-center gap-1 self-start rounded-[10px] text-sm font-semibold text-blue outline-blue/40 hover:underline focus-visible:outline-3"
            >
                <span aria-hidden="true">←</span> {BACK_TO_SUBJECTS_LABEL}
            </Link>
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-ink">
                    {SUBJECT_DETAIL_TITLE} · {subject.name}
                </h1>
                <RecordStatusBadge status={subject.status} />
            </div>
            <dl className="rounded-2xl border border-line bg-surface">
                <Row label={SUBJECT_DETAIL_LABELS.description}>{subject.description ?? EMPTY_VALUE}</Row>
                <Row label={SUBJECT_DETAIL_LABELS.course}>
                    {subject.course ? (
                        <Link href={`/cursos/${subject.course.id}`} className="font-semibold text-blue hover:underline">
                            {courseLabel(subject.course)}
                        </Link>
                    ) : (
                        EMPTY_VALUE
                    )}
                </Row>
                <Row label={SUBJECT_DETAIL_LABELS.teacher}>{teacherLabel(subject.teacher)}</Row>
                <Row label={SUBJECT_DETAIL_LABELS.hours}>{weeklyHoursLong(subject.weeklyHours)}</Row>
                <Row label={SUBJECT_DETAIL_LABELS.students}>{studentsText(subject.studentsCount)}</Row>
                <Row label={SUBJECT_DETAIL_LABELS.updatedAt}>{formatUpdatedAt(subject.updatedAt)}</Row>
            </dl>
            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={onEdit} className={`${buttonStyles} bg-blue text-white hover:bg-blue/90`}>
                    {EDIT_SUBJECT_LABEL}
                </button>
                <button
                    type="button"
                    onClick={onChangeTeacher}
                    disabled={!subject.course}
                    className={`${buttonStyles} border border-line bg-surface text-ink hover:bg-page`}
                >
                    {CHANGE_TEACHER_LABEL}
                </button>
                <button
                    type="button"
                    onClick={onDeactivate}
                    disabled={inactive}
                    className={`${buttonStyles} border border-error bg-surface text-error hover:bg-error-bg`}
                >
                    {DEACTIVATE_LABEL}
                </button>
            </div>
        </div>
    );
}
