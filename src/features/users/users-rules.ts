import type { Role } from "../session/types";
import { LAST_ACCESS_LABELS, NEVER_TEXT, USER_ROLE_LABELS, USER_STATUS_LABELS } from "./users-texts";
import type { LastAccessFilter, UserFilters, UserRow, UserStatus } from "./types";

type ParamsLike = { get(name: string): string | null };

export const DEFAULT_USER_FILTERS: UserFilters = { q: "", role: null, status: null, lastAccess: null, page: 1 };

// Parámetros en español (?rol=docente&estado=activo, SDD 8.2)
const ROLE_PARAMS: Record<Role, string> = { admin: "administrativo", director: "directivo", teacher: "docente", guardian: "tutor" };
const STATUS_PARAMS: Record<UserStatus, string> = { active: "activo", inactive: "inactivo", pending: "pendiente", blocked: "bloqueado" };
const ACCESS_PARAMS: Record<LastAccessFilter, string> = { today: "hoy", "7d": "7-dias", "30d": "30-dias", "90d+": "mas-90-dias", never: "nunca" };

function fromParam<T extends string>(map: Record<T, string>, value: string | null): T | null {
    const entry = Object.entries(map).find(([, param]) => param === value);
    return entry ? (entry[0] as T) : null;
}

export function readUserFilters(params: ParamsLike): UserFilters {
    const page = Number(params.get("pagina"));
    return {
        q: params.get("q") ?? "",
        role: fromParam(ROLE_PARAMS, params.get("rol")),
        status: fromParam(STATUS_PARAMS, params.get("estado")),
        lastAccess: fromParam(ACCESS_PARAMS, params.get("acceso")),
        page: Number.isInteger(page) && page > 1 ? page : 1,
    };
}

export function userFiltersQuery(filters: UserFilters): string {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.role) params.set("rol", ROLE_PARAMS[filters.role]);
    if (filters.status) params.set("estado", STATUS_PARAMS[filters.status]);
    if (filters.lastAccess) params.set("acceso", ACCESS_PARAMS[filters.lastAccess]);
    if (filters.page > 1) params.set("pagina", String(filters.page));
    const query = params.toString();
    return query ? `?${query}` : "";
}

export function withUserFilter(filters: UserFilters, change: Partial<UserFilters>): UserFilters {
    return { ...filters, ...change, page: change.page ?? 1 };
}

export function hasUserFilters(filters: UserFilters): boolean {
    return Boolean(filters.q.trim() || filters.role || filters.status || filters.lastAccess);
}

// Chips de filtros aplicados, quitables de a uno
export function filterChips(filters: UserFilters): { key: keyof UserFilters; label: string }[] {
    const chips: { key: keyof UserFilters; label: string }[] = [];
    if (filters.role) chips.push({ key: "role", label: USER_ROLE_LABELS[filters.role] });
    if (filters.status) chips.push({ key: "status", label: USER_STATUS_LABELS[filters.status] });
    if (filters.lastAccess) chips.push({ key: "lastAccess", label: LAST_ACCESS_LABELS[filters.lastAccess] });
    return chips;
}

// "hace 5 min", "ayer", "Nunca"
export function lastAccessText(iso: string | null, now: Date = new Date()): string {
    if (!iso) return NEVER_TEXT;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return NEVER_TEXT;
    const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
    if (minutes < 1) return "recién";
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "ayer";
    if (days < 30) return `hace ${days} días`;
    return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function userInitials(user: Pick<UserRow, "fullName">): string {
    return (user.fullName || "?").trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toLocaleUpperCase("es")).join("");
}

// Nivel de acceso (barra de 4 segmentos: Lectura, Edición, Administración, Total)
export function accessLevel(role: Role): 1 | 2 | 3 | 4 {
    return role === "admin" ? 4 : role === "director" ? 3 : role === "teacher" ? 2 : 1;
}

// Permisos de M10 (SDD 8.8) con los roles de Back: solo Administración entra; Back exige admin en /users
export type Capability = "users:read" | "users:write" | "users:change-role" | "users:reset-password" | "users:deactivate";
export function can(role: Role, capability: Capability): boolean {
    void capability;
    return role === "admin";
}

// No se puede dejar la escuela sin administrador
export function isLastAdmin(user: UserRow, rows: UserRow[]): boolean {
    if (user.role !== "admin" || user.status !== "active") return false;
    return rows.filter((row) => row.role === "admin" && row.status === "active").length <= 1;
}
