import { studentFullName } from "./attendance-rules";
import { ATTENDANCE_STATUSES, STATUS_LABEL, STATUS_LETTER } from "./types";
import type { AttendanceRow, AttendanceStatus } from "./types";

type AttendanceStudentRowProps = {
    row: AttendanceRow;
    // Estado que se muestra (lo elegido o lo que vino de Back); null = sin marcar
    status: AttendanceStatus | null;
    // true si difiere de lo guardado (cuenta como cambio sin guardar)
    changed: boolean;
    onChange: (status: AttendanceStatus) => void;
    // true mientras se está guardando
    disabled?: boolean;
};

// Colores del botón elegido: solo los de la paleta existente.
// Provisorio: pendiente de confirmar con UX.
const SELECTED_STYLES: Record<AttendanceStatus, string> = {
    present: "border-success bg-success-bg text-success",
    absent: "border-error bg-error-bg text-error",
    late: "border-warning bg-warning-bg text-warning",
    justified: "border-blue bg-blue text-white",
};

const UNSELECTED_STYLES = "border-line bg-surface text-ink";

// Fila de un alumno: nombre, su estado en texto y los botones P / A / T / J.
// Sirve para celular y para escritorio (botones de 44 × 44 px).
export function AttendanceStudentRow({
    row,
    status,
    changed,
    onChange,
    disabled = false,
}: AttendanceStudentRowProps) {
    const fullName = studentFullName(row.student);

    return (
        <li
            className={`rounded-2xl border bg-surface p-4 ${changed ? "border-blue" : "border-line"}`}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{fullName}</p>
                    {/* El estado también va en texto: nunca depende solo del color */}
                    <p className="text-xs text-muted">{status ? STATUS_LABEL[status] : "Sin marcar"}</p>
                </div>

                <div role="group" aria-label={`Asistencia de ${fullName}`} className="flex gap-2">
                    {ATTENDANCE_STATUSES.map((option) => {
                        const selected = status === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={selected}
                                aria-label={STATUS_LABEL[option]}
                                title={STATUS_LABEL[option]}
                                disabled={disabled}
                                onClick={() => onChange(option)}
                                className={`h-11 w-11 rounded-[10px] border font-semibold outline-blue/40 focus-visible:outline-3 disabled:cursor-not-allowed disabled:opacity-60 ${
                                    selected ? SELECTED_STYLES[option] : UNSELECTED_STYLES
                                }`}
                            >
                                {STATUS_LETTER[option]}
                            </button>
                        );
                    })}
                </div>
            </div>
        </li>
    );
}
