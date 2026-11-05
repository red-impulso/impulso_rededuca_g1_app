import {
    BADGE_MAX,
    DESTINATION_BY_TITLE,
    JUST_NOW_LABEL,
    NOTIFICATIONS_HREF,
    TODAY_LABEL,
    YESTERDAY_LABEL,
    hoursAgoText,
    minutesAgoText,
} from "./notifications-ui";
import type { NotificationGroup, NotificationItem } from "./types";

// Reglas y lógica de notificaciones.
// No usa React ni la API, para poder probarla fácil.

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Texto del contador de la campanita: "" (sin contador), "1"…"99" o "99+"
export function badgeText(count: number): string {
    if (!Number.isFinite(count) || count <= 0) return "";
    if (count > BADGE_MAX) return `${BADGE_MAX}+`;
    return String(Math.floor(count));
}

export function isUnread(item: NotificationItem): boolean {
    return item.readAt === null;
}

export function countUnread(items: NotificationItem[]): number {
    return items.filter(isUnread).length;
}

// Partes de una fecha con la hora de Argentina
function argentinaParts(date: Date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: ARGENTINA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

// Día con la hora de Argentina, "YYYY-MM-DD". "" si la fecha no es válida.
export function dayInArgentina(date: Date): string {
    if (Number.isNaN(date.getTime())) return "";
    const { year, month, day } = argentinaParts(date);
    return `${year}-${month}-${day}`;
}

// Día anterior a un "YYYY-MM-DD" (Argentina no tiene horario de verano: alcanza con restar un día)
function previousDay(day: string): string {
    const date = new Date(`${day}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
}

// "4 nov 2026" a partir de "2026-11-04"
function dayLabel(day: string): string {
    const [year, month, date] = day.split("-");
    return `${Number(date)} ${MONTHS[Number(month) - 1] ?? ""} ${year}`;
}

// Agrupa por día (Hoy, Ayer o la fecha), respetando el orden que manda Back
// (de la más nueva a la más vieja). Las fechas inválidas se saltean.
export function groupByDay(items: NotificationItem[], now: Date = new Date()): NotificationGroup[] {
    const today = dayInArgentina(now);
    const yesterday = previousDay(today);
    const groups: NotificationGroup[] = [];
    for (const item of items) {
        const day = dayInArgentina(new Date(item.createdAt));
        if (!day) continue;
        let group = groups.find((existing) => existing.day === day);
        if (!group) {
            const label = day === today ? TODAY_LABEL : day === yesterday ? YESTERDAY_LABEL : dayLabel(day);
            group = { day, label, items: [] };
            groups.push(group);
        }
        group.items.push(item);
    }
    return groups;
}

// Cuándo llegó: "Recién", "Hace 5 minutos", "Hace 2 horas" si es de hoy;
// si es de otro día, la hora "14:30" (el día ya lo dice el grupo). "" si la fecha no es válida.
export function timeAgo(iso: string, now: Date = new Date()): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const elapsed = now.getTime() - date.getTime();
    // Un reloj adelantado puede dar una fecha futura: se toma como recién llegada
    if (elapsed < MINUTE) return JUST_NOW_LABEL;
    if (dayInArgentina(date) === dayInArgentina(now)) {
        if (elapsed < HOUR) return minutesAgoText(Math.floor(elapsed / MINUTE));
        return hoursAgoText(Math.floor(elapsed / HOUR));
    }
    const { hour, minute } = argentinaParts(date);
    return `${hour}:${minute}`;
}

// A dónde lleva una notificación al tocarla. Título desconocido → la bandeja.
export function notificationHref(item: NotificationItem): string {
    return DESTINATION_BY_TITLE[item.title.trim()] ?? NOTIFICATIONS_HREF;
}

// Lista con una notificación marcada como leída (para actualizar la pantalla sin esperar a Back)
export function markOneAsRead(items: NotificationItem[], id: string, readAt: string): NotificationItem[] {
    return items.map((item) => (item.id === id && isUnread(item) ? { ...item, readAt } : item));
}

// Lista con todas las notificaciones marcadas como leídas
export function markAllAsRead(items: NotificationItem[], readAt: string): NotificationItem[] {
    return items.map((item) => (isUnread(item) ? { ...item, readAt } : item));
}

// Vuelve a dejar como no leídas las de esos ids (si Back no pudo marcarlas)
export function restoreUnread(items: NotificationItem[], ids: string[]): NotificationItem[] {
    const restore = new Set(ids);
    return items.map((item) => (restore.has(item.id) ? { ...item, readAt: null } : item));
}

// Contador después de sumar o restar (nunca menos de 0, siempre entero)
export function adjustCount(count: number, delta: number): number {
    const next = Math.floor(count + delta);
    return Number.isFinite(next) && next > 0 ? next : 0;
}
