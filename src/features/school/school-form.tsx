"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { SelectField, SwitchField, TextField } from "../../components/ui/form-fields";
import { InstitutionPanel } from "./institution-panel";
import type { ErrorInfo } from "./school-api";
import { isSchoolUnconfigured, optionsWith, schoolYearOptions } from "./school-rules";
import { schoolSchema, schoolToValues } from "./school-schemas";
import type { SchoolFormValues } from "./school-schemas";
import {
    CANCEL_LABEL,
    CODE_HELP_TEXT,
    LEVELS,
    PROVINCES,
    RESTORE_LABEL,
    SAVE_LABEL,
    SAVING_LABEL,
    SCHOOL_EMPTY_TEXT,
    SCHOOL_FIELD_LABELS,
    SCHOOL_PLACEHOLDERS,
    SCHOOL_SAVED_TEXT,
    SCHOOL_SECTION_CONFIG,
    SCHOOL_SECTION_CONTACT,
    SCHOOL_SECTION_INSTITUTIONAL,
    SCHOOL_SUBTITLE,
    SCHOOL_TITLE,
    SELECT_PLACEHOLDER,
    SWITCH_OFF,
    SWITCH_ON,
} from "./school-texts";
import type { School } from "./types";

type SectionKey = "institutional" | "contact" | "config";

const SECTION_FIELDS: Record<SectionKey, (keyof SchoolFormValues)[]> = {
    institutional: ["name", "code", "level", "address", "city", "province"],
    contact: ["phone", "email", "website"],
    config: ["schoolYear", "schedule", "familyCommunications", "dailyAttendance"],
};

const BUTTON_STYLES =
    "h-11 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:cursor-not-allowed disabled:opacity-60";

// Título de la pantalla; "Restaurar valores" a la derecha en escritorio
export function SchoolHeader({ action }: { action?: ReactNode }) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold text-ink">{SCHOOL_TITLE}</h1>
                <p className="text-sm text-muted">{SCHOOL_SUBTITLE}</p>
            </div>
            {action}
        </div>
    );
}

function Chevron({ open }: { open: boolean }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

type FormSectionProps = {
    id: string;
    title: string;
    open: boolean;
    onToggle: () => void;
    // Columnas en escritorio
    columns: string;
    children: ReactNode;
};

// Tarjeta en escritorio; sección colapsable en celular
function FormSection({ id, title, open, onToggle, columns, children }: FormSectionProps) {
    return (
        <section aria-labelledby={`${id}-title`} className="rounded-2xl border border-line bg-surface">
            <h2 id={`${id}-title`} className="text-base font-semibold text-ink">
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`${id}-body`}
                    onClick={onToggle}
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left outline-blue/40 focus-visible:outline-3 lg:hidden"
                >
                    {title}
                    <Chevron open={open} />
                </button>
                <span className="hidden px-4 pt-4 lg:block">{title}</span>
            </h2>
            <div id={`${id}-body`} className={`${open ? "grid" : "hidden"} gap-4 px-4 pt-1 pb-4 lg:grid lg:pt-4 ${columns}`}>
                {children}
            </div>
        </section>
    );
}

type SchoolFormProps = {
    school: School;
    now?: Date;
    saving: boolean;
    // Error del último guardado (null si no hay)
    saveError: ErrorInfo | null;
    // true después de guardar bien (se oculta al volver a editar)
    saved: boolean;
    // Devuelve true si se guardó
    onSave: (values: SchoolFormValues) => Promise<boolean>;
    // dirty = hay cambios sin guardar
    onCancel: (dirty: boolean) => void;
    logoUploading: boolean;
    logoError: string | null;
    onLogoChange: (file: File) => void;
};

// Formulario "Datos de la escuela" (SDD 4.1) con el panel "Institución"
export function SchoolForm({
    school,
    now = new Date(),
    saving,
    saveError,
    saved,
    onSave,
    onCancel,
    logoUploading,
    logoError,
    onLogoChange,
}: SchoolFormProps) {
    const savedValues = schoolToValues(school, now);
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolSchema),
        defaultValues: savedValues,
        mode: "onTouched",
    });
    // En celular: Datos institucionales abierta; Contacto y Configuración cerradas
    const [open, setOpen] = useState<Record<SectionKey, boolean>>({ institutional: true, contact: false, config: false });

    const toggle = (key: SectionKey) => setOpen((current) => ({ ...current, [key]: !current[key] }));

    // Al guardar con errores se abren las secciones que los tienen
    function handleInvalid(fieldErrors: FieldErrors<SchoolFormValues>) {
        setOpen((current) => {
            const next = { ...current };
            for (const key of Object.keys(SECTION_FIELDS) as SectionKey[]) {
                if (SECTION_FIELDS[key].some((field) => fieldErrors[field])) next[key] = true;
            }
            return next;
        });
    }

    const submit = handleSubmit(async (values) => {
        if (await onSave(values)) reset(values);
    }, handleInvalid);

    const restore = () => reset(savedValues);
    const yearOptions = schoolYearOptions(now, school.schoolYear).map((year) => ({ value: String(year), label: String(year) }));

    return (
        <>
            <SchoolHeader
                action={
                    <button
                        type="button"
                        onClick={restore}
                        disabled={!isDirty || saving}
                        className={`${BUTTON_STYLES} hidden border border-line bg-surface text-ink hover:bg-page lg:inline-flex lg:items-center`}
                    >
                        {RESTORE_LABEL}
                    </button>
                }
            />

            <form noValidate onSubmit={submit} className="flex flex-col gap-4">
                {saved && !isDirty && (
                    <p role="status" className="rounded-[10px] bg-success-bg px-4 py-3 text-sm font-semibold text-success">
                        {SCHOOL_SAVED_TEXT}
                    </p>
                )}
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
                {isSchoolUnconfigured(school) && (
                    <p className="rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-muted">{SCHOOL_EMPTY_TEXT}</p>
                )}

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
                    <div className="order-first lg:order-last">
                        <InstitutionPanel
                            school={school}
                            now={now}
                            uploading={logoUploading}
                            error={logoError}
                            onLogoChange={onLogoChange}
                        />
                    </div>

                    <div className="flex min-w-0 flex-col gap-4">
                        <FormSection
                            id="escuela-institucional"
                            title={SCHOOL_SECTION_INSTITUTIONAL}
                            open={open.institutional}
                            onToggle={() => toggle("institutional")}
                            columns="lg:grid-cols-2"
                        >
                            <TextField
                                id="escuela-name"
                                label={SCHOOL_FIELD_LABELS.name}
                                placeholder={SCHOOL_PLACEHOLDERS.name}
                                autoComplete="organization"
                                error={errors.name?.message}
                                {...register("name")}
                            />
                            <TextField
                                id="escuela-code"
                                label={SCHOOL_FIELD_LABELS.code}
                                placeholder={SCHOOL_PLACEHOLDERS.code}
                                help={CODE_HELP_TEXT}
                                autoCapitalize="characters"
                                error={errors.code?.message}
                                {...register("code")}
                            />
                            <SelectField
                                id="escuela-level"
                                label={SCHOOL_FIELD_LABELS.level}
                                placeholder={SELECT_PLACEHOLDER}
                                options={optionsWith(LEVELS, school.level)}
                                error={errors.level?.message}
                                {...register("level")}
                            />
                            <TextField
                                id="escuela-address"
                                label={SCHOOL_FIELD_LABELS.address}
                                autoComplete="street-address"
                                error={errors.address?.message}
                                {...register("address")}
                            />
                            <TextField
                                id="escuela-city"
                                label={SCHOOL_FIELD_LABELS.city}
                                autoComplete="address-level2"
                                error={errors.city?.message}
                                {...register("city")}
                            />
                            <SelectField
                                id="escuela-province"
                                label={SCHOOL_FIELD_LABELS.province}
                                placeholder={SELECT_PLACEHOLDER}
                                options={optionsWith(PROVINCES, school.province)}
                                error={errors.province?.message}
                                {...register("province")}
                            />
                        </FormSection>

                        <FormSection
                            id="escuela-contacto"
                            title={SCHOOL_SECTION_CONTACT}
                            open={open.contact}
                            onToggle={() => toggle("contact")}
                            columns="lg:grid-cols-3"
                        >
                            <TextField
                                id="escuela-phone"
                                label={SCHOOL_FIELD_LABELS.phone}
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                error={errors.phone?.message}
                                {...register("phone")}
                            />
                            <TextField
                                id="escuela-email"
                                label={SCHOOL_FIELD_LABELS.email}
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                error={errors.email?.message}
                                {...register("email")}
                            />
                            <TextField
                                id="escuela-website"
                                label={SCHOOL_FIELD_LABELS.website}
                                inputMode="url"
                                autoComplete="url"
                                error={errors.website?.message}
                                {...register("website")}
                            />
                        </FormSection>

                        <FormSection
                            id="escuela-configuracion"
                            title={SCHOOL_SECTION_CONFIG}
                            open={open.config}
                            onToggle={() => toggle("config")}
                            columns="lg:grid-cols-2"
                        >
                            <SelectField
                                id="escuela-schoolYear"
                                label={SCHOOL_FIELD_LABELS.schoolYear}
                                options={yearOptions}
                                error={errors.schoolYear?.message}
                                {...register("schoolYear")}
                            />
                            <TextField
                                id="escuela-schedule"
                                label={SCHOOL_FIELD_LABELS.schedule}
                                placeholder={SCHOOL_PLACEHOLDERS.schedule}
                                error={errors.schedule?.message}
                                {...register("schedule")}
                            />
                            <Controller
                                control={control}
                                name="familyCommunications"
                                render={({ field }) => (
                                    <SwitchField
                                        id="escuela-familyCommunications"
                                        label={SCHOOL_FIELD_LABELS.familyCommunications}
                                        checked={field.value}
                                        onChange={field.onChange}
                                        onText={SWITCH_ON}
                                        offText={SWITCH_OFF}
                                        disabled={saving}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="dailyAttendance"
                                render={({ field }) => (
                                    <SwitchField
                                        id="escuela-dailyAttendance"
                                        label={SCHOOL_FIELD_LABELS.dailyAttendance}
                                        checked={field.value}
                                        onChange={field.onChange}
                                        onText={SWITCH_ON}
                                        offText={SWITCH_OFF}
                                        disabled={saving}
                                    />
                                )}
                            />
                        </FormSection>

                        {/* "Restaurar valores" en celular: link azul centrado */}
                        <button
                            type="button"
                            onClick={restore}
                            disabled={!isDirty || saving}
                            className="mx-auto min-h-11 px-3 font-semibold text-blue underline-offset-4 outline-blue/40 hover:underline focus-visible:outline-3 disabled:text-muted lg:hidden"
                        >
                            {RESTORE_LABEL}
                        </button>
                    </div>
                </div>

                {/* Barra fija abajo en celular; botones abajo a la derecha en escritorio */}
                <div className="sticky bottom-0 z-10 -mx-4 flex gap-3 border-t border-line bg-surface px-4 py-3 lg:static lg:mx-0 lg:justify-end lg:border-0 lg:bg-transparent lg:p-0">
                    <button
                        type="button"
                        onClick={() => onCancel(isDirty)}
                        disabled={saving}
                        className={`${BUTTON_STYLES} flex-1 border border-line bg-surface text-ink hover:bg-page lg:flex-none`}
                    >
                        {CANCEL_LABEL}
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`${BUTTON_STYLES} flex-[2] bg-blue text-white hover:bg-blue/90 lg:flex-none`}
                    >
                        {saving ? SAVING_LABEL : SAVE_LABEL}
                    </button>
                </div>
            </form>
        </>
    );
}
