import { GradeChip } from "./grade-chip";
import { GradeInput } from "./grade-input";
import type { RowState } from "./grade-drafts";
import type { GradeRow } from "./types";

type GradeStudentCardProps = {
    row: GradeRow;
    // Qué mostrar y si hay error (sale de getRowState)
    state: RowState;
    onChange: (text: string) => void;
    // true mientras se está guardando
    disabled?: boolean;
};

// Tarjeta de un alumno para la planilla en celular (M1-UX, sección 3)
export function GradeStudentCard({ row, state, onChange, disabled = false }: GradeStudentCardProps) {
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
        </li>
    );
}