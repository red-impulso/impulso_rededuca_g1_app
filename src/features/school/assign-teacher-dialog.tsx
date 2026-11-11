"use client";

import Link from "next/link";

import { useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { SelectField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { SkeletonLines } from "@/components/ui/skeleton";
import {
    ASSIGN_SAVE_LABEL,
    ASSIGN_SUBJECT_LABEL,
    ASSIGN_TEACHER_FIELD_LABEL,
    ASSIGN_TEACHER_LABEL,
    CANCEL_LABEL,
    COURSE_LOAD_ERROR_TEXT,
    COURSE_WITHOUT_SUBJECTS_TEXT,
    LOADING_TEXT,
    NO_TEACHER_OPTION,
    REQUIRED_TEXT,
    SAVE_ERROR_TEXT,
    SAVING_LABEL,
    SELECT_PLACEHOLDER,
    TEACHERS_LOAD_ERROR_TEXT,
} from "./school-texts";
import { errorInfo, useCourseAssignments, useSetSubjectTeacher, useTeacherOptions } from "./use-school-data";

// Flujo completo de M8 con curso (y materia) preseleccionados
export function fullAssignmentHref(courseId: string, subjectId?: string | null): string {
    return `/docentes/asignacion?curso=${encodeURIComponent(courseId)}${subjectId ? `&materia=${encodeURIComponent(subjectId)}` : ""}`;
}

type AssignTeacherDialogProps = {
    open: boolean;
    courseId: string;
    // "5° Año A", para el subtítulo
    courseName: string;
    // Materia elegida de entrada (desde /materias)
    subjectId?: string | null;
    onOpenChange: (open: boolean) => void;
    onAssigned: () => void;
};

const BUTTON_STYLES =
    "h-11 flex-1 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 lg:flex-none";

function AssignForm({ courseId, subjectId: initialSubjectId, onCancel, onAssigned }: Pick<AssignTeacherDialogProps, "courseId" | "subjectId" | "onAssigned"> & { onCancel: () => void }) {
    const assignments = useCourseAssignments(courseId);
    const teachers = useTeacherOptions();
    const assign = useSetSubjectTeacher();
    const [subjectId, setSubjectId] = useState(initialSubjectId ?? "");
    // undefined = todavía no lo cambió: se usa el docente actual de la materia
    const [teacherId, setTeacherId] = useState<string | undefined>(undefined);
    const [showErrors, setShowErrors] = useState(false);

    if (assignments.isPending) return <SkeletonLines lines={4} />;
    if (assignments.isError) {
        return <ErrorState message={errorInfo(assignments.error, COURSE_LOAD_ERROR_TEXT).message} onRetry={() => void assignments.refetch()} />;
    }

    const subjects = assignments.data.subjects;
    if (subjects.length === 0) return <p className="rounded-[10px] bg-page px-4 py-3 text-sm text-muted">{COURSE_WITHOUT_SUBJECTS_TEXT}</p>;

    const subject = subjects.find((item) => item.id === subjectId) ?? null;
    const selectedTeacher = teacherId ?? subject?.teacher?.id ?? "";
    const teacherOptions = (teachers.data ?? []).map((teacher) => ({ value: teacher.id, label: teacher.fullName ?? "—" }));
    if (subject?.teacher && !teacherOptions.some((option) => option.value === subject.teacher?.id)) {
        teacherOptions.push({ value: subject.teacher.id, label: subject.teacher.fullName ?? "—" });
    }
    const saveError = assign.isError ? errorInfo(assign.error, SAVE_ERROR_TEXT) : null;

    return (
        <form
            noValidate
            onSubmit={(event) => {
                event.preventDefault();
                if (!subject) {
                    setShowErrors(true);
                    return;
                }
                assign.mutate({ subjectId: subject.id, teacherId: selectedTeacher || null }, { onSuccess: onAssigned });
            }}
            className="flex flex-col gap-4"
        >
            <SelectField
                id="asignar-materia"
                label={ASSIGN_SUBJECT_LABEL}
                placeholder={SELECT_PLACEHOLDER}
                options={subjects.map((item) => ({ value: item.id, label: item.name }))}
                value={subjectId}
                onChange={(event) => {
                    setSubjectId(event.target.value);
                    setTeacherId(undefined);
                }}
                error={showErrors && !subject ? REQUIRED_TEXT : undefined}
            />
            <SelectField
                id="asignar-docente"
                label={ASSIGN_TEACHER_FIELD_LABEL}
                placeholder={teachers.isPending ? LOADING_TEXT : NO_TEACHER_OPTION}
                options={teacherOptions}
                value={selectedTeacher}
                disabled={teachers.isPending || !subject}
                onChange={(event) => setTeacherId(event.target.value)}
                error={teachers.isError ? TEACHERS_LOAD_ERROR_TEXT : undefined}
            />
            {saveError && (
                <p
                    role="alert"
                    className={`rounded-[10px] px-4 py-3 text-sm ${
                        saveError.kind === "offline" ? "bg-warning-bg text-warning" : "bg-error-bg text-error"
                    }`}
                >
                    {saveError.message}
                </p>
            )}
            <Link href={fullAssignmentHref(courseId, subjectId)} className="inline-flex min-h-11 items-center text-sm font-semibold text-blue hover:underline">
                Abrir asignación completa (carga horaria y disponibilidad)
            </Link>
            <div className="flex gap-3 lg:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={assign.isPending}
                    className={`${BUTTON_STYLES} border border-line bg-surface text-ink hover:bg-page`}
                >
                    {CANCEL_LABEL}
                </button>
                <button type="submit" disabled={assign.isPending} className={`${BUTTON_STYLES} bg-blue text-white hover:bg-blue/90`}>
                    {assign.isPending ? SAVING_LABEL : ASSIGN_SAVE_LABEL}
                </button>
            </div>
        </form>
    );
}

// Asignar o cambiar el docente de una materia del curso (PUT /subjects/:id/teacher).
// El flujo completo de M8 (carga horaria, conflictos) reemplaza a este modal más adelante.
export function AssignTeacherDialog({ open, courseName, onOpenChange, ...props }: AssignTeacherDialogProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={ASSIGN_TEACHER_LABEL} description={courseName}>
            {open && <AssignForm key={`${props.courseId}-${props.subjectId ?? ""}`} onCancel={() => onOpenChange(false)} {...props} />}
        </Modal>
    );
}
