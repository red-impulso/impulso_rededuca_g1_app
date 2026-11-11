import { isRecord, num, orNull, parseList, text } from "../school/school-api";
import type { GuardianFormValues } from "./guardians-schemas";
import type { GuardianCandidate, GuardianLink, GuardianLinkStatus, GuardianRelationship } from "./types";

// Rutas, conversión y cuerpos de la API de M9. Funciones puras.

export const GUARDIAN_RELATIONSHIPS: GuardianRelationship[] = ["madre", "padre", "tutor-legal", "encargado", "familiar-autorizado", "otro"];

export function guardiansPath(studentId: string, includeInactive = false): string {
    const base = `/students/${encodeURIComponent(studentId)}/guardians`;
    return includeInactive ? `${base}?includeInactive=true` : base;
}

export function guardianLinkPath(studentId: string, guardianMembershipId: string): string {
    return `${guardiansPath(studentId)}/${encodeURIComponent(guardianMembershipId)}`;
}

export function makePrimaryPath(studentId: string, guardianMembershipId: string): string {
    return `${guardianLinkPath(studentId, guardianMembershipId)}/make-primary`;
}

// GET /users?role=guardian existe solo para administración (pedido a Back abrirlo a dirección)
export function guardianCandidatesPath(q: string): string {
    const params = new URLSearchParams({ role: "guardian", status: "active", limit: "20" });
    if (q.trim()) params.set("q", q.trim());
    return `/users?${params.toString()}`;
}

// Pedidos a Back: alta de la persona tutor y edición de sus datos
export const GUARDIANS_PATH = "/guardians";
export function guardianPersonPath(guardianMembershipId: string): string {
    return `${GUARDIANS_PATH}/${encodeURIComponent(guardianMembershipId)}`;
}

function isRelationship(value: unknown): value is GuardianRelationship {
    return GUARDIAN_RELATIONSHIPS.some((item) => item === value);
}

function isLinkStatus(value: unknown): value is GuardianLinkStatus {
    return value === "active" || value === "inactive" || value === "pending";
}

export function parseGuardianLink(value: unknown): GuardianLink | null {
    if (!isRecord(value) || typeof value.guardianMembershipId !== "string" || !value.guardianMembershipId) return null;
    const profile = isRecord(value.profile) ? value.profile : {};
    return {
        guardianMembershipId: value.guardianMembershipId,
        relationship: isRelationship(value.relationship) ? value.relationship : null,
        isPrimary: value.isPrimary === true,
        isEmergencyContact: value.isEmergencyContact === true,
        isFinancialResponsible: value.isFinancialResponsible === true,
        status: isLinkStatus(value.status) ? value.status : null,
        updatedAt: text(value.updatedAt),
        fullName: text(profile.fullName) ?? [text(profile.firstName), text(profile.lastName)].filter(Boolean).join(" "),
        firstName: text(profile.firstName),
        lastName: text(profile.lastName),
        dni: text(profile.dni),
        phone: text(profile.phone),
        altPhone: text(profile.altPhone),
        address: text(profile.address),
        email: text(value.email),
        otherStudentsCount: num(value.otherStudentsCount) ?? 0,
    };
}

export function parseGuardianLinks(data: unknown): GuardianLink[] | null {
    if (isRecord(data)) return parseList(data.data, parseGuardianLink);
    return parseList(data, parseGuardianLink);
}

function parseCandidate(value: unknown): GuardianCandidate | null {
    if (!isRecord(value) || typeof value.membershipId !== "string") return null;
    const profile = isRecord(value.profile) ? value.profile : {};
    return { membershipId: value.membershipId, fullName: text(profile.fullName) ?? "", dni: text(profile.dni), email: text(value.email) };
}

export function parseGuardianCandidates(data: unknown): GuardianCandidate[] | null {
    return isRecord(data) ? parseList(data.data, parseCandidate) : null;
}

export function toLinkBody(values: GuardianFormValues) {
    return {
        relationship: values.relationship,
        isEmergencyContact: values.isEmergencyContact,
        isFinancialResponsible: values.isFinancialResponsible,
    };
}

// POST /guardians y PATCH /guardians/:id (pedidos a Back)
export function toGuardianPersonBody(values: GuardianFormValues) {
    return {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        dni: values.dni.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        altPhone: orNull(values.altPhone),
        address: orNull(values.address),
    };
}
