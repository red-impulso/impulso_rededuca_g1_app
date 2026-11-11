import { isRecordStatus, isShift, parseCourseName } from "./school-rules";
import type { CourseFormValues, SchoolFormValues, SubjectFormValues } from "./school-schemas";
import { FORBIDDEN_TEXT, NOT_FOUND_TEXT, OFFLINE_TEXT, SERVER_ERROR_TEXT } from "./school-texts";
import type {
    Course,
    CourseAssignment,
    CourseRef,
    PersonRef,
    School,
    StudentsPreview,
    Subject,
} from "./types";

// Rutas, conversión de respuestas y cuerpos de la API de M6. Funciones puras (sin React ni fetch).

// GET /institution (pedido a Back) y PATCH /institution
export const INSTITUTION_PATH = "/institution";
// PUT /institution/logo, multipart con el campo "file" (pedido a Back)
export const INSTITUTION_LOGO_PATH = "/institution/logo";
// GET y POST /courses
export const COURSES_PATH = "/courses";
// Docentes activos para elegir tutor responsable o docente de una materia
export const TEACHER_OPTIONS_PATH = "/teachers?status=activo&limit=100";

const enc = encodeURIComponent;

// PATCH y DELETE /courses/:id
export function coursePath(id: string): string {
    return `/courses/${enc(id)}`;
}

// GET /courses/:id/assignments → materias del curso con su docente
export function courseAssignmentsPath(id: string): string {
    return `/courses/${enc(id)}/assignments`;
}

// GET /students?courseId=&limit= → total y primeros alumnos (Back ordena por apellido)
export function courseStudentsPath(id: string, limit = 3): string {
    return `/students?courseId=${enc(id)}&limit=${limit}`;
}

// GET /subjects (todas) o /subjects?courseId= (las de un curso); POST /subjects
export function subjectsPath(courseId: string | null = null): string {
    return courseId ? `/subjects?courseId=${enc(courseId)}` : "/subjects";
}

// PATCH y DELETE /subjects/:id
export function subjectPath(id: string): string {
    return `/subjects/${enc(id)}`;
}

// PUT /subjects/:id/teacher { teacherMembershipId | null }
export function subjectTeacherPath(id: string): string {
    return `/subjects/${enc(id)}/teacher`;
}

// ---- Errores ----

export type ErrorKind = "offline" | "error";
export type ErrorInfo = { kind: ErrorKind; message: string };

// Texto para Lautaro y el equipo cuando la ruta todavía no existe en Back
export const PENDING_ENDPOINT_TEXT = "Esta función todavía no está disponible en el servidor.";

// Error de la API → texto para mostrar. status = código (0 sin respuesta, null si no fue de la API).
// 400 y 409 usan el mensaje de Back (viene en español).
export function describeApiError(status: number | null, message: string, fallback: string): ErrorInfo {
    if (status === 0) return { kind: "offline", message: OFFLINE_TEXT };
    if (status === 403) return { kind: "error", message: FORBIDDEN_TEXT };
    if (status === 404) {
        // Nest responde "Cannot GET /ruta" cuando la ruta no existe
        return { kind: "error", message: message.startsWith("Cannot ") ? PENDING_ENDPOINT_TEXT : NOT_FOUND_TEXT };
    }
    if ((status === 400 || status === 409) && message) return { kind: "error", message };
    if (status !== null && status >= 500) return { kind: "error", message: SERVER_ERROR_TEXT };
    return { kind: "error", message: fallback };
}

// ---- Conversión de respuestas ----

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function text(value: unknown): string | null {
    return typeof value === "string" && value.trim() ? value : null;
}

export function num(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseList<T>(data: unknown, parse: (value: unknown) => T | null): T[] | null {
    if (!Array.isArray(data)) return null;
    const items: T[] = [];
    for (const entry of data) {
        const item = parse(entry);
        if (item) items.push(item);
    }
    return items;
}

export function parsePerson(value: unknown): PersonRef | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
    return { id: value.id, fullName: text(value.fullName) };
}

export function parseSchool(value: unknown): School | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id || typeof value.name !== "string") return null;
    const levels = Array.isArray(value.levels) ? value.levels.filter((item) => typeof item === "string") : [];
    return {
        id: value.id,
        name: value.name,
        code: text(value.code),
        // Back hoy guarda "levels" (lista); la pantalla usa un solo nivel
        level: text(value.level) ?? text(levels[0]),
        address: text(value.address),
        city: text(value.city),
        province: text(value.province),
        phone: text(value.phone),
        email: text(value.email),
        website: text(value.website),
        schoolYear: num(value.schoolYear),
        schedule: text(value.schedule),
        familyCommunications: value.familyCommunications === true,
        dailyAttendance: value.dailyAttendance === true,
        logoUrl: text(value.logoUrl),
        updatedAt: text(value.updatedAt),
    };
}

export function parseCourseRef(value: unknown): CourseRef | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
    return {
        id: value.id,
        name: text(value.name) ?? "",
        year: num(value.year),
        division: text(value.division),
        shift: isShift(value.shift) ? value.shift : null,
        schoolYear: num(value.schoolYear),
    };
}

export function parseCourse(value: unknown): Course | null {
    const ref = parseCourseRef(value);
    if (!ref || !isRecord(value)) return null;
    return {
        ...ref,
        classroom: text(value.classroom),
        status: isRecordStatus(value.status) ? value.status : null,
        studentsCount: num(value.studentsCount),
        homeroomTeacher: parsePerson(value.homeroomTeacher),
    };
}

// GET /courses → lista sin los elementos rotos; si no es una lista → null (error)
export function parseCourses(data: unknown): Course[] | null {
    return parseList(data, parseCourse);
}

export function parseSubject(value: unknown): Subject | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id || typeof value.name !== "string") return null;
    return {
        id: value.id,
        name: value.name,
        course: parseCourseRef(value.course),
        teacher: parsePerson(value.teacher),
        weeklyHours: num(value.weeklyHours),
        description: text(value.description),
        status: isRecordStatus(value.status) ? value.status : null,
        studentsCount: num(value.studentsCount),
        updatedAt: text(value.updatedAt),
    };
}

export function parseSubjects(data: unknown): Subject[] | null {
    return parseList(data, parseSubject);
}

function parseAssignment(value: unknown): CourseAssignment | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id || typeof value.name !== "string") return null;
    return { id: value.id, name: value.name, weeklyHours: num(value.weeklyHours), teacher: parsePerson(value.teacher) };
}

// GET /courses/:id/assignments → { course, subjects }
export function parseCourseAssignments(data: unknown): { course: CourseRef; subjects: CourseAssignment[] } | null {
    if (!isRecord(data)) return null;
    const course = parseCourseRef(data.course);
    const subjects = parseList(data.subjects, parseAssignment);
    return course && subjects ? { course, subjects } : null;
}

// GET /students?courseId=&limit= → { total, lastNames }
export function parseStudentsPreview(data: unknown): StudentsPreview | null {
    if (!isRecord(data) || !Array.isArray(data.data)) return null;
    const lastNames = data.data
        .map((student) => (isRecord(student) ? text(student.lastName) : null))
        .filter((name): name is string => name !== null);
    return { total: num(data.total) ?? lastNames.length, lastNames };
}

// GET /teachers → [{ id, fullName }] para los selects
export function parseTeacherOptions(data: unknown): PersonRef[] | null {
    if (!isRecord(data)) return null;
    return parseList(data.data, parsePerson);
}

// ---- Cuerpos para la API ----

export function orNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

// PATCH /institution. name, address y levels ya existen en Back; el resto está pedido.
export function toSchoolBody(values: SchoolFormValues) {
    const schedule = orNull(values.schedule)?.replace(/\s*[–-]\s*/, " – ") ?? null;
    return {
        name: values.name.trim(),
        code: orNull(values.code),
        level: orNull(values.level),
        levels: values.level ? [values.level] : [],
        address: values.address.trim(),
        city: orNull(values.city),
        province: orNull(values.province),
        phone: orNull(values.phone),
        email: orNull(values.email),
        website: orNull(values.website),
        schoolYear: Number(values.schoolYear),
        schedule,
        familyCommunications: values.familyCommunications,
        dailyAttendance: values.dailyAttendance,
    };
}

// POST /courses y PATCH /courses/:id. classroom, homeroomTeacherMembershipId y status están pedidos a Back.
// El nombre "5° Año A" se convierte en año y división (Back arma su propio nombre).
export function toCourseBody(values: CourseFormValues) {
    const key = parseCourseName(values.name);
    return {
        year: key?.year,
        division: key?.division,
        shift: values.shift,
        schoolYear: Number(values.schoolYear),
        classroom: orNull(values.classroom),
        homeroomTeacherMembershipId: values.homeroomTeacherId || null,
        status: values.status,
    };
}

// POST /subjects y PATCH /subjects/:id. weeklyHours, description y status están pedidos a Back.
export function toSubjectBody(values: SubjectFormValues) {
    return {
        courseId: values.courseId,
        name: values.name.trim(),
        teacherMembershipId: values.teacherId || null,
        weeklyHours: values.weeklyHours.trim() ? Number(values.weeklyHours) : null,
        description: orNull(values.description),
        status: values.status,
    };
}
