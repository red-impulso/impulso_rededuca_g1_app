// Tipos de las respuestas de Back para M2 (asistencia).
// Copian la forma exacta que entrega la API; si Back la cambia, se cambia acá.

// Los cuatro estados que acepta Back
export type AttendanceStatus = "present" | "absent" | "late" | "justified";

// Orden en que se muestran los botones: P / A / T / J
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ["present", "absent", "late", "justified"];

// Letra corta de cada estado (la que va en el botón)
export const STATUS_LETTER: Record<AttendanceStatus, string> = {
    present: "P",
    absent: "A",
    late: "T",
    justified: "J",
};

// Nombre completo de cada estado (para etiquetas y lectores de pantalla)
// Textos provisorios: pendiente de confirmar con UX
export const STATUS_LABEL: Record<AttendanceStatus, string> = {
    present: "Presente",
    absent: "Ausente",
    late: "Tarde",
    justified: "Justificada",
};

// Curso que se puede elegir para tomar lista.
// GET /me/courses (docente) trae { id, year, division, shift }.
// GET /courses (admin y director) trae además "name" (por ejemplo "1.º A").
export type AttendanceCourse = {
    id: string;
    name?: string;
    year: number;
    // Pueden venir null si el curso no tiene división o turno cargado
    division: string | null;
    shift: string | null;
};

export type StudentRef = {
    id: string;
    firstName: string;
    lastName: string;
};

// GET /attendance?courseId=...&date=YYYY-MM-DD: una fila por alumno del curso.
// status es null cuando todavía no se tomó lista a ese alumno ese día.
export type AttendanceRow = {
    student: StudentRef;
    status: AttendanceStatus | null;
};

// PUT /attendance: lo que se envía. Solo se mandan los alumnos que se marcaron o cambiaron.
export type SaveAttendanceEntry = {
    studentId: string;
    status: AttendanceStatus;
};

export type SaveAttendanceBody = {
    courseId: string;
    date: string;
    entries: SaveAttendanceEntry[];
};

// Respuesta de PUT /attendance: cuántos registros se guardaron
export type SaveAttendanceResponse = {
    saved: number;
};
