import {
    GRADE_LEVEL_LABELS,
    formatAverage,
    getGradeLevel,
} from "./grade-rules";
import type { GradeLevel } from "./grade-rules";

// Colores por nivel (clases de la marca, ver globals.css)
const LEVEL_STYLES: Record<GradeLevel, string> = {
    satisfactory: "bg-success-bg text-success",
    attention: "bg-warning-bg text-warning",
    low: "bg-error-bg text-error",
};

type GradeChipProps = {
    // Promedio o nota; null cuando todavía no hay notas cargadas
    value: number | null;
};

// Cartelito de nota: siempre lleva número y texto, nunca solo color (M1-UX, sección 6)
export function GradeChip({ value }: GradeChipProps) {
    const baseStyles =
        "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold";

    if (value === null) {
        return <span className={`${baseStyles} bg-page text-muted`}>Sin notas</span>;
    }

    const level = getGradeLevel(value);
    return (
        <span className={`${baseStyles} ${LEVEL_STYLES[level]}`}>
            {formatAverage(value)} · {GRADE_LEVEL_LABELS[level]}
        </span>
    );
}