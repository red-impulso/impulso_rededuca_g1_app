import { GradeChip } from "./grade-chip";
import { GradeInput } from "./grade-input";
import type { ObservationState, RowState } from "./grade-drafts";
import { ObservationInput } from "./observation-input";
import type { GradeRow } from "./types";

type GradeStudentCardProps = {
    row: GradeRow;
    // Qué mostrar y si hay error (sale de getRowState)
    state: RowState;
    onChange: (text: string) => void;
    // Observación del docente. Si no se pasa, no se muestra el campo.
    observation?: ObservationState;
    onObservationChange?: (text: string) => void;
    // true mientras se está guardando
    disabled?: boolean;
};

// Tarjeta de un alumno para la planilla en celular (M1-UX, sección 3)
export function GradeStudentCard({
    row,
    state,
    onChange,
    observation,
    onObservationChange,
    disabled = false,
}: GradeStudentCardProps) {
    const fullName = `${row.student.lastName}, ${row.student.firstName}`;

    return (
        <li className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate font-semibold text-ink">{fullName}</p>
                {/* Con un valor inválido no se muestra el cartelito de nota */}
                {!state.error && <GradeChip value={state.value} />}
            </div>

            <div className="mt-3 flex flex-col items-start gap-1">
                <span className="text-xs text-muted">Nota</span>
                <GradeInput
                    value={state.text}
                    onChange={onChange}
                    ariaLabel={`Nota de ${fullName}`}
                    invalid={state.error !== null}
                    disabled={disabled}
                />
            </div>

            {state.error && <p className="mt-2 text-xs text-error">{state.error}</p>}

            {observation && onObservationChange && (
                <div className="mt-3 flex flex-col gap-1">
                    <span className="text-xs text-muted">Observación</span>
                    <ObservationInput
                        value={observation.text}
                        onChange={onObservationChange}
                        ariaLabel={`Observación de ${fullName}`}
                        error={observation.error}
                        disabled={disabled}
                    />
                </div>
            )}
        </li>
    );
}