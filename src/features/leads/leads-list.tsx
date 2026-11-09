import { contactLink, formatLeadDate, formatStudentCount, nextStatuses } from "./leads-rules";
import {
    ACTIONS_COLUMN,
    COMMENT_LABEL,
    CONTACT_COLUMN,
    DATE_COLUMN,
    EMAIL_LABEL,
    INSTITUTION_COLUMN,
    LEVEL_COLUMN,
    STATUS_ACTIONS,
    STATUS_CLASS,
    STATUS_COLUMN,
    STATUS_LABELS,
    STUDENTS_COLUMN,
    STUDENTS_SUFFIX,
    UPDATING_TEXT,
    WHATSAPP_LABEL,
} from "./leads-ui";
import type { Lead, LeadStatus } from "./types";

type LeadsListProps = {
    leads: Lead[];
    // Postulaciones que se están guardando
    pendingIds: string[];
    onChangeStatus: (lead: Lead, status: LeadStatus) => void;
};

// Estado con texto, nunca solo color
function StatusBadge({ status }: { status: LeadStatus }) {
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}>
            {STATUS_LABELS[status]}
        </span>
    );
}

// Nombre, rol y medio de contacto (WhatsApp si es teléfono, mailto si es email)
function Contact({ lead }: { lead: Lead }) {
    const link = contactLink(lead.contactChannel);
    return (
        <div className="min-w-0 text-sm">
            <p className="font-semibold text-ink">{lead.contactName}</p>
            <p className="text-muted">{lead.contactRole}</p>
            {link ? (
                <a
                    href={link.href}
                    {...(link.kind === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex min-h-11 items-center break-all font-semibold text-brand underline outline-blue/40 focus-visible:outline-3"
                >
                    {link.kind === "whatsapp" ? WHATSAPP_LABEL : EMAIL_LABEL}: {lead.contactChannel}
                </a>
            ) : (
                <p className="break-all text-muted">{lead.contactChannel}</p>
            )}
        </div>
    );
}

// Botones para pasar a los otros dos estados
function StatusActions({ lead, busy, onChangeStatus }: { lead: Lead; busy: boolean } & Pick<LeadsListProps, "onChangeStatus">) {
    return (
        <div className="flex flex-wrap gap-2">
            {nextStatuses(lead.status).map((status) => (
                <button
                    key={status}
                    type="button"
                    disabled={busy}
                    onClick={() => onChangeStatus(lead, status)}
                    aria-label={`${STATUS_ACTIONS[status]}: ${lead.institutionName}`}
                    className="h-11 rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-ink outline-blue/40 focus-visible:outline-3 disabled:opacity-60"
                >
                    {STATUS_ACTIONS[status]}
                </button>
            ))}
            {busy && (
                <span role="status" className="self-center text-xs font-semibold text-muted">
                    {UPDATING_TEXT}
                </span>
            )}
        </div>
    );
}

// Postulaciones de la landing: tarjetas en celular y tabla en computadora
export function LeadsList({ leads, pendingIds, onChangeStatus }: LeadsListProps) {
    return (
        <>
            {/* Celular: una tarjeta por postulación */}
            <ul className="flex flex-col gap-3 lg:hidden">
                {leads.map((lead) => {
                    const busy = pendingIds.includes(lead.id);
                    return (
                        <li key={lead.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="break-words font-semibold text-ink">{lead.institutionName}</p>
                                    <p className="text-sm text-muted">
                                        {lead.city} · {lead.level} · {formatStudentCount(lead.studentCount)} {STUDENTS_SUFFIX}
                                    </p>
                                </div>
                                <StatusBadge status={lead.status} />
                            </div>
                            <Contact lead={lead} />
                            {lead.comment && (
                                <p className="break-words text-sm text-muted">
                                    <span className="font-semibold text-ink">{COMMENT_LABEL}:</span> {lead.comment}
                                </p>
                            )}
                            <p className="text-xs text-muted">{formatLeadDate(lead.createdAt)}</p>
                            <StatusActions lead={lead} busy={busy} onChangeStatus={onChangeStatus} />
                        </li>
                    );
                })}
            </ul>

            {/* Computadora: tabla */}
            <div className="hidden overflow-auto rounded-2xl border border-line bg-surface lg:block">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            {[INSTITUTION_COLUMN, LEVEL_COLUMN, STUDENTS_COLUMN, CONTACT_COLUMN, DATE_COLUMN, STATUS_COLUMN, ACTIONS_COLUMN].map(
                                (column) => (
                                    <th key={column} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">
                                        {column}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr key={lead.id} className="border-t border-line align-top">
                                <th scope="row" className="max-w-64 px-4 py-3 text-left font-normal">
                                    <p className="break-words font-semibold text-ink">{lead.institutionName}</p>
                                    <p className="text-muted">{lead.city}</p>
                                    {lead.comment && <p className="mt-1 break-words text-xs text-muted">{lead.comment}</p>}
                                </th>
                                <td className="px-4 py-3 text-muted">{lead.level}</td>
                                <td className="px-4 py-3 text-ink">{formatStudentCount(lead.studentCount)}</td>
                                <td className="max-w-64 px-4 py-3">
                                    <Contact lead={lead} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted">{formatLeadDate(lead.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={lead.status} />
                                </td>
                                <td className="px-4 py-3">
                                    <StatusActions lead={lead} busy={pendingIds.includes(lead.id)} onChangeStatus={onChangeStatus} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
