import type { AttendanceStatus } from "./types";

// Tipos y lógica de la asistencia de un hijo (vista del tutor).
// No usa React ni la API, para poder probarla fácil.

// GET /students/:studentId/attendance
export type StudentAttendanceRecord = {
    // Día en formato YYYY-MM-DD
    date: string;
    status: AttendanceStatus;
};

export type StudentAttendanceSummary = {
    present: number;
    absent: number;
    late: number;
    justified: number;
    // null si todavía no hay días que cuenten (sin registros)
    percentage: number | null;
};

export type StudentAttendanceResponse = {
    records: StudentAttendanceRecord[];
    summary: StudentAttendanceSummary;
};

export const NO_RECORDS_TEXT = "Sin registros";

// Textos de error al recuperar la asistencia (provisorios: pendiente de confirmar con UX)
export const SERVER_ERROR_MESSAGE = "Error del servidor. No pudimos recuperar la asistencia.";
export const OFFLINE_ERROR_MESSAGE = "Sin conexión. No pudimos recuperar la asistencia.";

const percentFormat = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
});

// "92,5%", "100%", o "Sin registros" si Back no pudo calcularlo (null)
export function formatPercentage(percentage: number | null): string {
    return percentage === null ? NO_RECORDS_TEXT : `${percentFormat.format(percentage)}%`;
}

// "martes, 3 de noviembre de 2026" (se fija el mediodía en UTC para que la zona horaria no corra el día)
export function formatAttendanceDate(date: string): string {
    const parsed = new Date(`${date}T12:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(parsed);
}

// Del día más nuevo al más viejo (Back ya lo entrega así; se asegura acá)
export function sortNewestFirst(records: StudentAttendanceRecord[]): StudentAttendanceRecord[] {
    return [...records].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// Texto del error al pedir la asistencia.
// status = código de la API (0 si no hubo respuesta); null si el error no vino de la API.
export function describeLoadError(status: number | null, message: string): string {
    if (status === 0) return OFFLINE_ERROR_MESSAGE;
    // Rechazos de la API (por ejemplo, un hijo que no es de esta cuenta): su propio mensaje
    if (status !== null && status >= 400 && status < 500 && message) return message;
    return SERVER_ERROR_MESSAGE;
}
