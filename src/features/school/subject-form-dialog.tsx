"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CONTROL_STYLES, LABEL_STYLES, SelectField, TextField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { courseLabel } from "./school-rules";
import { makeSubjectSchema, subjectToValues } from "./school-schemas";
import type { SubjectFormValues } from "./school-schemas";
import {
    CANCEL_LABEL,
    COURSES_LOAD_ERROR_TEXT,
    EDIT_SUBJECT_LABEL,
    LOADING_TEXT,
    NEW_SUBJECT_LABEL,
    NO_TEACHER_OPTION,
    SAVE_ERROR_TEXT,
    SAVE_LABEL,
    SAVING_LABEL,
    SELECT_PLACEHOLDER,
    STATUS_LABELS,
    SUBJECT_FIELD_LABELS,
    SUBJECT_NAME_PLACEHOLDER,
    TEACHERS_LOAD_ERROR_TEXT,
    WEEKLY_HOURS_HELP_TEXT,
} from "./school-texts";
import type { Subject } from "./types";
import { errorInfo, useCourses, useSaveSubject, useTeacherOptions } from "./use-school-data";

type SubjectFormDialogProps = {
    open: boolean;
    subject: Subject | null;
    // Todas las materias, para avisar si el nombre se repite en el curso
    subjects: Subject[];
    onOpenChange: (open: boolean) => void;
    onSaved: (subject: Subject, created: boolean) => void;
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
const BUTTON_STYLES =
    "h-11 flex-1 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 lg:flex-none";

function SubjectForm({ subject, subjects, onCancel, onSaved }: Omit<SubjectFormDialogProps, "open" | "onOpenChange"> & { onCancel: () => void }) {
    const save = useSaveSubject();
    const courses = useCourses();
    const teachers = useTeacherOptions();
    const courseList = courses.data ?? [];
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SubjectFormValues>({
        resolver: zodResolver(makeSubjectSchema(subjects, courseList, subject?.id ?? null)),
        defaultValues: subjectToValues(subject),
        mode: "onTouched",
    });

    const courseOptions = courseList.map((course) => ({ value: course.id, label: courseLabel(course) }));
    if (subject?.course && !courseOptions.some((option) => option.value === subject.course?.id)) {
        courseOptions.push({ value: subject.course.id, label: courseLabel(subject.course) });
    }
    const teacherOptions = (teachers.data ?? []).map((teacher) => ({ value: teacher.id, label: teacher.fullName ?? "—" }));
    if (subject?.teacher && !teacherOptions.some((option) => option.value === subject.teacher?.id)) {
        teacherOptions.push({ value: subject.teacher.id, label: subject.teacher.fullName ?? "—" });
    }
    const saveError = save.isError ? errorInfo(save.error, SAVE_ERROR_TEXT) : null;
    const descriptionError = errors.description?.message;

    return (
        <form
            noValidate
            onSubmit={handleSubmit((values) => save.mutate({ id: subject?.id ?? null, values }, { onSuccess: (saved) => onSaved(saved, subject === null) }))}
            className="flex flex-col gap-4"
        >
            <TextField
                id="materia-name"
                label={SUBJECT_FIELD_LABELS.name}
                placeholder={SUBJECT_NAME_PLACEHOLDER}
                autoComplete="off"
                error={errors.name?.message}
                {...register("name")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                    id="materia-course"
                    label={SUBJECT_FIELD_LABELS.courseId}
                    placeholder={courses.isPending ? LOADING_TEXT : SELECT_PLACEHOLDER}
                    options={courseOptions}
                    disabled={courses.isPending}
                    error={errors.courseId?.message ?? (courses.isError ? COURSES_LOAD_ERROR_TEXT : undefined)}
                    {...register("courseId")}
                />
                <TextField
                    id="materia-hours"
                    label={SUBJECT_FIELD_LABELS.weeklyHours}
                    inputMode="numeric"
                    help={WEEKLY_HOURS_HELP_TEXT}
                    error={errors.weeklyHours?.message}
                    {...register("weeklyHours")}
                />
            </div>
            <SelectField
                id="materia-teacher"
                label={SUBJECT_FIELD_LABELS.teacherId}
                placeholder={teachers.isPending ? LOADING_TEXT : NO_TEACHER_OPTION}
                options={teacherOptions}
                disabled={teachers.isPending}
                error={teachers.isError ? TEACHERS_LOAD_ERROR_TEXT : undefined}
                {...register("teacherId")}
            />
            <div className="flex flex-col gap-1.5">
                <label htmlFor="materia-description" className={LABEL_STYLES}>{SUBJECT_FIELD_LABELS.description}</label>
                <textarea
                    id="materia-description"
                    rows={3}
                    aria-invalid={descriptionError ? true : undefined}
                    aria-describedby={descriptionError ? "materia-description-error" : undefined}
                    className={`${CONTROL_STYLES} h-auto py-2 ${descriptionError ? "border-error" : "border-line"}`}
                    {...register("description")}
                />
                {descriptionError && (
                    <p id="materia-description-error" role="alert" className="text-xs text-error">{descriptionError}</p>
                )}
            </div>
            <SelectField id="materia-status" label={SUBJECT_FIELD_LABELS.status} options={STATUS_OPTIONS} error={errors.status?.message} {...register("status")} />

            {saveError && (
                <p role="alert" className={`rounded-[10px] px-4 py-3 text-sm ${saveError.kind === "offline" ? "bg-warning-bg text-warning" : "bg-error-bg text-error"}`}>
                    {saveError.message}
                </p>
            )}
            <div className="flex gap-3 lg:justify-end">
                <button type="button" onClick={onCancel} disabled={save.isPending} className={`${BUTTON_STYLES} border border-line bg-surface text-ink hover:bg-page`}>
                    {CANCEL_LABEL}
                </button>
                <button type="submit" disabled={save.isPending} className={`${BUTTON_STYLES} bg-blue text-white hover:bg-blue/90`}>
                    {save.isPending ? SAVING_LABEL : SAVE_LABEL}
                </button>
            </div>
        </form>
    );
}

// Alta y edición de materia (el nombre es único dentro del curso)
export function SubjectFormDialog({ open, subject, onOpenChange, ...props }: SubjectFormDialogProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={subject ? EDIT_SUBJECT_LABEL : NEW_SUBJECT_LABEL}>
            {open && <SubjectForm key={subject?.id ?? "nueva"} subject={subject} onCancel={() => onOpenChange(false)} {...props} />}
        </Modal>
    );
}
