"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CONTROL_STYLES, LABEL_STYLES } from "@/components/ui/form-fields";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { canManageSchool, courseLabel } from "../school/school-rules";
import { EMPTY_VALUE, FORBIDDEN_TEXT, SHIFT_LABELS } from "../school/school-texts";
import { errorInfo, useCourses } from "../school/use-school-data";
import { CandidatePanel } from "./candidate-panel";
import { applyChanges, assignmentSummary, changedCount, pendingHoursFor } from "./teachers-rules";
import type { PendingChanges } from "./teachers-rules";
import {
    ASSIGN_TEACHER_LABEL,
    ASSIGNMENT_COLUMNS,
    ASSIGNMENT_SELECTORS,
    ASSIGNMENT_SUMMARY,
    ASSIGNMENT_TITLE,
    ASSIGNMENTS_ERROR_TEXT,
    ASSIGNMENTS_SAVED_TEXT,
    BACK_TO_TEACHERS_LABEL,
    CHANGE_TEACHER_LABEL,
    CHOOSE_COURSE_TEXT,
    CONFIGURE_PLAN_LABEL,
    DISCARD_LABEL,
    NO_COURSE_SUBJECTS_TEXT,
    REMOVE_TEACHER_LABEL,
    RETRY_LABEL,
    ROW_STATUS,
    SAVE_ASSIGNMENTS_LABEL,
    TEACHERS_ERROR_TEXT,
    pendingChangesText,
    removeTeacherTitle,
} from "./teachers-texts";
import type { AssignmentRow } from "./types";
import { useCourseAssignmentRows, useSaveAssignments } from "./use-teachers-data";

const BUTTON = "inline-flex h-11 items-center justify-center rounded-[10px] px-4 text-sm font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60";
const PRIMARY = `${BUTTON} bg-blue text-white hover:bg-blue/90`;
const SECONDARY = `${BUTTON} border border-line bg-surface text-ink hover:bg-page`;
const LINK = "inline-flex min-h-11 items-center rounded-[10px] px-3 text-sm font-semibold text-blue outline-blue/40 hover:bg-page focus-visible:outline-3";

type Row = AssignmentRow & { changed: boolean };

function RowStatus({ row }: { row: Row }) {
    if (row.changed) return <span className="text-sm font-semibold text-warning">● {ROW_STATUS.changed}</span>;
    return row.teacher ? <span className="text-sm font-semibold text-success">✓ {ROW_STATUS.assigned}</span> : <span className="text-sm font-semibold text-error">! {ROW_STATUS.unassigned}</span>;
}

function RowActions({ row, onAssign, onRemove }: { row: Row; onAssign: () => void; onRemove: () => void }) {
    return (
        <div className="flex flex-wrap justify-end">
            <button type="button" onClick={onAssign} className={LINK}>{row.teacher ? CHANGE_TEACHER_LABEL : ASSIGN_TEACHER_LABEL}</button>
            {row.teacher && <button type="button" onClick={onRemove} className={`${LINK} text-error`}>Quitar</button>}
        </div>
    );
}

function CourseAssignments({ courseId, courseName, preselected }: { courseId: string; courseName: string; preselected: string | null }) {
    const { showToast } = useToast();
    const rowsQuery = useCourseAssignmentRows(courseId);
    const save = useSaveAssignments(courseId);
    const [changes, setChanges] = useState<PendingChanges>({});
    const [picking, setPicking] = useState<string | null>(preselected);
    const [removing, setRemoving] = useState<Row | null>(null);

    if (rowsQuery.isPending) return <SkeletonLines lines={6} />;
    if (rowsQuery.isError) return <ErrorState message={errorInfo(rowsQuery.error, TEACHERS_ERROR_TEXT).message} onRetry={() => void rowsQuery.refetch()} />;
    const base = rowsQuery.data;
    if (base.length === 0) return <EmptyState title={NO_COURSE_SUBJECTS_TEXT} action={<Link href="/materias" className={SECONDARY}>{CONFIGURE_PLAN_LABEL}</Link>} />;

    const rows = applyChanges(base, changes);
    const summary = assignmentSummary(rows);
    const pending = changedCount(base, changes);
    const pickingRow = rows.find((row) => row.subjectId === picking) ?? null;
    const submit = () =>
        save.mutate(changes, {
            onSuccess: () => {
                setChanges({});
                showToast(ASSIGNMENTS_SAVED_TEXT);
            },
        });

    return (
        <div className="flex flex-col gap-4 pb-24 lg:pb-0">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    [ASSIGNMENT_SUMMARY.subjects, summary.subjects],
                    [ASSIGNMENT_SUMMARY.assigned, summary.assigned],
                    [ASSIGNMENT_SUMMARY.unassigned, summary.unassigned],
                    // Conflictos: Back todavía no modela horarios
                    [ASSIGNMENT_SUMMARY.conflicts, EMPTY_VALUE],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-line bg-surface p-4">
                        <dt className="text-xs text-muted">{label}</dt>
                        <dd className="text-xl font-semibold text-ink">{value}</dd>
                    </div>
                ))}
            </dl>
            <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface lg:block">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#F1F5F9] text-xs font-semibold text-muted">
                        <tr>{Object.entries(ASSIGNMENT_COLUMNS).map(([key, label]) => <th key={key} scope="col" className={`px-4 py-3 ${key === "actions" ? "text-right" : ""}`}>{label}</th>)}</tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.subjectId} className={`border-t border-line ${row.changed ? "bg-warning-bg/40" : ""}`}>
                                <th scope="row" className="px-4 py-2 font-semibold text-ink">{row.subjectName}</th>
                                <td className="px-4 py-2 text-ink">{row.weeklyHours} hs</td>
                                <td className="px-4 py-2 text-ink">{row.teacher?.fullName ?? EMPTY_VALUE}</td>
                                <td className="px-4 py-2"><RowStatus row={row} /></td>
                                <td className="px-2 py-1"><RowActions row={row} onAssign={() => setPicking(row.subjectId)} onRemove={() => setRemoving(row)} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ul className="flex flex-col gap-3 lg:hidden">
                {rows.map((row) => (
                    <li key={row.subjectId} className="rounded-2xl border border-line bg-surface p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-ink">{row.subjectName}</h3>
                                <p className="text-sm text-muted">{row.weeklyHours} hs · {row.teacher?.fullName ?? EMPTY_VALUE}</p>
                            </div>
                            <RowStatus row={row} />
                        </div>
                        <RowActions row={row} onAssign={() => setPicking(row.subjectId)} onRemove={() => setRemoving(row)} />
                    </li>
                ))}
            </ul>
            {save.isError && (
                <div role="alert" className="flex flex-wrap items-center gap-2 rounded-[10px] bg-error-bg px-4 py-3 text-sm text-error">
                    <span>{ASSIGNMENTS_ERROR_TEXT} {errorInfo(save.error, "").message}</span>
                    <button type="button" onClick={submit} className="font-semibold underline">{RETRY_LABEL}</button>
                    <button type="button" onClick={() => { setChanges({}); save.reset(); }} className="font-semibold underline">{DISCARD_LABEL}</button>
                </div>
            )}
            {pending > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface p-3 lg:static lg:rounded-2xl lg:border">
                    <span className="text-sm font-semibold text-ink">{pendingChangesText(pending)}</span>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setChanges({})} disabled={save.isPending} className={SECONDARY}>{DISCARD_LABEL}</button>
                        <button type="button" onClick={submit} disabled={save.isPending} className={PRIMARY}>{save.isPending ? "Guardando…" : SAVE_ASSIGNMENTS_LABEL}</button>
                    </div>
                </div>
            )}
            <CandidatePanel
                courseId={courseId}
                row={pickingRow}
                extraHours={(teacherId) => pendingHoursFor(teacherId, base, changes)}
                onClose={() => setPicking(null)}
                onChoose={(candidate) => {
                    if (pickingRow) setChanges((current) => ({ ...current, [pickingRow.subjectId]: { id: candidate.id, fullName: candidate.fullName } }));
                    setPicking(null);
                }}
            />
            <ConfirmDialog
                open={removing !== null}
                title={removing ? removeTeacherTitle(removing.teacher?.fullName ?? "", removing.subjectName, courseName) : ""}
                confirmLabel={REMOVE_TEACHER_LABEL}
                destructive
                onCancel={() => setRemoving(null)}
                onConfirm={() => {
                    if (removing) setChanges((current) => ({ ...current, [removing.subjectId]: null }));
                    setRemoving(null);
                }}
            />
        </div>
    );
}

function AssignmentContent() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const courses = useCourses();
    const courseId = params.get("curso") || null;
    const subjectId = params.get("materia") || null;
    const [schoolYear, setSchoolYear] = useState("");
    const [shift, setShift] = useState("");
    const list = courses.data ?? [];
    const years = [...new Set(list.map((course) => course.schoolYear).filter((year): year is number => year !== null))].sort();
    const visible = list.filter((course) => (!schoolYear || String(course.schoolYear) === schoolYear) && (!shift || course.shift === shift));
    const course = list.find((item) => item.id === courseId) ?? null;
    const select = `${CONTROL_STYLES} border-line`;
    return (
        <>
            <Link href="/docentes" className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-blue hover:underline">← {BACK_TO_TEACHERS_LABEL}</Link>
            <h1 className="mb-4 text-2xl font-semibold text-ink">{ASSIGNMENT_TITLE}</h1>
            <div className="mb-4 grid gap-3 rounded-2xl border border-line bg-surface p-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="asignacion-ciclo" className={LABEL_STYLES}>{ASSIGNMENT_SELECTORS.schoolYear}</label>
                    <select id="asignacion-ciclo" value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} className={select}>
                        <option value="">Todos</option>
                        {years.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="asignacion-turno" className={LABEL_STYLES}>{ASSIGNMENT_SELECTORS.shift}</label>
                    <select id="asignacion-turno" value={shift} onChange={(event) => setShift(event.target.value)} className={select}>
                        <option value="">Todos</option>
                        {Object.entries(SHIFT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="asignacion-curso" className={LABEL_STYLES}>{ASSIGNMENT_SELECTORS.course}</label>
                    <select id="asignacion-curso" value={courseId ?? ""} onChange={(event) => router.replace(event.target.value ? `${pathname}?curso=${event.target.value}` : pathname, { scroll: false })} className={select} disabled={courses.isPending}>
                        <option value="">Elegir curso</option>
                        {visible.map((item) => <option key={item.id} value={item.id}>{courseLabel(item)}</option>)}
                    </select>
                </div>
            </div>
            {courses.isError && <ErrorState message={errorInfo(courses.error, TEACHERS_ERROR_TEXT).message} onRetry={() => void courses.refetch()} />}
            {courseId ? <CourseAssignments key={courseId} courseId={courseId} courseName={course ? courseLabel(course) : ""} preselected={subjectId} /> : <EmptyState title={CHOOSE_COURSE_TEXT} />}
        </>
    );
}

// Asignación de materias por curso (SDD 7.3). Los cambios se acumulan y se guardan juntos.
export function AssignmentScreen() {
    const { active } = useSession();
    if (!canManageSchool(active.role)) return <EmptyState title={FORBIDDEN_TEXT} />;
    return <AssignmentContent />;
}
