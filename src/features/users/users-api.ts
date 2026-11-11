import type { Role } from "../session/types";
import { isRecord, num, parseList, text } from "../school/school-api";
import type { UserFilters, UserPage, UserRow, UserStatus } from "./types";

// Rutas, conversión y cuerpos de la API de M10. Funciones puras.

export const USERS_PATH = "/users";
export const USERS_PAGE_SIZE = 25;
export const ROLES: Role[] = ["admin", "director", "teacher", "guardian"];
const STATUSES: UserStatus[] = ["active", "inactive", "pending", "blocked"];

// La búsqueda ignora puntos y espacios del documento (SDD 8.2)
export function normalizeQuery(q: string): string {
    const trimmed = q.trim();
    return /^[\d.\s]+$/.test(trimmed) ? trimmed.replace(/[.\s]/g, "") : trimmed;
}

// q, role, status, page y limit existen; lastAccess está pedido a Back
export function usersListPath(filters: UserFilters): string {
    const params = new URLSearchParams();
    const q = normalizeQuery(filters.q);
    if (q) params.set("q", q);
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    if (filters.lastAccess) params.set("lastAccess", filters.lastAccess);
    params.set("page", String(filters.page));
    params.set("limit", String(USERS_PAGE_SIZE));
    return `${USERS_PATH}?${params.toString()}`;
}

export function membershipPath(id: string): string {
    return `/memberships/${encodeURIComponent(id)}`;
}

// Pedidos a Back
export const USER_COUNTS_PATH = `${USERS_PATH}/counts`;
export function userPath(userId: string): string {
    return `${USERS_PATH}/${encodeURIComponent(userId)}`;
}
export function resetPasswordPath(userId: string): string {
    return `${userPath(userId)}/reset-password`;
}
export function reactivatePath(membershipId: string): string {
    return `${membershipPath(membershipId)}/reactivate`;
}
export function usersExportPath(ids: string[]): string {
    const params = new URLSearchParams({ format: "csv" });
    if (ids.length) params.set("membershipIds", ids.join(","));
    return `${USERS_PATH}/export?${params.toString()}`;
}

function isRole(value: unknown): value is Role {
    return ROLES.includes(value as Role);
}

export function parseUserRow(value: unknown): UserRow | null {
    if (!isRecord(value) || typeof value.membershipId !== "string" || !isRole(value.role)) return null;
    const profile = isRecord(value.profile) ? value.profile : {};
    const firstName = text(profile.firstName);
    const lastName = text(profile.lastName);
    return {
        membershipId: value.membershipId,
        userId: text(value.userId) ?? "",
        role: value.role,
        status: STATUSES.includes(value.status as UserStatus) ? (value.status as UserStatus) : null,
        fullName: text(profile.fullName) ?? [firstName, lastName].filter(Boolean).join(" "),
        firstName,
        lastName,
        dni: text(profile.dni),
        phone: text(profile.phone),
        email: text(value.email),
        lastAccess: text(value.lastAccess),
        createdAt: text(value.createdAt),
    };
}

export function parseUserPage(data: unknown): UserPage | null {
    if (!isRecord(data)) return null;
    const list = parseList(data.data, parseUserRow);
    if (!list) return null;
    return { data: list, total: num(data.total) ?? list.length, page: num(data.page) ?? 1, limit: num(data.limit) ?? USERS_PAGE_SIZE };
}

export function parseUserCounts(data: unknown): Record<"all" | UserStatus, number> | null {
    if (!isRecord(data) || num(data.all) === null) return null;
    return { all: num(data.all) ?? 0, active: num(data.active) ?? 0, pending: num(data.pending) ?? 0, blocked: num(data.blocked) ?? 0, inactive: num(data.inactive) ?? 0 };
}
