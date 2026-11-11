"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CONTROL_STYLES, LABEL_STYLES, SelectField, TextField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { CANCEL_LABEL, SAVE_LABEL, SAVING_LABEL, SELECT_PLACEHOLDER } from "../school/school-texts";
import { errorInfo } from "../school/use-school-data";
import { GUARDIAN_RELATIONSHIPS } from "./guardians-api";
import { guardianSchema, linkOnlySchema, linkToValues } from "./guardians-schemas";
import type { GuardianFormValues } from "./guardians-schemas";
import {
    ADD_GUARDIAN_LABEL,
    CANDIDATES_ERROR_TEXT,
    EDIT_GUARDIAN_LABEL,
    GUARDIAN_FIELD_LABELS,
    GUARDIAN_SAVE_ERROR_TEXT,
    MODE_LABELS,
    NO_CANDIDATES_TEXT,
    PHONE_HELP_TEXT,
    RELATIONSHIP_LABELS,
    ROLE_LABELS,
    SEARCH_GUARDIAN_LABEL,
    SELECT_GUARDIAN_TEXT,
} from "./guardians-texts";
import type { GuardianLink } from "./types";
import { useGuardianCandidates, useSaveGuardian } from "./use-guardians-data";

type GuardianFormDialogProps = {
    open: boolean;
    studentId: string;
    // null = agregar tutor
    link: GuardianLink | null;
    // Sin tutor principal activo, el nuevo entra como principal
    suggestPrimary: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: (created: boolean) => void;
};

type Mode = "new" | "existing";
const BUTTON = "h-11 flex-1 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 lg:flex-none";
const PERSON_FIELDS = ["firstName", "lastName", "dni", "email", "phone", "altPhone", "address"] as const;

function Check({ id, label, ...input }: { id: string; label: string } & React.ComponentPropsWithRef<"input">) {
    return (
        <label htmlFor={id} className="flex min-h-11 items-center gap-3 text-sm text-ink">
            <input id={id} type="checkbox" className="h-5 w-5 accent-[var(--blue)]" {...input} />
            {label}
        </label>
    );
}

function GuardianForm({ studentId, link, suggestPrimary, onCancel, onSaved }: Omit<GuardianFormDialogProps, "open" | "onOpenChange"> & { onCancel: () => void }) {
    const editing = link !== null;
    const [mode, setMode] = useState<Mode>("new");
    const [search, setSearch] = useState("");
    const [candidateId, setCandidateId] = useState("");
    const [candidateError, setCandidateError] = useState(false);
    const [isPrimary, setIsPrimary] = useState(suggestPrimary);
    const save = useSaveGuardian(studentId);
    const candidates = useGuardianCandidates(search, !editing && mode === "existing");
    const schema = mode === "existing" && !editing ? linkOnlySchema : guardianSchema;
    const { register, handleSubmit, formState: { errors, dirtyFields } } = useForm<GuardianFormValues>({
        // El esquema depende del modo; el resolver se arma en cada render
        resolver: (values, context, options) => zodResolver(schema as typeof guardianSchema)(values, context, options),
        defaultValues: linkToValues(link),
        mode: "onTouched",
    });
    const saveError = save.isError ? errorInfo(save.error, GUARDIAN_SAVE_ERROR_TEXT) : null;

    const submit = handleSubmit((values) => {
        if (editing) {
            const personChanged = PERSON_FIELDS.some((field) => dirtyFields[field]);
            save.mutate({ mode: "edit", guardianMembershipId: link.guardianMembershipId, values, personChanged }, { onSuccess: () => onSaved(false) });
        } else if (mode === "existing") {
            if (!candidateId) {
                setCandidateError(true);
                return;
            }
            save.mutate({ mode: "existing", guardianMembershipId: candidateId, values, isPrimary }, { onSuccess: () => onSaved(true) });
        } else {
            save.mutate({ mode: "new", values, isPrimary }, { onSuccess: () => onSaved(true) });
        }
    });

    return (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
            {!editing && (
                <div role="tablist" className="grid grid-cols-2 gap-1 rounded-[10px] bg-page p-1">
                    {(["new", "existing"] as const).map((item) => (
                        <button
                            key={item}
                            type="button"
                            role="tab"
                            aria-selected={mode === item}
                            onClick={() => setMode(item)}
                            className={`h-11 rounded-[10px] text-sm font-semibold outline-blue/40 focus-visible:outline-3 ${mode === item ? "bg-surface text-ink shadow-sm" : "text-muted"}`}
                        >
                            {MODE_LABELS[item]}
                        </button>
                    ))}
                </div>
            )}
            {mode === "existing" && !editing ? (
                <div className="flex flex-col gap-2">
                    <label htmlFor="tutor-buscar" className={LABEL_STYLES}>{SEARCH_GUARDIAN_LABEL}</label>
                    <input id="tutor-buscar" type="search" value={search} onChange={(event) => setSearch(event.target.value)} className={`${CONTROL_STYLES} border-line`} />
                    {candidates.isError && <p role="alert" className="text-sm text-error">{`${CANDIDATES_ERROR_TEXT} ${errorInfo(candidates.error, "").message}`}</p>}
                    {candidates.data?.length === 0 && <p className="text-sm text-muted">{NO_CANDIDATES_TEXT}</p>}
                    <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
                        {candidates.data?.map((candidate) => (
                            <li key={candidate.membershipId}>
                                <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2 text-sm ${candidateId === candidate.membershipId ? "border-blue bg-[#E8EEF9]" : "border-line"}`}>
                                    <input
                                        type="radio"
                                        name="tutor-existente"
                                        value={candidate.membershipId}
                                        checked={candidateId === candidate.membershipId}
                                        onChange={() => {
                                            setCandidateId(candidate.membershipId);
                                            setCandidateError(false);
                                        }}
                                        className="h-5 w-5 accent-[var(--blue)]"
                                    />
                                    <span>
                                        <span className="block font-semibold text-ink">{candidate.fullName || "—"}</span>
                                        <span className="text-muted">{[candidate.dni && `DNI ${candidate.dni}`, candidate.email].filter(Boolean).join(" · ")}</span>
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    {candidateError && <p role="alert" className="text-xs text-error">{SELECT_GUARDIAN_TEXT}</p>}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField id="tutor-firstName" label={GUARDIAN_FIELD_LABELS.firstName} error={errors.firstName?.message} {...register("firstName")} />
                    <TextField id="tutor-lastName" label={GUARDIAN_FIELD_LABELS.lastName} error={errors.lastName?.message} {...register("lastName")} />
                    <TextField id="tutor-dni" label={GUARDIAN_FIELD_LABELS.dni} inputMode="numeric" error={errors.dni?.message} {...register("dni")} />
                    <TextField id="tutor-email" type="email" label={GUARDIAN_FIELD_LABELS.email} error={errors.email?.message} {...register("email")} />
                    <TextField id="tutor-phone" type="tel" inputMode="numeric" label={GUARDIAN_FIELD_LABELS.phone} help={PHONE_HELP_TEXT} error={errors.phone?.message} {...register("phone")} />
                    <TextField id="tutor-altPhone" type="tel" inputMode="numeric" label={GUARDIAN_FIELD_LABELS.altPhone} error={errors.altPhone?.message} {...register("altPhone")} />
                    <TextField id="tutor-address" label={GUARDIAN_FIELD_LABELS.address} className="sm:col-span-2" error={errors.address?.message} {...register("address")} />
                </div>
            )}
            <SelectField
                id="tutor-relationship"
                label={GUARDIAN_FIELD_LABELS.relationship}
                placeholder={SELECT_PLACEHOLDER}
                options={GUARDIAN_RELATIONSHIPS.map((value) => ({ value, label: RELATIONSHIP_LABELS[value] }))}
                error={errors.relationship?.message}
                {...register("relationship")}
            />
            <fieldset className="flex flex-col">
                <legend className={LABEL_STYLES}>{GUARDIAN_FIELD_LABELS.roles}</legend>
                {!editing && <Check id="tutor-primary" label={ROLE_LABELS.isPrimary} checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />}
                <Check id="tutor-emergency" label={ROLE_LABELS.isEmergencyContact} {...register("isEmergencyContact")} />
                <Check id="tutor-financial" label={ROLE_LABELS.isFinancialResponsible} {...register("isFinancialResponsible")} />
            </fieldset>
            {saveError && (
                <p role="alert" className={`rounded-[10px] px-4 py-3 text-sm ${saveError.kind === "offline" ? "bg-warning-bg text-warning" : "bg-error-bg text-error"}`}>
                    {saveError.message === GUARDIAN_SAVE_ERROR_TEXT ? saveError.message : `${GUARDIAN_SAVE_ERROR_TEXT} ${saveError.message}`}
                </p>
            )}
            <div className="flex gap-3 lg:justify-end">
                <button type="button" onClick={onCancel} disabled={save.isPending} className={`${BUTTON} border border-line bg-surface text-ink hover:bg-page`}>{CANCEL_LABEL}</button>
                <button type="submit" disabled={save.isPending} className={`${BUTTON} bg-blue text-white hover:bg-blue/90`}>{save.isPending ? SAVING_LABEL : SAVE_LABEL}</button>
            </div>
        </form>
    );
}

// Agregar o editar tutor (SDD M9). Si falla, el modal queda abierto con los datos cargados.
export function GuardianFormDialog({ open, link, onOpenChange, ...props }: GuardianFormDialogProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={link ? EDIT_GUARDIAN_LABEL : ADD_GUARDIAN_LABEL}>
            {open && <GuardianForm key={link?.guardianMembershipId ?? "nuevo"} link={link} onCancel={() => onOpenChange(false)} {...props} />}
        </Modal>
    );
}
