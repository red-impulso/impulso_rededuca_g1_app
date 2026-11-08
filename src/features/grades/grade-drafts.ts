import { formatGrade, validateGradeInput } from "./grade-rules";
import type { GradeRow, SaveGradesEntry } from "./types";

// Lógica de edición de la planilla: qué escribió el docente, qué es inválido,
// cuántos cambios hay sin guardar y cuáles se envían a Back.
// No usa React ni la API, para poder probarla fácil.

// Solo guarda lo que el docente tocó: studentId → texto del casillero.
// Si no hay entrada para un alumno, se muestra la nota que vino de Back.
export type GradeDrafts = Record<string, string>;

// Lo que escribió el docente en las observaciones: studentId → texto
export type ObservationDrafts = Record<string, string>;

// Back rechaza (400) observaciones de más de 500 caracteres
export const MAX_OBSERVATION_LENGTH = 500;
export const OBSERVATION_TOO_LONG_MESSAGE = `La observación admite hasta ${MAX_OBSERVATION_LENGTH} caracteres.`;

// Back ignora los valores vacíos: una nota ya cargada no se puede borrar
export const CANNOT_CLEAR_MESSAGE = "No se puede dejar vacía una nota ya cargada.";

export type RowState = {
    // Texto que se muestra en el casillero
    text: string;
    // Nota válida escrita; null si está vacío o es inválido
    value: number | null;
    // true si difiere de lo guardado (cuenta como cambio sin guardar)
    changed: boolean;
    // Mensaje de error del casillero; null si está bien
    error: string | null;
};

function originalText(row: GradeRow): string {
    return row.value === null ? "" : formatGrade(row.value);
}

// Estado de un alumno a partir de la nota de Back y lo que escribió el docente
export function getRowState(row: GradeRow, drafts: GradeDrafts): RowState {
    const text = drafts[row.student.id] ?? originalText(row);
    const result = validateGradeInput(text);

    if (result.status === "invalid") {
        return { text, value: null, changed: true, error: result.message };
    }

    if (result.status === "empty") {
        if (row.value === null) {
            return { text, value: null, changed: false, error: null };
        }
        return { text, value: null, changed: true, error: CANNOT_CLEAR_MESSAGE };
    }

    return {
        text,
        value: result.value,
        changed: result.value !== row.value,
        error: null,
    };
}

// Guarda lo que escribió el docente en un casillero.
// Si queda igual a lo guardado, deja de contar como cambio.
export function setDraft(drafts: GradeDrafts, row: GradeRow, text: string): GradeDrafts {
    const next = { ...drafts, [row.student.id]: text };
    if (!getRowState(row, next).changed) {
        delete next[row.student.id];
    }
    return next;
}

export type ObservationState = {
    // Texto que se muestra en el casillero
    text: string;
    // true si difiere de lo guardado (sin contar espacios al principio y al final)
    changed: boolean;
    // Mensaje de error; null si está bien
    error: string | null;
};

function originalObservation(row: GradeRow): string {
    return row.observations ?? "";
}

// Estado de la observación de un alumno
export function getObservationState(row: GradeRow, drafts: ObservationDrafts): ObservationState {
    const text = drafts[row.student.id] ?? originalObservation(row);
    return {
        text,
        changed: text.trim() !== originalObservation(row).trim(),
        error: text.length > MAX_OBSERVATION_LENGTH ? OBSERVATION_TOO_LONG_MESSAGE : null,
    };
}

// Guarda lo que escribió el docente en una observación.
// Si queda igual a lo guardado, deja de contar como cambio.
export function setObservationDraft(
    drafts: ObservationDrafts,
    row: GradeRow,
    text: string,
): ObservationDrafts {
    const next = { ...drafts, [row.student.id]: text };
    if (!getObservationState(row, next).changed && text.length <= MAX_OBSERVATION_LENGTH) {
        delete next[row.student.id];
    }
    return next;
}

export type DraftsSummary = {
    // Cantidad de alumnos con cambios sin guardar (incluye los inválidos)
    changedCount: number;
    // true si algún casillero tiene error: no se puede guardar
    hasErrors: boolean;
    // Lo que se envía en PUT /grades: solo notas cambiadas y válidas
    entries: SaveGradesEntry[];
};

export function summarizeDrafts(
    rows: GradeRow[],
    drafts: GradeDrafts,
    observationDrafts: ObservationDrafts = {},
): DraftsSummary {
    let changedCount = 0;
    let hasErrors = false;
    const entries: SaveGradesEntry[] = [];

    for (const row of rows) {
        const state = getRowState(row, drafts);
        const observation = getObservationState(row, observationDrafts);
        if (state.changed || observation.changed) changedCount += 1;
        if (state.error || observation.error) {
            hasErrors = true;
            continue;
        }
        if (!(state.changed && state.value !== null) && !observation.changed) continue;

        // Si solo cambió la observación se manda la nota que ya tenía (con null Back la borraría)
        const entry: SaveGradesEntry = {
            studentId: row.student.id,
            value: state.changed ? state.value : row.value,
        };
        if (observation.changed) entry.observations = observation.text.trim();
        entries.push(entry);
    }

    return { changedCount, hasErrors, entries };
}
