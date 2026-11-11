import { EMPTY_VALUE } from "../school/school-texts";
import { RELATIONSHIP_LABELS, ROLE_LABELS } from "./guardians-texts";
import type { GuardianGroups, GuardianLink } from "./types";

export function isActiveLink(link: GuardianLink): boolean {
    return link.status !== "inactive";
}

// Principal, secundario (el siguiente activo) y otros contactos; los inactivos van a "otros"
export function groupGuardians(links: GuardianLink[], showInactive: boolean): GuardianGroups {
    const visible = links.filter((link) => showInactive || isActiveLink(link));
    const primary = visible.filter((link) => link.isPrimary && isActiveLink(link));
    const rest = visible.filter((link) => !primary.includes(link));
    const secondaryIndex = rest.findIndex(isActiveLink);
    const secondary = secondaryIndex >= 0 ? [rest[secondaryIndex]] : [];
    return { primary, secondary, others: rest.filter((_, index) => index !== secondaryIndex) };
}

export function relationshipLabel(link: GuardianLink): string {
    return link.relationship ? RELATIONSHIP_LABELS[link.relationship] : EMPTY_VALUE;
}

export function roleLabels(link: GuardianLink): string[] {
    const roles: string[] = [];
    if (link.isPrimary) roles.push(ROLE_LABELS.isPrimary);
    if (link.isEmergencyContact) roles.push(ROLE_LABELS.isEmergencyContact);
    if (link.isFinancialResponsible) roles.push(ROLE_LABELS.isFinancialResponsible);
    return roles;
}

export function guardianInitials(link: GuardianLink): string {
    const parts = (link.fullName || "?").trim().split(/\s+/);
    return parts.slice(0, 2).map((part) => part.charAt(0).toLocaleUpperCase("es")).join("");
}

// Reglas de desvincular (SDD M9): el único principal no se desvincula sin elegir otro
export type UnlinkRule = { kind: "free" } | { kind: "choose-primary"; options: GuardianLink[] } | { kind: "blocked" };

export function unlinkRule(link: GuardianLink, links: GuardianLink[]): UnlinkRule {
    if (!link.isPrimary || !isActiveLink(link)) return { kind: "free" };
    const options = links.filter((other) => other.guardianMembershipId !== link.guardianMembershipId && isActiveLink(other));
    return options.length ? { kind: "choose-primary", options } : { kind: "blocked" };
}

// "3884123456" → "388 412-3456"
export function formatPhone(phone: string | null): string {
    if (!phone) return EMPTY_VALUE;
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}` : phone;
}
