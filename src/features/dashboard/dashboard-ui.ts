import type { PerformanceBand } from "./types";

// ZONA PROVISORIA DE UX (M5).
// Acá están juntos los textos y las clases de color del tablero.
// Los que vienen del PDF de M5-UX lo dicen; el resto todavía no lo confirmó UX.
// Cuando UX los defina, se cambian SOLO en este archivo.
// Solo usa clases y colores que ya existen en el proyecto (sin hexadecimales).

// ---- Pendiente UX: nombre del ítem y de la pantalla ----
export const SCREEN_TITLE = "Tablero";
export const SCREEN_SUBTITLE = "Resumen de la institución";

// ---- Números de arriba (nombres de M5-UX, sección 3) ----
export const STUDENTS_LABEL = "Total estudiantes";
export const COURSES_LABEL = "Total cursos";
export const TEACHERS_LABEL = "Total docentes";
export const ATTENDANCE_LABEL = "Asistencia promedio";
// Back calcula la asistencia con todo el historial, no por mes
export const ATTENDANCE_HINT = "Todo el ciclo";

// ---- Alumnos con baja asistencia ----
export const LOW_ATTENDANCE_TITLE = "Alumnos con baja asistencia";
// Umbral y ventana que usa Back (LOW_ATTENDANCE_THRESHOLD y LOW_ATTENDANCE_WINDOW_DAYS)
export const LOW_ATTENDANCE_HINT = "Menos de 85% en los últimos 30 días";
export const LOW_ATTENDANCE_EMPTY = "Ningún alumno tiene baja asistencia en los últimos 30 días.";

// ---- Promedios por materia ----
export const GRADE_AVERAGES_TITLE = "Promedios por materia";
export const GRADE_AVERAGES_EMPTY = "Todavía no hay materias cargadas.";
export const SUBJECT_COLUMN = "Materia";
export const COURSE_COLUMN = "Curso";
export const AVERAGE_COLUMN = "Promedio";
export const STATUS_COLUMN = "Estado";

// ---- Texto cuando faltan datos ----
export const NO_RECORDS_TEXT = "Sin registros";
export const NO_GRADES_TEXT = "Sin notas";
export const NO_STUDENT_NAME_LABEL = "Alumno sin nombre";
export const NO_COURSE_NAME_LABEL = "Curso sin nombre";
export const NO_SUBJECT_NAME_LABEL = "Materia sin nombre";

// ---- Rangos de calificaciones (M5-UX, sección 8: supuesto a definir con Dirección) ----
// El estado nunca se comunica solo con color: siempre va el texto
export const BAND_LABELS: Record<PerformanceBand, string> = {
    outstanding: "Sobresaliente",
    satisfactory: "Satisfactorio",
    atRisk: "En riesgo",
    critical: "Crítico",
};

export const BAND_CLASS: Record<PerformanceBand, string> = {
    outstanding: "bg-blue/10 text-blue",
    satisfactory: "bg-success-bg text-success",
    atRisk: "bg-warning-bg text-warning",
    critical: "bg-error-bg text-error",
};

// ---- Estados de la pantalla (textos de M5-UX, sección 6) ----
export const LOADING_TEXT = "Cargando el tablero…";
export const EMPTY_INSTITUTION_TITLE = "Todavía no hay registros en esta institución.";
export const RETRY_LABEL = "Reintentar";

// ---- Textos de error (no se muestran los mensajes técnicos de Back) ----
export const LOAD_ERROR_TEXT = "No pudimos traer el tablero.";
export const SERVER_ERROR_TEXT = "Tuvimos un problema de nuestro lado. Probá de nuevo en unos minutos.";
export const OFFLINE_TEXT = "Sin conexión a internet. Revisá tu conexión y volvé a intentar.";
export const FORBIDDEN_TEXT = "Solo la dirección y la administración pueden ver el tablero.";

// ---- Pantalla para otros roles (Back responde 403 a docentes y tutores) ----
export const NOT_ALLOWED_TITLE = "Esta pantalla es para la dirección";
export const NOT_ALLOWED_DESCRIPTION = "Con tu perfil no podés ver el tablero de la institución.";
export const NOT_ALLOWED_ACTION_LABEL = "Ir al inicio";
export const NOT_ALLOWED_ACTION_HREF = "/inicio";
