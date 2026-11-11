"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CONTROL_STYLES, LABEL_STYLES, SelectField, TextField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { courseLabel } from "../school/school-rules";
import { CANCEL_LABEL, LOADING_TEXT, SAVE_LABEL, SAVING_LABEL, SELECT_PLACEHOLDER, COURSES_LOAD_ERROR_TEXT } from "../school/school-texts";
import { errorInfo, useCourses } from "../school/use-school-data";
import { profileToValues, studentSchema } from "./students-schemas";
import type { StudentFormValues } from "./students-schemas";
import { EDIT_STUDENT_LABEL, GENDER_OPTIONS, NEW_STUDENT_LABEL, OPTIONAL_SECTION_LABEL, STUDENT_FIELD_LABELS, STUDENT_SAVE_ERROR_TEXT, STUDENT_STATUS_LABELS } from "./students-texts";
import type { StudentProfile } from "./types";
import { useSaveStudent } from "./use-students-data";

type StudentFormDialogProps = {
    open: boolean;
    // null = alumno nuevo
    profile: StudentProfile | null;
    // Curso elegido de entrada (filtro activo en la lista)
    defaultCourseId?: string;
    onOpenChange: (open: boolean) => void;
    onSaved: (id: string, created: boolean) => void;
};

const BUTTON_STYLES = "h-11 flex-1 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 lg:flex-none";

function TextArea({ id, label, error, ...props }: { id: string; label: string; error?: string } & React.ComponentPropsWithRef<"textarea">) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className={LABEL_STYLES}>{label}</label>
            <textarea id={id} rows={3} aria-invalid={error ? true : undefined} className={`${CONTROL_STYLES} h-auto py-2 ${error ? "border-error" : "border-line"}`} {...props} />
            {error && <p role="alert" className="text-xs text-error">{error}</p>}
        </div>
    );
}

function StudentForm({ profile, defaultCourseId, onCancel, onSaved }: Omit<StudentFormDialogProps, "open" | "onOpenChange"> & { onCancel: () => void }) {
    const save = useSaveStudent();
    const courses = useCourses();
    const editing = profile !== null;
    const { register, handleSubmit, formState: { errors } } = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: profileToValues(profile, defaultCourseId),
        mode: "onTouched",
        shouldFocusError: true,
    });
    const courseOptions = (courses.data ?? []).map((course) => ({ value: course.id, label: courseLabel(course) }));
    const current = profile?.academic.course;
    if (current && !courseOptions.some((option) => option.value === current.id)) courseOptions.push({ value: current.id, label: courseLabel(current) });
    // Back: un alumno nuevo nace activo o como borrador
    const statusOptions = Object.entries(STUDENT_STATUS_LABELS)
        .filter(([value]) => editing || value !== "inactive")
        .map(([value, label]) => ({ value, label }));
    const saveError = save.isError ? errorInfo(save.error, STUDENT_SAVE_ERROR_TEXT) : null;

    return (
        <form
            noValidate
            onSubmit={handleSubmit((values) => save.mutate({ id: profile?.personal.id ?? null, values }, { onSuccess: (saved) => onSaved(saved.id, !editing) }))}
            className="flex flex-col gap-4"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField id="alumno-firstName" label={STUDENT_FIELD_LABELS.firstName} autoComplete="off" error={errors.firstName?.message} {...register("firstName")} />
                <TextField id="alumno-lastName" label={STUDENT_FIELD_LABELS.lastName} autoComplete="off" error={errors.lastName?.message} {...register("lastName")} />
                <TextField id="alumno-dni" label={STUDENT_FIELD_LABELS.dni} inputMode="numeric" error={errors.dni?.message} {...register("dni")} />
                <SelectField
                    id="alumno-course"
                    label={STUDENT_FIELD_LABELS.courseId}
                    placeholder={courses.isPending ? LOADING_TEXT : SELECT_PLACEHOLDER}
                    options={courseOptions}
                    disabled={courses.isPending}
                    error={errors.courseId?.message ?? (courses.isError ? COURSES_LOAD_ERROR_TEXT : undefined)}
                    {...register("courseId")}
                />
                <SelectField id="alumno-status" label={STUDENT_FIELD_LABELS.status} options={statusOptions} error={errors.status?.message} {...register("status")} />
                <TextField id="alumno-fileNumber" label={STUDENT_FIELD_LABELS.fileNumber} error={errors.fileNumber?.message} {...register("fileNumber")} />
            </div>
            <details className="rounded-2xl border border-line p-3" open={editing}>
                <summary className="min-h-11 cursor-pointer content-center font-semibold text-ink">{OPTIONAL_SECTION_LABEL}</summary>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <TextField id="alumno-birthDate" type="date" label={STUDENT_FIELD_LABELS.birthDate} error={errors.birthDate?.message} {...register("birthDate")} />
                    <SelectField id="alumno-gender" label={STUDENT_FIELD_LABELS.gender} placeholder={SELECT_PLACEHOLDER} options={GENDER_OPTIONS.map((value) => ({ value, label: value }))} error={errors.gender?.message} {...register("gender")} />
                    <TextField id="alumno-address" label={STUDENT_FIELD_LABELS.address} className="sm:col-span-2" error={errors.address?.message} {...register("address")} />
                    <TextField id="alumno-phone" type="tel" label={STUDENT_FIELD_LABELS.phone} error={errors.phone?.message} {...register("phone")} />
                    <TextField id="alumno-email" type="email" label={STUDENT_FIELD_LABELS.email} error={errors.email?.message} {...register("email")} />
                    <TextField id="alumno-enrollmentDate" type="date" label={STUDENT_FIELD_LABELS.enrollmentDate} error={errors.enrollmentDate?.message} {...register("enrollmentDate")} />
                </div>
                {editing && (
                    <div className="mt-4 grid gap-4">
                        <TextArea id="alumno-obs-academic" label={STUDENT_FIELD_LABELS.observationAcademic} error={errors.observationAcademic?.message} {...register("observationAcademic")} />
                        <TextArea id="alumno-obs-institutional" label={STUDENT_FIELD_LABELS.observationInstitutional} error={errors.observationInstitutional?.message} {...register("observationInstitutional")} />
                    </div>
                )}
            </details>
            {saveError && (
                <p role="alert" className={`rounded-[10px] px-4 py-3 text-sm ${saveError.kind === "offline" ? "bg-warning-bg text-warning" : "bg-error-bg text-error"}`}>
                    {saveError.message}
                </p>
            )}
            <div className="flex gap-3 lg:justify-end">
                <button type="button" onClick={onCancel} disabled={save.isPending} className={`${BUTTON_STYLES} border border-line bg-surface text-ink hover:bg-page`}>{CANCEL_LABEL}</button>
                <button type="submit" disabled={save.isPending} className={`${BUTTON_STYLES} bg-blue text-white hover:bg-blue/90`}>{save.isPending ? SAVING_LABEL : SAVE_LABEL}</button>
            </div>
        </form>
    );
}

// Alta y edición de alumno (el SDD dejó el formulario pendiente: sigue los campos de Back)
export function StudentFormDialog({ open, profile, onOpenChange, ...props }: StudentFormDialogProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={profile ? EDIT_STUDENT_LABEL : NEW_STUDENT_LABEL}>
            {open && <StudentForm key={profile?.personal.id ?? "nuevo"} profile={profile} onCancel={() => onOpenChange(false)} {...props} />}
        </Modal>
    );
}
