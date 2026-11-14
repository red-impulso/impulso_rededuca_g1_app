import { FORBIDDEN_TEXT, LOAD_ERROR_TEXT, OFFLINE_TEXT, SERVER_ERROR_TEXT } from "./dashboard-ui";
import type {
    DashboardCourse,
    DashboardStudent,
    DashboardSummary,
    GradeAverageRow,
    LowAttendanceRow,
} from "./types";

// Ruta y textos de la API del tablero.
// Son funciones puras (sin React ni fetch) para poder probarlas fácil.

// GET /dashboard → DashboardSummary (solo admin y director, 403 para el resto)
export const DASHBOARD_PATH = "/dashboard";

// "forbidden": Back no lo deja ver (403); se muestra la pantalla de "solo dirección", sin reintentar
export type ErrorKind = "offline" | "error" | "forbidden";

// Texto del error al cargar el tablero. status = código de la API (0 si no hubo respuesta).
export function describeLoadError(status: number | null): { kind: ErrorKind; message: string } {
    if (status === 0) return { kind: "offline", message: OFFLINE_TEXT };
    if (status === 403) return { kind: "forbidden", message: FORBIDDEN_TEXT };
    if (status !== null && status >= 500) return { kind: "error", message: SERVER_ERROR_TEXT };
    return { kind: "error", message: LOAD_ERROR_TEXT };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function stringOr(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

// Curso: si falta el objeto se deja vacío (la pantalla muestra "Curso sin nombre")
function parseCourse(value: unknown): DashboardCourse {
    if (!isRecord(value)) return { id: "", name: "" };
    return { id: stringOr(value.id, ""), name: stringOr(value.name, "") };
}

function parseStudent(value: unknown): DashboardStudent | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
    return {
        id: value.id,
        firstName: stringOr(value.firstName, ""),
        lastName: stringOr(value.lastName, ""),
    };
}

function parseLowAttendance(value: unknown): LowAttendanceRow | null {
    if (!isRecord(value) || !isFiniteNumber(value.percentage)) return null;
    const student = parseStudent(value.student);
    if (!student) return null;
    return { student, course: parseCourse(value.course), percentage: value.percentage };
}

function parseGradeAverage(value: unknown): GradeAverageRow | null {
    if (!isRecord(value) || !isRecord(value.subject)) return null;
    const { id, name } = value.subject;
    if (typeof id !== "string" || !id) return null;
    const average = isFiniteNumber(value.average) ? value.average : null;
    return {
        subject: { id, name: stringOr(name, "") },
        course: parseCourse(value.course),
        average,
    };
}

// Lista de Back → lista sin los elementos rotos. Si no es una lista, queda vacía.
function parseList<T>(value: unknown, parse: (entry: unknown) => T | null): T[] {
    if (!Array.isArray(value)) return [];
    const items: T[] = [];
    for (const entry of value) {
        const parsed = parse(entry);
        if (parsed) items.push(parsed);
    }
    return items;
}

// Respuesta de GET /dashboard. Devuelve null si faltan los totales
// (la pantalla lo trata como error). Las listas rotas quedan vacías.
export function parseDashboard(data: unknown): DashboardSummary | null {
    if (!isRecord(data)) return null;
    const { students, courses, teachers, attendanceAverage } = data;
    if (!isCount(students) || !isCount(courses) || !isCount(teachers)) return null;
    return {
        students,
        courses,
        teachers,
        attendanceAverage: isFiniteNumber(attendanceAverage) ? attendanceAverage : null,
        lowAttendance: parseList(data.lowAttendance, parseLowAttendance),
        gradeAverages: parseList(data.gradeAverages, parseGradeAverage),
    };
}
