import { EMPTY_VALUE } from "../school/school-texts";
import { STUDENT_STATUS_LABELS } from "./students-texts";
import type { StudentFilters, StudentSort, StudentStatus } from "./types";

type ParamsLike = { get(name: string): string | null };

export const DEFAULT_STUDENT_FILTERS: StudentFilters = {
    q: "",
    courseId: null,
    shift: null,
    status: null,
    schoolYear: null,
    sort: "last-asc",
    page: 1,
};

const STATUS_PARAMS: Record<StudentStatus, string> = { active: "activo", inactive: "inactivo", draft: "borrador" };
const SHIFT_PARAMS = { morning: "manana", afternoon: "tarde", evening: "noche" } as const;
const SORT_PARAMS: Record<StudentSort, string> = { "last-asc": "apellido", "last-desc": "apellido-desc", course: "curso", enrollment: "ingreso" };

function fromParam<T extends string>(map: Record<T, string>, value: string | null): T | null {
    const entry = Object.entries(map).find(([, param]) => param === value);
    return entry ? (entry[0] as T) : null;
}

// Filtros en la URL, en español: ?q=&curso=&turno=&estado=&anio=&orden=&pagina=
export function readStudentFilters(params: ParamsLike): StudentFilters {
    const year = Number(params.get("anio"));
    const page = Number(params.get("pagina"));
    return {
        q: params.get("q") ?? "",
        courseId: params.get("curso") || null,
        shift: fromParam(SHIFT_PARAMS, params.get("turno")),
        status: fromParam(STATUS_PARAMS, params.get("estado")),
        schoolYear: Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : null,
        sort: fromParam(SORT_PARAMS, params.get("orden")) ?? "last-asc",
        page: Number.isInteger(page) && page > 1 ? page : 1,
    };
}

export function studentFiltersQuery(filters: StudentFilters): string {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.courseId) params.set("curso", filters.courseId);
    if (filters.shift) params.set("turno", SHIFT_PARAMS[filters.shift]);
    if (filters.status) params.set("estado", STATUS_PARAMS[filters.status]);
    if (filters.schoolYear !== null) params.set("anio", String(filters.schoolYear));
    if (filters.sort !== "last-asc") params.set("orden", SORT_PARAMS[filters.sort]);
    if (filters.page > 1) params.set("pagina", String(filters.page));
    const query = params.toString();
    return query ? `?${query}` : "";
}

// Cambiar un filtro vuelve a la página 1
export function withFilter(filters: StudentFilters, change: Partial<StudentFilters>): StudentFilters {
    return { ...filters, ...change, page: change.page ?? 1 };
}

export function hasStudentFilters(filters: StudentFilters): boolean {
    return Boolean(filters.q.trim() || filters.courseId || filters.shift || filters.status || filters.schoolYear !== null);
}

// "Díaz, Tomás"
export function studentName(student: { firstName: string; lastName: string }): string {
    if (student.lastName && student.firstName) return `${student.lastName}, ${student.firstName}`;
    return student.lastName || student.firstName || EMPTY_VALUE;
}

export function studentInitial(student: { firstName: string; lastName: string }): string {
    return (student.lastName || student.firstName || "?").charAt(0).toLocaleUpperCase("es");
}

export function studentStatusLabel(status: StudentStatus | null): string {
    return status ? STUDENT_STATUS_LABELS[status] : EMPTY_VALUE;
}

// 41220118 → "41.220.118"
export function formatDni(dni: string | null): string {
    if (!dni) return EMPTY_VALUE;
    return /^\d+$/.test(dni) ? Number(dni).toLocaleString("es-AR") : dni;
}

function startOfDay(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

// Columna "Actualizado": Hoy / Ayer / 8 nov 2026
export function relativeDay(iso: string | null, now: Date = new Date()): string {
    if (!iso) return EMPTY_VALUE;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
    const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

// "2027-03-01" → "1/3/2027" sin correr el día por la zona horaria
export function formatDate(iso: string | null): string {
    if (!iso) return EMPTY_VALUE;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return EMPTY_VALUE;
    return `${Number(match[3])}/${Number(match[2])}/${match[1]}`;
}

export function percentText(value: number | null): string {
    return value === null ? EMPTY_VALUE : `${value.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
}

export function gradeText(value: number | null): string {
    return value === null ? EMPTY_VALUE : value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function countText(value: number | null): string {
    return value === null ? EMPTY_VALUE : String(value);
}

export function pageCount(total: number, limit: number): number {
    return Math.max(1, Math.ceil(total / limit));
}

// Botones de página: 1 … 4 5 6 … 50
export function pageNumbers(current: number, last: number): (number | "…")[] {
    const pages = new Set([1, last, current - 1, current, current + 1].filter((page) => page >= 1 && page <= last));
    const sorted = [...pages].sort((a, b) => a - b);
    const result: (number | "…")[] = [];
    sorted.forEach((page, index) => {
        if (index > 0 && page - sorted[index - 1] > 1) result.push("…");
        result.push(page);
    });
    return result;
}

// Solo dígitos para tel:
export function phoneHref(phone: string | null): string | null {
    if (!phone) return null;
    const digits = phone.replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : null;
}
