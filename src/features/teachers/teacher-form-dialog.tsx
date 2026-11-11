"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SelectField, TextField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { CANCEL_LABEL, SAVE_LABEL, SAVING_LABEL } from "../school/school-texts";
import { errorInfo } from "../school/use-school-data";
import { teacherSchema, teacherToValues } from "./teachers-schemas";
import type { TeacherFormValues } from "./teachers-schemas";
import { EDIT_TEACHER_LABEL, EMPLOYMENT_LABELS, NEW_TEACHER_HELP_TEXT, NEW_TEACHER_LABEL, TEACHER_FIELD_LABELS, TEACHER_SAVE_ERROR_TEXT, TEACHER_STATUS_LABELS } from "./teachers-texts";
import type { TeacherDetail } from "./types";
import { useSaveTeacher } from "./use-teachers-data";

type TeacherFormDialogProps = {
    open: boolean;
    teacher: TeacherDetail | null;
    onOpenChange: (open: boolean) => void;
    onSaved: (id: string, created: boolean) => void;
};

const BUTTON = "h-11 flex-1 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 lg:flex-none";

function TeacherForm({ teacher, onCancel, onSaved }: { teacher: TeacherDetail | null; onCancel: () => void; onSaved: TeacherFormDialogProps["onSaved"] }) {
    const save = useSaveTeacher();
    const editing = teacher !== null;
    const { register, handleSubmit, formState: { errors } } = useForm<TeacherFormValues>({
        resolver: zodResolver(teacherSchema),
        defaultValues: teacherToValues(teacher),
        mode: "onTouched",
    });
    const error = save.isError ? errorInfo(save.error, TEACHER_SAVE_ERROR_TEXT) : null;
    return (
        <form noValidate onSubmit={handleSubmit((values) => save.mutate({ id: teacher?.id ?? null, values }, { onSuccess: (id) => onSaved(id, !editing) }))} className="flex flex-col gap-4">
            {!editing && <p className="text-sm text-muted">{NEW_TEACHER_HELP_TEXT}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField id="docente-fullName" label={TEACHER_FIELD_LABELS.fullName} error={errors.fullName?.message} {...register("fullName")} />
                <TextField id="docente-email" type="email" label={TEACHER_FIELD_LABELS.email} error={errors.email?.message} {...register("email")} />
                <TextField id="docente-phone" type="tel" label={TEACHER_FIELD_LABELS.phone} error={errors.phone?.message} {...register("phone")} />
                <TextField id="docente-fileNumber" label={TEACHER_FIELD_LABELS.fileNumber} placeholder="L-1042" error={errors.fileNumber?.message} {...register("fileNumber")} />
                <SelectField id="docente-employment" label={TEACHER_FIELD_LABELS.employmentStatus} options={Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => ({ value, label }))} error={errors.employmentStatus?.message} {...register("employmentStatus")} />
                <SelectField id="docente-status" label={TEACHER_FIELD_LABELS.status} options={Object.entries(TEACHER_STATUS_LABELS).map(([value, label]) => ({ value, label }))} error={errors.status?.message} {...register("status")} />
                <TextField id="docente-maxHours" inputMode="numeric" label={TEACHER_FIELD_LABELS.maxWeeklyHours} error={errors.maxWeeklyHours?.message} {...register("maxWeeklyHours")} />
                <TextField id="docente-hiredAt" type="date" label={TEACHER_FIELD_LABELS.hiredAt} error={errors.hiredAt?.message} {...register("hiredAt")} />
            </div>
            {error && <p role="alert" className={`rounded-[10px] px-4 py-3 text-sm ${error.kind === "offline" ? "bg-warning-bg text-warning" : "bg-error-bg text-error"}`}>{error.message}</p>}
            <div className="flex gap-3 lg:justify-end">
                <button type="button" onClick={onCancel} disabled={save.isPending} className={`${BUTTON} border border-line bg-surface text-ink hover:bg-page`}>{CANCEL_LABEL}</button>
                <button type="submit" disabled={save.isPending} className={`${BUTTON} bg-blue text-white hover:bg-blue/90`}>{save.isPending ? SAVING_LABEL : SAVE_LABEL}</button>
            </div>
        </form>
    );
}

export function TeacherFormDialog({ open, teacher, onOpenChange, onSaved }: TeacherFormDialogProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={teacher ? EDIT_TEACHER_LABEL : NEW_TEACHER_LABEL}>
            {open && <TeacherForm key={teacher?.id ?? "nuevo"} teacher={teacher} onCancel={() => onOpenChange(false)} onSaved={onSaved} />}
        </Modal>
    );
}
