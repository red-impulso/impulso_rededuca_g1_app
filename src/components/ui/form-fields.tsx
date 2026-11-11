import type { ComponentPropsWithRef, ReactNode } from "react";

// Campos de formulario reutilizables (SDD: TextField, SelectField, Toggle).
// Radio 10 px, 44 px de alto, foco visible de 3 px; error = borde rojo + texto debajo.

export const CONTROL_STYLES =
    "h-11 w-full rounded-[10px] border bg-surface px-3 text-sm text-ink outline-blue/40 focus-visible:outline-3 disabled:opacity-60";
export const LABEL_STYLES = "text-sm font-semibold text-ink";

function borderOf(error?: string): string {
    return error ? "border-error" : "border-line";
}

// aria-describedby con la ayuda y el error del campo
function describedBy(id: string, help?: string, error?: string): string | undefined {
    const ids = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
}

function FieldFooter({ id, help, error }: { id: string; help?: string; error?: string }) {
    return (
        <>
            {help && (
                <p id={`${id}-help`} className="text-xs text-muted">
                    {help}
                </p>
            )}
            {error && (
                <p id={`${id}-error`} role="alert" className="text-sm text-error">
                    {error}
                </p>
            )}
        </>
    );
}

type BaseProps = {
    id: string;
    label: string;
    help?: string;
    error?: string;
    className?: string;
};

type TextFieldProps = BaseProps & Omit<ComponentPropsWithRef<"input">, "id" | "className">;

export function TextField({ id, label, help, error, className = "", ...input }: TextFieldProps) {
    return (
        <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
            <label htmlFor={id} className={LABEL_STYLES}>
                {label}
            </label>
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, help, error)}
                className={`${CONTROL_STYLES} ${borderOf(error)}`}
                {...input}
            />
            <FieldFooter id={id} help={help} error={error} />
        </div>
    );
}

type SelectFieldProps = BaseProps &
    Omit<ComponentPropsWithRef<"select">, "id" | "className" | "children"> & {
        options: { value: string; label: string }[];
        // Opción vacía al principio (ej. "Selecciona una opción")
        placeholder?: string;
    };

export function SelectField({ id, label, help, error, className = "", options, placeholder, ...select }: SelectFieldProps) {
    return (
        <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
            <label htmlFor={id} className={LABEL_STYLES}>
                {label}
            </label>
            <select
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, help, error)}
                className={`${CONTROL_STYLES} ${borderOf(error)}`}
                {...select}
            >
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <FieldFooter id={id} help={help} error={error} />
        </div>
    );
}

type SwitchFieldProps = {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    // Texto del estado (no se comunica solo con color)
    onText: string;
    offText: string;
    disabled?: boolean;
    description?: ReactNode;
};

export function SwitchField({ id, label, checked, onChange, onText, offText, disabled, description }: SwitchFieldProps) {
    return (
        <div className="flex min-h-11 items-center justify-between gap-3 rounded-[10px] border border-line bg-surface px-3 py-2">
            <div className="min-w-0">
                <span id={`${id}-label`} className={LABEL_STYLES}>
                    {label}
                </span>
                {description && <p className="text-xs text-muted">{description}</p>}
            </div>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={`${id}-label`}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-[10px] px-1 text-sm text-muted outline-blue/40 focus-visible:outline-3 disabled:opacity-60"
            >
                <span>{checked ? onText : offText}</span>
                <span
                    aria-hidden="true"
                    className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-blue" : "bg-line"}`}
                >
                    <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] ${
                            checked ? "left-[22px]" : "left-0.5"
                        }`}
                    />
                </span>
            </button>
        </div>
    );
}
