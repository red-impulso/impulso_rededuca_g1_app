import { EMPTY_VALUE } from "../school/school-texts";
import { EMPLOYMENT_LABELS, NEAR_LIMIT_TEXT, OVER_LIMIT_TEXT, TEACHER_STATUS_LABELS } from "./teachers-texts";
import type { AssignmentRow, Availability, EmploymentStatus, TeacherCandidate, TeacherFilters, TeacherSort, TeacherStatus } from "./types";

type ParamsLike = { get(name: string): string | null };

export const DEFAULT_TEACHER_FILTERS: TeacherFilters = { q: "", status: null, employmentStatus: null, subjectId: null, courseId: null, shift: null, sort: "name", page: 1 };

const SHIFT_PARAMS = { morning: "manana", afternoon: "tarde", evening: "noche" } as const;
const SORT_PARAMS: Record<TeacherSort, string> = { name: "apellido", "file-number": "legajo", hours: "carga" };

function fromParam<T extends string>(map: Record<T, string>, value: string | null): T | null {
    const entry = Object.entries(map).find(([, param]) => param === value);
    return entry ? (entry[0] as T) : null;
}

const STATUSES: TeacherStatus[] = ["activo", "licencia", "inactivo"];
const EMPLOYMENTS: EmploymentStatus[] = ["titular", "interino", "suplente"];

// ?q=&estado=&revista=&materia=&curso=&turno=&orden=&pagina=
export function readTeacherFilters(params: ParamsLike): TeacherFilters {
    const page = Number(params.get("pagina"));
    return {
        q: params.get("q") ?? "",
        status: STATUSES.find((item) => item === params.get("estado")) ?? null,
        employmentStatus: EMPLOYMENTS.find((item) => item === params.get("revista")) ?? null,
        subjectId: params.get("materia") || null,
        courseId: params.get("curso") || null,
        shift: fromParam(SHIFT_PARAMS, params.get("turno")),
        sort: fromParam(SORT_PARAMS, params.get("orden")) ?? "name",
        page: Number.isInteger(page) && page > 1 ? page : 1,
    };
}

export function teacherFiltersQuery(filters: TeacherFilters): string {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.status) params.set("estado", filters.status);
    if (filters.employmentStatus) params.set("revista", filters.employmentStatus);
    if (filters.subjectId) params.set("materia", filters.subjectId);
    if (filters.courseId) params.set("curso", filters.courseId);
    if (filters.shift) params.set("turno", SHIFT_PARAMS[filters.shift]);
    if (filters.sort !== "name") params.set("orden", SORT_PARAMS[filters.sort]);
    if (filters.page > 1) params.set("pagina", String(filters.page));
    const query = params.toString();
    return query ? `?${query}` : "";
}

export function withTeacherFilter(filters: TeacherFilters, change: Partial<TeacherFilters>): TeacherFilters {
    return { ...filters, ...change, page: change.page ?? 1 };
}

export function hasTeacherFilters(filters: TeacherFilters): boolean {
    return Boolean(filters.q.trim() || filters.status || filters.employmentStatus || filters.subjectId || filters.courseId || filters.shift);
}

export function teacherStatusLabel(status: TeacherStatus | null): string {
    return status ? TEACHER_STATUS_LABELS[status] : EMPTY_VALUE;
}

export function employmentLabel(status: EmploymentStatus | null): string {
    return status ? EMPLOYMENT_LABELS[status] : EMPTY_VALUE;
}

export function teacherInitials(fullName: string): string {
    const parts = (fullName || "?").trim().split(/\s+/);
    return parts.slice(0, 2).map((part) => part.charAt(0).toLocaleUpperCase("es")).join("");
}

// Medidor de carga: texto además del color (SDD 7.4). Cerca del límite = 90% o más.
export type LoadLevel = "ok" | "near" | "over";
export function loadLevel(hours: number, max: number): LoadLevel {
    if (max > 0 && hours > max) return "over";
    if (max > 0 && hours >= max * 0.9) return "near";
    return "ok";
}
export function loadLevelText(level: LoadLevel): string | null {
    return level === "over" ? OVER_LIMIT_TEXT : level === "near" ? NEAR_LIMIT_TEXT : null;
}

// Disponibilidad de un candidato para una materia de `subjectHours` horas
export function availability(candidate: TeacherCandidate, subjectHours: number, extraHours = 0): Availability {
    if (candidate.status === "inactivo") return "unavailable";
    if (candidate.conflict) return "conflict";
    if (candidate.weeklyHours + extraHours + subjectHours > candidate.maxWeeklyHours) return "over-limit";
    return "available";
}

// Cambios acumulados en la asignación: subjectId → docente nuevo (null = sin docente)
export type PendingChanges = Record<string, { id: string; fullName: string | null } | null>;

export function applyChanges(rows: AssignmentRow[], changes: PendingChanges): (AssignmentRow & { changed: boolean })[] {
    return rows.map((row) => (row.subjectId in changes ? { ...row, teacher: changes[row.subjectId], changed: (changes[row.subjectId]?.id ?? null) !== (row.teacher?.id ?? null) } : { ...row, changed: false }));
}

export function changedCount(rows: AssignmentRow[], changes: PendingChanges): number {
    return applyChanges(rows, changes).filter((row) => row.changed).length;
}

// Horas que los cambios sin guardar suman o restan a cada docente
export function pendingHoursFor(teacherId: string, rows: AssignmentRow[], changes: PendingChanges): number {
    let hours = 0;
    for (const row of rows) {
        if (!(row.subjectId in changes)) continue;
        const next = changes[row.subjectId]?.id ?? null;
        const prev = row.teacher?.id ?? null;
        if (next === prev) continue;
        if (next === teacherId) hours += row.weeklyHours;
        if (prev === teacherId) hours -= row.weeklyHours;
    }
    return hours;
}

export function assignmentSummary(rows: (AssignmentRow & { changed: boolean })[]) {
    const assigned = rows.filter((row) => row.teacher).length;
    return { subjects: rows.length, assigned, unassigned: rows.length - assigned };
}

export function seniorityText(seniority: { years: number; months: number } | null): string {
    if (!seniority) return EMPTY_VALUE;
    const years = seniority.years === 1 ? "1 año" : `${seniority.years} años`;
    const months = seniority.months === 1 ? "1 mes" : `${seniority.months} meses`;
    return seniority.months ? `${years} y ${months}` : years;
}

export function toCsv(rows: string[][]): string {
    return rows.map((row) => row.map((cell) => (/[",\n;]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(",")).join("\n");
}
