import { GradeChip } from "./grade-chip";
import { GradeInput } from "./grade-input";
import type { ObservationState, RowState } from "./grade-drafts";
import { ObservationInput } from "./observation-input";
import type { GradeRow } from "./types";

type GradeStudentRowProps = {
    row: GradeRow;
    // Qué mostrar y si hay error (sale de getRowState)
    state: RowState;
    onChange: (text: string) => void;
    // Observación del docente. Si no se pasa, no se muestra la columna.
    observation?: ObservationState;
    onObservationChange?: (text: string) => void;
    // true mientras se está guardando
    disabled?: boolean;
};

// Fila de un alumno para la planilla en escritorio (M1-UX, sección 3).
// Va dentro de un <tbody>; el encabezado de la tabla lo arma la planilla.
export function GradeStudentRow({
    row,
    state,
    onChange,
    observation,
    onObservationChange,
    disabled = false,
}: GradeStudentRowProps) {
    const fullName = `${row.student.lastName}, ${row.student.firstName}`;

    return (
        <tr className="border-t border-line even:bg-page">
            <th scope="row" className="px-4 py-2 text-left font-semibold text-ink">
                {fullName}
            </th>
            <td className="px-4 py-2">
                <GradeInput
                    value={state.text}
                    onChange={onChange}
                    ariaLabel={`Nota de ${fullName}`}
                    invalid={state.error !== null}
                    disabled={disabled}
                />
            </td>
            <td className="px-4 py-2">
                {/* Con un valor inválido se muestra el mensaje en lugar del cartelito */}
                {state.error ? (
                    <p className="text-xs text-error">{state.error}</p>
                ) : (
                    <GradeChip value={state.value} />
                )}
            </td>
            {observation && onObservationChange && (
                <td className="px-4 py-2 align-top">
                    <ObservationInput
                        value={observation.text}
                        onChange={onObservationChange}
                        ariaLabel={`Observación de ${fullName}`}
                        error={observation.error}
                        disabled={disabled}
                    />
                </td>
            )}
        </tr>
    );
}