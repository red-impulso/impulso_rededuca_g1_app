"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SelectField, TextField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { schoolYearOptions } from "./school-rules";
import { courseToValues, makeCourseSchema } from "./school-schemas";
import type { CourseFormValues } from "./school-schemas";
import {
    CANCEL_LABEL,
    CLASSROOM_HELP_TEXT,
    COURSE_FIELD_LABELS,
    COURSE_NAME_PLACEHOLDER,
    EDIT_COURSE_LABEL,
    LOADING_TEXT,
    NEW_COURSE_LABEL,
    NO_HOMEROOM_OPTION,
    SAVE_ERROR_TEXT,
    SAVE_LABEL,
    SAVING_LABEL,
    SELECT_PLACEHOLDER,
    SHIFT_LABELS,
    STATUS_LABELS,
    TEACHERS_LOAD_ERROR_TEXT,
} from "./school-texts";
import type { Course } from "./types";
import { errorInfo, useSaveCourse, useTeacherOptions } from "./use-school-data";

type CourseFormDialogProps = {
    open: boolean;
    // null = curso nuevo
    course: Course | null;
    // Todos los cursos, para avisar si ya existe
    courses: Course[];
    defaultSchoolYear: number;
    onOpenChange: (open: boolean) => void;
    onSaved: (course: Course, created: boolean) => void;
};

const SHIFT_OPTIONS = Object.entries(SHIFT_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
const BUTTON_STYLES =
    "h-11 flex-1 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 lg:flex-none";

function CourseForm({ course, courses, defaultSchoolYear, onCancel, onSaved }: Omit<CourseFormDialogProps, "open" | "onOpenChange"> & { onCancel: () => void }) {
    const save = useSaveCourse();
    const teachers = useTeacherOptions();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CourseFormValues>({
        resolver: zodResolver(makeCourseSchema(courses, course?.id ?? null)),
        defaultValues: courseToValues(course, defaultSchoolYear),
        mode: "onTouched",
    });

    const yearOptions = schoolYearOptions(new Date(), course?.schoolYear ?? defaultSchoolYear).map((year) => ({
        value: String(year),
        label: String(year),
    }));
    const teacherOptions = (teachers.data ?? []).map((teacher) => ({ value: teacher.id, label: teacher.fullName ?? "—" }));
    // Si el tutor actual no está en la lista (inactivo, por ejemplo), se agrega para no perderlo
    if (course?.homeroomTeacher && !teacherOptions.some((option) => option.value === course.homeroomTeacher?.id)) {
        teacherOptions.push({ value: course.homeroomTeacher.id, label: course.homeroomTeacher.fullName ?? "—" });
    }

    const submit = handleSubmit((values) => {
        save.mutate(
            { id: course?.id ?? null, values },
            { onSuccess: (saved) => onSaved(saved, course === null) },
        );
    });

    const saveError = save.isError ? errorInfo(save.error, SAVE_ERROR_TEXT) : null;

    return (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
            <TextField
                id="curso-name"
                label={COURSE_FIELD_LABELS.name}
                placeholder={COURSE_NAME_PLACEHOLDER}
                autoComplete="off"
                error={errors.name?.message}
                {...register("name")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                    id="curso-shift"
                    label={COURSE_FIELD_LABELS.shift}
                    placeholder={SELECT_PLACEHOLDER}
                    options={SHIFT_OPTIONS}
                    error={errors.shift?.message}
                    {...register("shift")}
                />
                <SelectField
                    id="curso-schoolYear"
                    label={COURSE_FIELD_LABELS.schoolYear}
                    options={yearOptions}
                    error={errors.schoolYear?.message}
                    {...register("schoolYear")}
                />
            </div>
            <TextField
                id="curso-classroom"
                label={COURSE_FIELD_LABELS.classroom}
                help={CLASSROOM_HELP_TEXT}
                error={errors.classroom?.message}
                {...register("classroom")}
            />
            <SelectField
                id="curso-homeroom"
                label={COURSE_FIELD_LABELS.homeroomTeacherId}
                placeholder={teachers.isPending ? LOADING_TEXT : NO_HOMEROOM_OPTION}
                options={teacherOptions}
                disabled={teachers.isPending}
                error={teachers.isError ? TEACHERS_LOAD_ERROR_TEXT : undefined}
                {...register("homeroomTeacherId")}
            />
            <SelectField
                id="curso-status"
                label={COURSE_FIELD_LABELS.status}
                options={STATUS_OPTIONS}
                error={errors.status?.message}
                {...register("status")}
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

            <div className="flex gap-3 lg:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={save.isPending}
                    className={`${BUTTON_STYLES} border border-line bg-surface text-ink hover:bg-page`}
                >
                    {CANCEL_LABEL}
                </button>
                <button type="submit" disabled={save.isPending} className={`${BUTTON_STYLES} bg-blue text-white hover:bg-blue/90`}>
                    {save.isPending ? SAVING_LABEL : SAVE_LABEL}
                </button>
            </div>
        </form>
    );
}

// Alta y edición de curso en un modal (hoja inferior en celular)
export function CourseFormDialog({ open, course, onOpenChange, ...props }: CourseFormDialogProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={course ? EDIT_COURSE_LABEL : NEW_COURSE_LABEL}>
            {/* Se monta de nuevo en cada apertura: arranca con los datos del curso */}
            {open && <CourseForm key={course?.id ?? "nuevo"} course={course} onCancel={() => onOpenChange(false)} {...props} />}
        </Modal>
    );
}
