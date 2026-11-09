import type { ContactLink, Lead, LeadFilter, LeadStatus } from "./types";
import type { Role } from "../session/types";

// Reglas de la pantalla "Interesados" (BONUS-4). Funciones puras para poder probarlas fácil.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Solo admin ve las postulaciones (GET /leads responde 403 al resto)
export function canSeeLeads(role: Role): boolean {
    return role === "admin";
}

// Número argentino para wa.me: 549 + característica + número, sin 0 ni +.
// "388 400-0000" → "5493884000000"; "+54 9 388 400-0000" → "5493884000000"
export function whatsappNumber(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("549")) return digits;
    if (digits.startsWith("54")) return `549${digits.slice(2)}`;
    return `549${digits.replace(/^0/, "")}`;
}

// Email → mailto:; teléfono (8 a 15 dígitos) → WhatsApp; si no es ninguno, sin link
export function contactLink(channel: string): ContactLink | null {
    const value = channel.trim();
    if (EMAIL_RE.test(value)) return { kind: "email", href: `mailto:${value}` };
    const digits = value.replace(/\D/g, "");
    if (/^\+?[\d\s()-]+$/.test(value) && digits.length >= 8 && digits.length <= 15) {
        return { kind: "whatsapp", href: `https://wa.me/${whatsappNumber(value)}` };
    }
    return null;
}

const dateFormat = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
});

// "2026-11-08T22:30:00Z" → "8 nov 2026" (hora de Argentina); fecha inválida → ""
export function formatLeadDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}

const countFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

// 1500 → "1.500"
export function formatStudentCount(value: number): string {
    return countFormat.format(value);
}

// Estados a los que se puede pasar desde el actual (los otros dos)
export function nextStatuses(status: LeadStatus): LeadStatus[] {
    const order: LeadStatus[] = ["contacted", "discarded", "new"];
    return order.filter((value) => value !== status);
}

// Después de cambiar el estado: si ya no coincide con el filtro, sale de la lista
export function applyStatusChange(leads: Lead[], updated: Lead, filter: LeadFilter): Lead[] {
    if (filter !== "all" && updated.status !== filter) {
        return leads.filter((lead) => lead.id !== updated.id);
    }
    return leads.map((lead) => (lead.id === updated.id ? updated : lead));
}
