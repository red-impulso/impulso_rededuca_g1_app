"use client";

import { useId } from "react";
import { MAX_OBSERVATION_LENGTH } from "./grade-drafts";

type ObservationInputProps = {
    // Lo que está escrito en el casillero
    value: string;
    onChange: (text: string) => void;
    // Para lectores de pantalla, por ejemplo "Observación de Aguirre, Sofía"
    ariaLabel: string;
    // Mensaje de error (por ejemplo, más de 500 caracteres); null si está bien
    error?: string | null;
    disabled?: boolean;
};

// Casillero de la observación del docente: texto libre, hasta 500 caracteres.
// No se corta al escribir (si se pega de más, se avisa y no se puede guardar).
// Diseño provisorio: pendiente de confirmar con UX.
export function ObservationInput({
    value,
    onChange,
    ariaLabel,
    error = null,
    disabled = false,
}: ObservationInputProps) {
    const counterId = useId();
    const invalid = error !== null;

    return (
        <div className="flex flex-col gap-1">
            <textarea
                rows={2}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-invalid={invalid}
                aria-describedby={counterId}
                placeholder="Observación (opcional)"
                className={`min-h-11 w-full min-w-48 resize-y rounded-[10px] border bg-surface px-3 py-2 text-sm text-ink outline-blue/40 focus-visible:outline-3 disabled:opacity-60 ${
                    invalid ? "border-error" : "border-line"
                }`}
            />
            <p
                id={counterId}
                className={`text-xs ${invalid ? "font-semibold text-error" : "text-muted"}`}
                {...(invalid ? { role: "alert" } : {})}
            >
                {invalid ? `${error} ` : ""}
                {`${value.length}/${MAX_OBSERVATION_LENGTH}`}
            </p>
        </div>
    );
}
