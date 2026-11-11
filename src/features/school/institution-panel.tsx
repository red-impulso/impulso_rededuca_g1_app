"use client";

import Image from "next/image";
import { useRef } from "react";
import { formatUpdatedAt, schoolInitial, schoolSummary } from "./school-rules";
import { CHANGE_LOGO_LABEL, LAST_UPDATE_LABEL, SCHOOL_PANEL_TITLE, UPLOADING_LOGO_LABEL } from "./school-texts";
import type { School } from "./types";

type InstitutionPanelProps = {
    school: School;
    now?: Date;
    uploading: boolean;
    // Error del último intento de subir el logo (null si no hay)
    error: string | null;
    onLogoChange: (file: File) => void;
};

const LOGO_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml";

// Panel "Institución": logo, nombre, código, año lectivo y última actualización
export function InstitutionPanel({ school, now = new Date(), uploading, error, onLogoChange }: InstitutionPanelProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const summary = schoolSummary(school);

    return (
        <aside
            aria-labelledby="escuela-panel-title"
            className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-center"
        >
            <h2 id="escuela-panel-title" className="self-start text-base font-semibold text-ink">
                {SCHOOL_PANEL_TITLE}
            </h2>
            {school.logoUrl ? (
                <Image
                    src={school.logoUrl}
                    alt={`Logo de ${school.name}`}
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-2xl border border-line object-contain"
                />
            ) : (
                <span
                    aria-hidden="true"
                    className="flex h-24 w-24 items-center justify-center rounded-2xl bg-ink text-4xl font-semibold text-white"
                >
                    {schoolInitial(school.name)}
                </span>
            )}
            <div className="min-w-0 max-w-full">
                <p className="break-words font-semibold text-ink">{school.name}</p>
                {summary && <p className="text-sm text-muted">{summary}</p>}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={LOGO_TYPES}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onLogoChange(file);
                    // Permite volver a elegir el mismo archivo
                    event.target.value = "";
                }}
            />
            <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="h-11 rounded-[10px] border border-line bg-surface px-4 font-semibold text-ink outline-blue/40 hover:bg-page focus-visible:outline-3 disabled:opacity-60"
            >
                {uploading ? UPLOADING_LOGO_LABEL : CHANGE_LOGO_LABEL}
            </button>
            {error && (
                <p role="alert" className="w-full rounded-[10px] bg-error-bg px-3 py-2 text-sm text-error">
                    {error}
                </p>
            )}
            <p className="text-xs text-muted">
                {LAST_UPDATE_LABEL} {formatUpdatedAt(school.updatedAt, now)}
            </p>
        </aside>
    );
}
