import {
    FORBIDDEN_TEXT,
    LOAD_ERROR_TEXT,
    NOT_FOUND_TEXT,
    OFFLINE_TEXT,
    SERVER_ERROR_TEXT,
    UPDATE_ERROR_TEXT,
} from "./leads-ui";
import type { Lead, LeadFilter, LeadStatus } from "./types";

// Rutas, textos de error y conversión de las respuestas de la API de postulaciones.
// Son funciones puras (sin React ni fetch) para poder probarlas fácil.

const STATUSES: readonly LeadStatus[] = ["new", "contacted", "discarded"];

export function isLeadStatus(value: unknown): value is LeadStatus {
    return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

// GET /leads?status=new (sin status = todas), de la más nueva a la más vieja
export function leadsPath(filter: LeadFilter): string {
    return filter === "all" ? "/leads" : `/leads?status=${filter}`;
}

// PATCH /leads/:id { status } → la postulación actualizada
export function leadPath(id: string): string {
    return `/leads/${encodeURIComponent(id)}`;
}

export type ErrorKind = "offline" | "error";

// Error al traer la lista. status = código de la API (0 si no hubo respuesta).
export function describeLoadError(status: number | null): { kind: ErrorKind; message: string } {
    if (status === 0) return { kind: "offline", message: OFFLINE_TEXT };
    if (status === 403) return { kind: "error", message: FORBIDDEN_TEXT };
    if (status !== null && status >= 500) return { kind: "error", message: SERVER_ERROR_TEXT };
    return { kind: "error", message: LOAD_ERROR_TEXT };
}

// Error al cambiar el estado
export function describeUpdateError(status: number | null): { kind: ErrorKind; message: string } {
    if (status === 0) return { kind: "offline", message: OFFLINE_TEXT };
    if (status === 403) return { kind: "error", message: FORBIDDEN_TEXT };
    if (status === 404) return { kind: "error", message: NOT_FOUND_TEXT };
    if (status !== null && status >= 500) return { kind: "error", message: SERVER_ERROR_TEXT };
    return { kind: "error", message: UPDATE_ERROR_TEXT };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOr(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

// Una postulación de Back. Devuelve null si falta el id o el estado.
export function parseLead(value: unknown): Lead | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
    if (!isLeadStatus(value.status)) return null;
    const comment = typeof value.comment === "string" && value.comment.trim() ? value.comment : null;
    return {
        id: value.id,
        institutionName: stringOr(value.institutionName, ""),
        contactName: stringOr(value.contactName, ""),
        city: stringOr(value.city, ""),
        contactRole: stringOr(value.contactRole, ""),
        level: stringOr(value.level, ""),
        contactChannel: stringOr(value.contactChannel, ""),
        studentCount: typeof value.studentCount === "number" ? value.studentCount : 0,
        comment,
        status: value.status,
        createdAt: stringOr(value.createdAt, ""),
    };
}

// Lista de Back → lista sin los elementos rotos. Si no es una lista, devuelve null (error).
export function parseLeads(data: unknown): Lead[] | null {
    if (!Array.isArray(data)) return null;
    const leads: Lead[] = [];
    for (const entry of data) {
        const lead = parseLead(entry);
        if (lead) leads.push(lead);
    }
    return leads;
}
