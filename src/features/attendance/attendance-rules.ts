import type {
    AttendanceCourse,
    AttendanceRow,
    AttendanceStatus,
    SaveAttendanceEntry,
    StudentRef,
} from "./types";
import { ATTENDANCE_STATUSES } from "./types";

// Reglas y lógica de la planilla de asistencia.
// No usa React ni la API, para poder probarla fácil.

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

// Fecha de "hoy" (YYYY-MM-DD) con la hora de Argentina, no la de UTC:
// a las 22:00 en Jujuy, en UTC ya es el día siguiente.
export function todayInArgentina(now: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: ARGENTINA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}`;
}

// true si la fecha es posterior a hoy (Back no deja tomar lista a fechas futuras)
export function isFutureDate(date: string, today: string): boolean {
    return date > today;
}

// Nombre del curso: el "name" de Back si viene; si no, "1.º A" (o "1.º" sin división)
export function courseLabel(course: AttendanceCourse): string {
    if (course.name) return course.name;
    return course.division ? `${course.year}.º ${course.division}` : `${course.year}.º`;
}

// "Apellido, Nombre"
export function studentFullName(student: StudentRef): string {
    return `${student.lastName}, ${student.firstName}`;
}

// Solo guarda lo que el docente tocó: studentId → estado elegido.
// Si no hay entrada para un alumno, se muestra el estado que vino de Back.
export type AttendanceDrafts = Record<string, AttendanceStatus>;

// Estado que se muestra de un alumno (lo que eligió el docente o lo que vino de Back)
export function getStatus(row: AttendanceRow, drafts: AttendanceDrafts): AttendanceStatus | null {
    return drafts[row.student.id] ?? row.status;
}

// Marca un estado. Si queda igual a lo guardado, deja de contar como cambio.
export function setStatus(
    drafts: AttendanceDrafts,
    row: AttendanceRow,
    status: AttendanceStatus,
): AttendanceDrafts {
    const next = { ...drafts };
    if (status === row.status) {
        delete next[row.student.id];
    } else {
        next[row.student.id] = status;
    }
    return next;
}

// "Todos presentes": solo completa a los que todavía no tienen estado.
// A quien ya está marcado (ausente, tarde...) no se lo pisa.
export function markAllPresent(rows: AttendanceRow[], drafts: AttendanceDrafts): AttendanceDrafts {
    let next = drafts;
    for (const row of rows) {
        if (getStatus(row, next) === null) {
            next = setStatus(next, row, "present");
        }
    }
    return next;
}

// Cantidad de alumnos con cambios sin guardar
export function countChanges(rows: AttendanceRow[], drafts: AttendanceDrafts): number {
    return rows.filter((row) => row.student.id in drafts).length;
}

// Lo que se envía a Back: solo los alumnos marcados o cambiados.
// Mandar solo lo que cambió evita avisar de nuevo a los tutores de ausentes ya guardados.
export function buildEntries(rows: AttendanceRow[], drafts: AttendanceDrafts): SaveAttendanceEntry[] {
    const entries: SaveAttendanceEntry[] = [];
    for (const row of rows) {
        const status = drafts[row.student.id];
        if (status) entries.push({ studentId: row.student.id, status });
    }
    return entries;
}

export type AttendanceCounts = Record<AttendanceStatus, number> & {
    // Alumnos a los que todavía no se les tomó lista
    unmarked: number;
};

// Resumen de la planilla tal como se ve en pantalla (incluye lo no guardado)
export function summarizeAttendance(rows: AttendanceRow[], drafts: AttendanceDrafts): AttendanceCounts {
    const counts: AttendanceCounts = { present: 0, absent: 0, late: 0, justified: 0, unmarked: 0 };
    for (const row of rows) {
        const status = getStatus(row, drafts);
        if (status) {
            counts[status] += 1;
        } else {
            counts.unmarked += 1;
        }
    }
    return counts;
}

// Después de guardar: lo que se envió pasa a ser lo vigente, sin volver a pedirlo a Back
export function applySaved(rows: AttendanceRow[], drafts: AttendanceDrafts): AttendanceRow[] {
    return rows.map((row) => ({ ...row, status: getStatus(row, drafts) }));
}

// true si el valor que llegó de Back es uno de los cuatro estados conocidos
export function isAttendanceStatus(value: unknown): value is AttendanceStatus {
    return ATTENDANCE_STATUSES.includes(value as AttendanceStatus);
}
