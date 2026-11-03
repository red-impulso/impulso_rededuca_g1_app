"use client";

import { useId } from "react";
import { INVALID_GRADE_HINT } from "./grade-rules";

type GradeInputProps = {
    // Lo que está escrito en el casillero (texto, para aceptar "6,5")
    value: string;
    onChange: (text: string) => void;
    // Para lectores de pantalla, por ejemplo "Nota 1 de Aguirre, Sofía"
    ariaLabel: string;
    // true cuando la nota no está entre 1 y 10
    invalid?: boolean;
    disabled?: boolean;
};

// Casillero de una nota (M1-UX, sección 8): 96 px de ancho, área táctil de 44 px
export function GradeInput({
    value,
    onChange,
    ariaLabel,
    invalid = false,
    disabled = false,
}: GradeInputProps) {
    const hintId = useId();

    return (
        <div className="flex flex-col items-center gap-1">
            <input
                type="text"
                // Teclado numérico en el celular, pero sin las trabas de type="number" con la coma
                inputMode="decimal"
                autoComplete="off"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-invalid={invalid}
                aria-describedby={invalid ? hintId : undefined}
                className={`h-11 w-24 rounded-[10px] border bg-surface px-2 text-center text-ink outline-blue/40 focus-visible:outline-3 disabled:opacity-60 ${
                    invalid ? "border-error text-error" : "border-line"
                }`}
            />
            {invalid && (
                <span id={hintId} className="text-xs font-semibold text-error">
                    {INVALID_GRADE_HINT}
                </span>
            )}
        </div>
    );
}