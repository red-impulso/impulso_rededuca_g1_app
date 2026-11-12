import { isRecord, num, parseList, text } from "../school/school-api";
import type {
    AssignmentRow,
    EmploymentStatus,
    ScheduleBlock,
    TeacherCandidate,
    TeacherCourse,
    TeacherDetail,
    TeacherFilters,
    TeacherPage,
    TeacherStatus,
    TeacherSubject,
    TeacherSummary,
} from "./types";

// Rutas, conversión y cuerpos de la API de M8. Funciones puras.

export const TEACHERS_PATH = "/teachers";
export const TEACHERS_PAGE_SIZE = 25;
export const DEFAULT_MAX_HOURS = 30;
const SORT_PARAM = { name: "name", "file-number": "fileNumber", hours: "-weeklyHours" } as const;

// q, status, employmentStatus, courseId, subjectId, page y limit ya existen
export function teachersListPath(filters: TeacherFilters): string {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.status) params.set("status", filters.status);
    if (filters.employmentStatus) params.set("employmentStatus", filters.employmentStatus);
    if (filters.subjectId) params.set("subjectId", filters.subjectId);
    if (filters.courseId) params.set("courseId", filters.courseId);
    if (filters.shift) params.set("shift", filters.shift);
    if (filters.sort !== "name") params.set("sort", SORT_PARAM[filters.sort]);
    params.set("page", String(filters.page));
    params.set("limit", String(TEACHERS_PAGE_SIZE));
    return `${TEACHERS_PATH}?${params.toString()}`;
}

export function teacherPath(id: string): string {
    return `${TEACHERS_PATH}/${encodeURIComponent(id)}`;
}

// Pedidos a Back
export const TEACHER_COUNTS_PATH = `${TEACHERS_PATH}/counts`;
export const TEACHERS_IMPORT_PATH = `${TEACHERS_PATH}/import`;
export function teachersExportPath(ids: string[]): string {
    const params = new URLSearchParams({ format: "csv" });
    if (ids.length) params.set("ids", ids.join(","));
    return `${TEACHERS_PATH}/export?${params.toString()}`;
}
export function teacherActivityPath(id: string): string {
    return `${teacherPath(id)}/activity?limit=10`;
}
export function candidatesPath(courseId: string, subjectId: string): string {
    return `${TEACHERS_PATH}/candidates?${new URLSearchParams({ courseId, subjectId }).toString()}`;
}
export function courseAssignmentsSavePath(courseId: string): string {
    return `/courses/${encodeURIComponent(courseId)}/assignments`;
}

export function isTeacherStatus(value: unknown): value is TeacherStatus {
    return value === "activo" || value === "licencia" || value === "inactivo";
}

export function isEmploymentStatus(value: unknown): value is EmploymentStatus {
    return value === "titular" || value === "interino" || value === "suplente";
}

function parseCourse(value: unknown): TeacherCourse | null {
    if (!isRecord(value) || typeof value.id !== "string") return null;
    const shift = value.shift === "morning" || value.shift === "afternoon" || value.shift === "evening" ? value.shift : null;
    return { id: value.id, name: text(value.name) ?? "", year: num(value.year), division: text(value.division), shift, schoolYear: num(value.schoolYear) };
}

function parseSubject(value: unknown): TeacherSubject | null {
    if (!isRecord(value) || typeof value.id !== "string") return null;
    return { id: value.id, name: text(value.name) ?? "", weeklyHours: num(value.weeklyHours) ?? 0, course: parseCourse(value.course) };
}

export function parseTeacherSummary(value: unknown): TeacherSummary | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
    return {
        id: value.id,
        fullName: text(value.fullName) ?? "",
        email: text(value.email),
        phone: text(value.phone),
        fileNumber: text(value.fileNumber),
        employmentStatus: isEmploymentStatus(value.employmentStatus) ? value.employmentStatus : null,
        status: isTeacherStatus(value.status) ? value.status : null,
        coursesCount: num(value.coursesCount) ?? 0,
        subjects: parseList(value.subjects, parseSubject) ?? [],
        weeklyHours: num(value.weeklyHours) ?? 0,
        maxWeeklyHours: num(value.maxWeeklyHours) ?? DEFAULT_MAX_HOURS,
    };
}

export function parseTeacherPage(data: unknown): TeacherPage | null {
    if (!isRecord(data)) return null;
    const list = parseList(data.data, parseTeacherSummary);
    if (!list) return null;
    return { data: list, total: num(data.total) ?? list.length, page: num(data.page) ?? 1, limit: num(data.limit) ?? TEACHERS_PAGE_SIZE };
}

function parseBlock(value: unknown): ScheduleBlock | null {
    if (!isRecord(value)) return null;
    const day = num(value.day);
    if (day === null || day < 1 || day > 5 || !text(value.start) || !text(value.end)) return null;
    // Back envía subjectName/courseName; se aceptan los nombres cortos por compatibilidad
    return { day: day as ScheduleBlock["day"], start: value.start as string, end: value.end as string, subject: text(value.subjectName) ?? text(value.subject) ?? "", course: text(value.courseName) ?? text(value.course) ?? "" };
}

export function parseTeacherDetail(data: unknown): TeacherDetail | null {
    const summary = parseTeacherSummary(data);
    if (!summary || !isRecord(data)) return null;
    const kpis = isRecord(data.kpis) ? data.kpis : {};
    const seniority = isRecord(data.seniority) && num(data.seniority.years) !== null ? { years: num(data.seniority.years) ?? 0, months: num(data.seniority.months) ?? 0 } : null;
    return {
        id: summary.id,
        fullName: summary.fullName,
        email: summary.email,
        phone: summary.phone,
        fileNumber: summary.fileNumber,
        employmentStatus: summary.employmentStatus,
        status: summary.status,
        hiredAt: text(data.hiredAt),
        seniority,
        kpis: {
            weeklyHours: num(kpis.weeklyHours) ?? 0,
            maxWeeklyHours: num(kpis.maxWeeklyHours) ?? DEFAULT_MAX_HOURS,
            subjectsCount: num(kpis.subjectsCount) ?? summary.subjects.length,
            coursesCount: num(kpis.coursesCount) ?? 0,
            studentsReached: num(kpis.studentsReached) ?? 0,
        },
        subjects: summary.subjects,
        schedule: parseList(data.schedule, parseBlock) ?? [],
    };
}

export function parseTeacherCounts(data: unknown): Record<"all" | TeacherStatus, number> | null {
    if (!isRecord(data)) return null;
    const all = num(data.all);
    if (all === null) return null;
    return { all, activo: num(data.activo) ?? 0, licencia: num(data.licencia) ?? 0, inactivo: num(data.inactivo) ?? 0 };
}

const NON_SCHEDULE_CONFLICTS = ["El docente está inactivo", "El docente está de licencia", "Supera el límite de horas semanales"];

function parseCandidate(value: unknown): TeacherCandidate | null {
    const summary = parseTeacherSummary(value);
    if (!summary || !isRecord(value)) return null;
    // Back manda en `conflict` también estado y límite: esos los calcula el Front, acá solo queda el choque de horario
    const raw = typeof value.conflict === "string" ? value.conflict : isRecord(value.conflict) ? [text(value.conflict.subject), text(value.conflict.course), text(value.conflict.when)].filter(Boolean).join(" · ") : null;
    const conflict = raw && !NON_SCHEDULE_CONFLICTS.includes(raw) ? raw : null;
    return { id: summary.id, fullName: summary.fullName, status: summary.status, weeklyHours: summary.weeklyHours, maxWeeklyHours: summary.maxWeeklyHours, conflict: conflict || null };
}

export function parseCandidates(data: unknown): TeacherCandidate[] | null {
    return isRecord(data) ? parseList(data.data, parseCandidate) : parseList(data, parseCandidate);
}

export function parseAssignmentRows(data: unknown): AssignmentRow[] | null {
    if (!isRecord(data) || !Array.isArray(data.subjects)) return null;
    return parseList(data.subjects, (value) => {
        if (!isRecord(value) || typeof value.id !== "string") return null;
        const teacher = isRecord(value.teacher) && typeof value.teacher.id === "string" ? { id: value.teacher.id, fullName: text(value.teacher.fullName) } : null;
        return { subjectId: value.id, subjectName: text(value.name) ?? "", weeklyHours: num(value.weeklyHours) ?? 0, teacher };
    });
}
