import {
    LOAD_ERROR_TEXT,
    MARK_ALL_ERROR_MESSAGE,
    MARK_ALL_OFFLINE_MESSAGE,
    MARK_ERROR_MESSAGE,
    MARK_NOT_FOUND_MESSAGE,
    MARK_OFFLINE_MESSAGE,
    OFFLINE_TEXT,
    SERVER_ERROR_TEXT,
} from "./notifications-ui";
import type { NotificationItem } from "./types";

// Rutas y textos de la API de notificaciones.
// Son funciones puras (sin React ni fetch) para poder probarlas fácil.

// GET /notifications (últimas 50)
export const NOTIFICATIONS_PATH = "/notifications";
// GET /notifications/unread-count → { count }
export const UNREAD_COUNT_PATH = "/notifications/unread-count";
// POST /notifications/read-all → { updated }
export const READ_ALL_PATH = "/notifications/read-all";

// POST /notifications/:id/read → { success: true } (404 si no es del usuario)
export function markReadPath(id: string): string {
    return `/notifications/${encodeURIComponent(id)}/read`;
}

export type ErrorKind = "offline" | "error";

// Texto del error al cargar la bandeja. status = código de la API (0 si no hubo respuesta).
// Los mensajes de Back son técnicos: no se muestran, se usan los propios.
export function describeLoadError(status: number | null): { kind: ErrorKind; message: string } {
    if (status === 0) return { kind: "offline", message: OFFLINE_TEXT };
    if (status !== null && status >= 500) return { kind: "error", message: SERVER_ERROR_TEXT };
    return { kind: "error", message: LOAD_ERROR_TEXT };
}

// Texto del error al marcar una como leída
export function describeMarkError(status: number | null): { kind: ErrorKind; message: string } {
    if (status === 0) return { kind: "offline", message: MARK_OFFLINE_MESSAGE };
    if (status === 404) return { kind: "error", message: MARK_NOT_FOUND_MESSAGE };
    return { kind: "error", message: MARK_ERROR_MESSAGE };
}

// Texto del error al marcar todas como leídas
export function describeMarkAllError(status: number | null): { kind: ErrorKind; message: string } {
    if (status === 0) return { kind: "offline", message: MARK_ALL_OFFLINE_MESSAGE };
    return { kind: "error", message: MARK_ALL_ERROR_MESSAGE };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Convierte un elemento de GET /notifications, o null si le faltan los datos básicos
function parseNotification(value: unknown): NotificationItem | null {
    if (!isRecord(value)) return null;
    const { id, title, body, readAt, createdAt } = value;
    if (typeof id !== "string" || !id) return null;
    if (typeof title !== "string" || typeof createdAt !== "string") return null;
    return {
        id,
        title,
        // Si falta el cuerpo se muestra solo el título
        body: typeof body === "string" ? body : "",
        readAt: typeof readAt === "string" && readAt ? readAt : null,
        createdAt,
    };
}

// Respuesta de GET /notifications → lista. Devuelve null si no es una lista
// (la pantalla lo trata como error). Los elementos rotos se saltean.
export function parseNotifications(data: unknown): NotificationItem[] | null {
    if (!Array.isArray(data)) return null;
    const items: NotificationItem[] = [];
    for (const entry of data) {
        const parsed = parseNotification(entry);
        if (parsed) items.push(parsed);
    }
    return items;
}

// Entero mayor o igual a 0, o null
function countOrNull(value: unknown): number | null {
    return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

// Respuesta de GET /notifications/unread-count → cantidad, o null si no tiene la forma esperada
export function parseUnreadCount(data: unknown): number | null {
    return isRecord(data) ? countOrNull(data.count) : null;
}

// Respuesta de POST /notifications/read-all → cuántas marcó, o null si no tiene la forma esperada
export function parseReadAll(data: unknown): number | null {
    return isRecord(data) ? countOrNull(data.updated) : null;
}

// Respuesta de POST /notifications/:id/read → true si Back confirmó
export function parseMarkRead(data: unknown): boolean {
    return isRecord(data) && data.success === true;
}
