import {
    NO_COURSE_NAME_LABEL,
    NO_GRADES_TEXT,
    NO_RECORDS_TEXT,
    NO_STUDENT_NAME_LABEL,
    NO_SUBJECT_NAME_LABEL,
} from "./dashboard-ui";
import type { Role } from "@/features/session/types";
import type { DashboardCourse, DashboardStudent, DashboardSummary, PerformanceBand } from "./types";

// Reglas del tablero de dirección (M5). Funciones puras para poder probarlas fácil.
// Formato es-AR del diseño: 1.847, 94%, 7,4.

// Rangos de M5-UX, sección 8 (supuesto a definir con Dirección): si cambian, se tocan solo acá
export const OUTSTANDING_AVERAGE = 9;
export const SATISFACTORY_AVERAGE = 7;
export const AT_RISK_AVERAGE = 6;

const countFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

const percentFormat = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
});

const averageFormat = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

// 1847 → "1.847"
export function formatCount(value: number): string {
    return countFormat.format(value);
}

// 92.5 → "92,5%"; null → "Sin registros"
export function formatPercentage(value: number | null): string {
    return value === null ? NO_RECORDS_TEXT : `${percentFormat.format(value)}%`;
}

// 7.45 → "7,5"; 7 → "7,0"; null → "Sin notas"
export function formatAverage(value: number | null): string {
    return value === null ? NO_GRADES_TEXT : averageFormat.format(value);
}

// Sobresaliente 9 a 10; satisfactorio 7 a 8,9; en riesgo 6 a 6,9; crítico menos de 6
export function getPerformanceBand(average: number): PerformanceBand {
    if (average >= OUTSTANDING_AVERAGE) return "outstanding";
    if (average >= SATISFACTORY_AVERAGE) return "satisfactory";
    if (average >= AT_RISK_AVERAGE) return "atRisk";
    return "critical";
}

// "Apellido, Nombre" (como en las planillas); si no hay nombre, el texto de UX
export function studentName(student: DashboardStudent): string {
    const lastName = student.lastName.trim();
    const firstName = student.firstName.trim();
    if (lastName && firstName) return `${lastName}, ${firstName}`;
    return lastName || firstName || NO_STUDENT_NAME_LABEL;
}

export function courseName(course: DashboardCourse): string {
    return course.name.trim() || NO_COURSE_NAME_LABEL;
}

export function subjectName(subject: { name: string }): string {
    return subject.name.trim() || NO_SUBJECT_NAME_LABEL;
}

// Institución sin estudiantes, cursos ni docentes (M5-UX: "Todavía no hay registros")
export function isInstitutionEmpty(summary: DashboardSummary): boolean {
    return summary.students === 0 && summary.courses === 0 && summary.teachers === 0;
}

// Solo admin y director ven el tablero (GET /dashboard responde 403 al resto)
export function canSeeDashboard(role: Role): boolean {
    return role === "admin" || role === "director";
}
