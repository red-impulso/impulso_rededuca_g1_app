import Link from "next/link";
import { isUnread, notificationHref, timeAgo } from "./notifications-rules";
import {
    DELETE_BUTTON_CLASS,
    DELETE_LABEL,
    DELETING_LABEL,
    MARKING_LABEL,
    MARK_ONE_LABEL,
    READ_CARD_CLASS,
    UNREAD_CARD_CLASS,
    UNREAD_DOT_CLASS,
    UNREAD_LABEL,
    UNREAD_TEXT_CLASS,
} from "./notifications-ui";
import type { NotificationItem } from "./types";

type NotificationCardProps = {
    item: NotificationItem;
    // Hora de referencia para "Hace X minutos"
    now: Date;
    // true mientras se está marcando como leída
    pending: boolean;
    // Al tocar la notificación (antes de ir a su pantalla)
    onOpen: (item: NotificationItem) => void;
    onMarkRead: (item: NotificationItem) => void;
    // Eliminar la notificación. Si no se pasa, no se muestra el botón.
    onDelete?: (item: NotificationItem) => void;
    // true mientras se está eliminando
    deleting?: boolean;
};

// Tarjeta de una notificación: título, texto, cuándo llegó y si está sin leer.
// Tocarla lleva a su pantalla; "Marcar leída" la marca sin salir de la bandeja.
// El texto se muestra siempre como TEXTO (React lo escapa): nunca se interpreta como HTML.
// Diseño provisorio: pendiente de confirmar con UX (colores y textos en notifications-ui.ts).
export function NotificationCard({
    item,
    now,
    pending,
    onOpen,
    onMarkRead,
    onDelete,
    deleting = false,
}: NotificationCardProps) {
    const unread = isUnread(item);
    const when = timeAgo(item.createdAt, now);

    return (
        <li
            className={`flex flex-col gap-2 rounded-2xl border border-line p-4 sm:flex-row sm:items-start ${
                unread ? UNREAD_CARD_CLASS : READ_CARD_CLASS
            }`}
        >
            <Link
                href={notificationHref(item)}
                onClick={() => onOpen(item)}
                className="block min-h-11 min-w-0 flex-1 rounded-lg outline-blue/40 focus-visible:outline-3"
            >
                <span className="block break-words font-semibold text-ink">{item.title}</span>
                {item.body && (
                    <span className="mt-1 block whitespace-pre-line break-words text-sm text-ink">
                        {item.body}
                    </span>
                )}
                <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    {when && <time dateTime={item.createdAt}>{when}</time>}
                    {unread && (
                        <span className={`inline-flex items-center gap-1.5 font-semibold ${UNREAD_TEXT_CLASS}`}>
                            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${UNREAD_DOT_CLASS}`} />
                            {UNREAD_LABEL}
                        </span>
                    )}
                </span>
            </Link>

            {(unread || onDelete) && (
            <div className="flex shrink-0 flex-wrap gap-2 self-start">
                {unread && (
                    <button
                        type="button"
                        onClick={() => onMarkRead(item)}
                        disabled={pending}
                        className={`h-11 rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 ${UNREAD_TEXT_CLASS}`}
                    >
                        {pending ? MARKING_LABEL : MARK_ONE_LABEL}
                    </button>
                )}
                {onDelete && (
                    <button
                        type="button"
                        onClick={() => onDelete(item)}
                        disabled={deleting}
                        aria-label={`${DELETE_LABEL} notificación: ${item.title}`}
                        className={`h-11 rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60 ${DELETE_BUTTON_CLASS}`}
                    >
                        {deleting ? DELETING_LABEL : DELETE_LABEL}
                    </button>
                )}
            </div>
            )}
        </li>
    );
}
