import Link from "next/link";
import { BellIcon } from "./bell-icon";
import { badgeText } from "./notifications-rules";
import { BADGE_CLASS, BELL_ACTIVE_CLASS, BELL_CLASS, NOTIFICATIONS_HREF, bellAriaLabel } from "./notifications-ui";

type NotificationBellLinkProps = {
    // null mientras no llegó el contador (no se muestra número)
    count: number | null;
    // true si ya se está en la bandeja
    active: boolean;
};

// Campanita del header: enlace a la bandeja con el contador de no leídas (tope "99+").
// El nombre accesible dice cuántas hay ("Notificaciones, 3 sin leer"): no depende del color.
// Diseño provisorio: pendiente de confirmar con UX (clases y textos en notifications-ui.ts).
export function NotificationBellLink({ count, active }: NotificationBellLinkProps) {
    const unread = count ?? 0;
    const badge = badgeText(unread);

    return (
        <Link
            href={NOTIFICATIONS_HREF}
            aria-label={bellAriaLabel(unread)}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg outline-blue/40 focus-visible:outline-3 ${
                active ? BELL_ACTIVE_CLASS : BELL_CLASS
            }`}
        >
            <BellIcon />
            {badge && (
                <span
                    aria-hidden="true"
                    className={`absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs leading-none font-semibold ${BADGE_CLASS}`}
                >
                    {badge}
                </span>
            )}
        </Link>
    );
}
