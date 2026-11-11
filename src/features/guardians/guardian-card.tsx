import { StatusBadge } from "../../components/ui/status-badge";
import { EMPTY_VALUE } from "../school/school-texts";
import { phoneHref } from "../students/students-rules";
import { formatPhone, guardianInitials, isActiveLink, relationshipLabel, roleLabels } from "./guardians-rules";
import { CONTACT_LABEL, EDIT_GUARDIAN_LABEL, GUARDIAN_DETAIL_LABEL, GUARDIAN_FIELD_LABELS, LINK_STATUS_LABELS, MAKE_PRIMARY_LABEL, UNLINK_LABEL, otherStudentsText } from "./guardians-texts";
import type { GuardianLink } from "./types";

const STATUS_TONES = { active: "success", inactive: "neutral", pending: "warning" } as const;
export const ACTION = "inline-flex min-h-11 items-center justify-center rounded-[10px] px-3 text-sm font-semibold text-blue outline-blue/40 hover:bg-page focus-visible:outline-3 disabled:opacity-50";
export const PRIMARY_BUTTON = "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-blue px-4 font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3";

type CardProps = {
    link: GuardianLink;
    busy: boolean;
    onEdit: () => void;
    onMakePrimary: () => void;
    onUnlink: () => void;
};

export function GuardianCard({ link, busy, onEdit, onMakePrimary, onUnlink }: CardProps) {
    const call = phoneHref(link.phone);
    const contact = call ?? (link.email ? `mailto:${link.email}` : null);
    const active = isActiveLink(link);
    const roles = roleLabels(link);
    return (
        <article className={`rounded-2xl border border-line bg-surface p-4 ${active ? "" : "opacity-70"}`}>
            <div className="flex items-start gap-3">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8EEF9] font-semibold text-blue">{guardianInitials(link)}</span>
                <div className="min-w-0 flex-1">
                    <h4 className="font-semibold break-words text-ink">{link.fullName || EMPTY_VALUE}</h4>
                    <p className="text-sm text-muted">{relationshipLabel(link)}</p>
                </div>
                {link.status && <StatusBadge label={LINK_STATUS_LABELS[link.status]} tone={STATUS_TONES[link.status]} />}
            </div>
            {roles.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1" aria-label={GUARDIAN_FIELD_LABELS.roles}>
                    {roles.map((role) => (
                        <li key={role} className="rounded-full bg-page px-2 py-0.5 text-xs font-semibold text-ink">{role}</li>
                    ))}
                </ul>
            )}
            <dl className="mt-3 grid gap-1 text-sm">
                <div className="flex gap-2"><dt className="text-muted">{GUARDIAN_FIELD_LABELS.email}:</dt><dd className="min-w-0 break-all text-ink">{link.email ?? EMPTY_VALUE}</dd></div>
                <div className="flex gap-2"><dt className="text-muted">{GUARDIAN_FIELD_LABELS.phone}:</dt><dd className="text-ink">{formatPhone(link.phone)}</dd></div>
            </dl>
            <details className="mt-1 text-sm">
                <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-blue">{GUARDIAN_DETAIL_LABEL}</summary>
                <dl className="grid gap-1 pb-2">
                    <div className="flex gap-2"><dt className="text-muted">{GUARDIAN_FIELD_LABELS.dni}:</dt><dd className="text-ink">{link.dni ?? EMPTY_VALUE}</dd></div>
                    <div className="flex gap-2"><dt className="text-muted">{GUARDIAN_FIELD_LABELS.altPhone}:</dt><dd className="text-ink">{formatPhone(link.altPhone)}</dd></div>
                    <div className="flex gap-2"><dt className="text-muted">{GUARDIAN_FIELD_LABELS.address}:</dt><dd className="text-ink">{link.address ?? EMPTY_VALUE}</dd></div>
                    {link.otherStudentsCount > 0 && <p className="text-muted">{otherStudentsText(link.otherStudentsCount)}</p>}
                </dl>
            </details>
            <div className="mt-2 flex flex-wrap gap-1 border-t border-line pt-2">
                <button type="button" onClick={onEdit} className={ACTION}>{EDIT_GUARDIAN_LABEL.split(" ")[0]}</button>
                {contact ? <a href={contact} className={ACTION}>{CONTACT_LABEL}</a> : <span aria-disabled="true" className={`${ACTION} opacity-50`}>{CONTACT_LABEL}</span>}
                {active && !link.isPrimary && (
                    <button type="button" disabled={busy} onClick={onMakePrimary} className={ACTION}>{MAKE_PRIMARY_LABEL}</button>
                )}
                {active && (
                    <button type="button" disabled={busy} onClick={onUnlink} className={`${ACTION} text-error`}>{UNLINK_LABEL}</button>
                )}
            </div>
        </article>
    );
}
