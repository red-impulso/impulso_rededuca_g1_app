// Reglas de las calificaciones (M1-UX, secciones 4 y 6).
// La escala 1 a 10 con aprobación en 6 es un supuesto del diseño:
// si la institución la cambia, se modifica solo acá.

export const MIN_GRADE = 1;
export const MAX_GRADE = 10;
export const PASSING_GRADE = 6;
export const SATISFACTORY_GRADE = 7;

// Textos del diseño para una nota inválida (el casillero lleva borde rojo)
export const INVALID_GRADE_MESSAGE = "La nota debe estar entre 1 y 10.";
// Texto corto que va al lado del casillero en rojo
export const INVALID_GRADE_HINT = "Valor inválido";

export type GradeLevel = "satisfactory" | "attention" | "low";

// Texto del indicador: nunca se comunica solo con color
export const GRADE_LEVEL_LABELS: Record<GradeLevel, string> = {
    satisfactory: "Satisfactorio",
    attention: "Atención",
    low: "Bajo",
};

export type GradeInputResult =
    | { status: "empty" }
    | { status: "valid"; value: number }
    | { status: "invalid"; message: string };

// Revisa lo que escribió el docente. Acepta coma o punto: "6,5" y "6.5"
export function validateGradeInput(text: string): GradeInputResult {
    const clean = text.trim();
    if (clean === "") return { status: "empty" };

    // Hasta 2 dígitos enteros y hasta 2 decimales
    if (!/^\d{1,2}([.,]\d{1,2})?$/.test(clean)) {
        return { status: "invalid", message: INVALID_GRADE_MESSAGE };
    }

    const value = Number(clean.replace(",", "."));
    if (value < MIN_GRADE || value > MAX_GRADE) {
        return { status: "invalid", message: INVALID_GRADE_MESSAGE };
    }
    return { status: "valid", value };
}

// Promedio con 1 decimal de las notas cargadas; null si no hay ninguna
export function calculateAverage(grades: Array<number | null>): number | null {
    const loaded = grades.filter((grade): grade is number => grade !== null);
    if (loaded.length === 0) return null;
    const sum = loaded.reduce((total, grade) => total + grade, 0);
    return Math.round((sum / loaded.length) * 10) / 10;
}

// Semáforo: 7 o más verde, de 6 a 6,9 amarillo, menos de 6 rojo
export function getGradeLevel(value: number): GradeLevel {
    if (value >= SATISFACTORY_GRADE) return "satisfactory";
    if (value >= PASSING_GRADE) return "attention";
    return "low";
}

// Nota para mostrar en pantalla, con coma decimal: 6.5 → "6,5"
export function formatGrade(value: number): string {
    return String(value).replace(".", ",");
}

// Promedio para mostrar, siempre con 1 decimal: 7 → "7,0"
export function formatAverage(value: number): string {
    return value.toFixed(1).replace(".", ",");
}