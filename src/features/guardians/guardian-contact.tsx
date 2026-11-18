import { mailtoHref } from "../students/students-rules";
import { CONTACT_LABEL, COPY_EMAIL_LABEL } from "./guardians-texts";

type GuardianContactActionsProps = {
    email: string | null;
    // Asunto del correo, por ejemplo "Consulta sobre Díaz, Tomás"
    subject: string;
    onCopyEmail: (email: string) => void;
    className: string;
};

// «Contactar» abre el correo (mailto:) y «Copiar email» sirve si no hay cliente de correo (QA-M9-03).
// Sin correo, «Contactar» queda deshabilitado; el teléfono se muestra aparte.
export function GuardianContactActions({ email, subject, onCopyEmail, className }: GuardianContactActionsProps) {
    const href = mailtoHref(email, subject);
    if (!href || !email) {
        return (
            <button type="button" disabled className={`${className} disabled:opacity-50`}>
                {CONTACT_LABEL}
            </button>
        );
    }
    return (
        <>
            <a href={href} className={className}>{CONTACT_LABEL}</a>
            <button type="button" onClick={() => onCopyEmail(email.trim())} className={className}>{COPY_EMAIL_LABEL}</button>
        </>
    );
}
