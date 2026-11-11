"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SelectField, TextField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { errorInfo } from "../school/use-school-data";
import { ROLES } from "./users-api";
import { userSchema, userToValues } from "./users-schemas";
import type { UserFormValues } from "./users-schemas";
import { EDIT_USER_TITLE, FORM_LABELS, INVITE_USER_LABEL, PASSWORD_HELP, SAVE_ERROR_TEXT, USER_ROLE_LABELS } from "./users-texts";
import type { UserRow } from "./types";
import { useSaveUser } from "./use-users-data";

const BUTTON = "h-11 flex-1 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 lg:flex-none";

function UserForm({ user, onCancel, onSaved }: { user: UserRow | null; onCancel: () => void; onSaved: (values: UserFormValues) => void }) {
    const save = useSaveUser();
    const { register, handleSubmit, formState: { errors } } = useForm<UserFormValues>({ resolver: zodResolver(userSchema), defaultValues: userToValues(user), mode: "onTouched" });
    const error = save.isError ? errorInfo(save.error, SAVE_ERROR_TEXT) : null;
    return (
        <form noValidate onSubmit={handleSubmit((values) => save.mutate({ user, values }, { onSuccess: () => onSaved(values) }))} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField id="usuario-nombre" label={FORM_LABELS.firstName} autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
                <TextField id="usuario-apellido" label={FORM_LABELS.lastName} autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
                <TextField id="usuario-email" type="email" inputMode="email" label={FORM_LABELS.email} autoComplete="email" error={errors.email?.message} {...register("email")} />
                <TextField id="usuario-dni" inputMode="numeric" label={FORM_LABELS.dni} error={errors.dni?.message} {...register("dni")} />
                <TextField id="usuario-telefono" type="tel" inputMode="tel" label={FORM_LABELS.phone} error={errors.phone?.message} {...register("phone")} />
                <SelectField id="usuario-rol" label={FORM_LABELS.role} options={ROLES.map((role) => ({ value: role, label: USER_ROLE_LABELS[role] }))} error={errors.role?.message} {...register("role")} />
                {!user && <TextField id="usuario-clave" type="password" autoComplete="new-password" label={FORM_LABELS.password} help={PASSWORD_HELP} error={errors.temporaryPassword?.message} {...register("temporaryPassword")} />}
            </div>
            {error && <p role="alert" className={`rounded-[10px] px-4 py-3 text-sm ${error.kind === "offline" ? "bg-warning-bg text-warning" : "bg-error-bg text-error"}`}>{error.message}</p>}
            <div className="flex gap-3 lg:justify-end">
                <button type="button" onClick={onCancel} disabled={save.isPending} className={`${BUTTON} border border-line bg-surface text-ink hover:bg-page`}>Cancelar</button>
                <button type="submit" disabled={save.isPending} className={`${BUTTON} bg-blue text-white hover:bg-blue/90`}>{save.isPending ? "Guardando cambios…" : user ? "Guardar" : INVITE_USER_LABEL}</button>
            </div>
        </form>
    );
}

export function UserFormDialog({ open, user, onOpenChange, onSaved }: { open: boolean; user: UserRow | null; onOpenChange: (open: boolean) => void; onSaved: (values: UserFormValues) => void }) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={user ? EDIT_USER_TITLE : INVITE_USER_LABEL}>
            {open && <UserForm key={user?.membershipId ?? "nuevo"} user={user} onCancel={() => onOpenChange(false)} onSaved={onSaved} />}
        </Modal>
    );
}
