import { announcementCourseName, authorLabel, formatDate, scopeLabel } from "./announcements-rules";
import { SCOPE_BADGE_CLASS } from "./announcements-ui";
import type { Announcement } from "./types";

type AnnouncementCardProps = {
    announcement: Announcement;
};

// Tarjeta de un comunicado: título, a quién va dirigido, texto completo, autoría y fecha.
// El texto se muestra siempre como TEXTO (React lo escapa): nunca se interpreta como HTML.
// Los saltos de línea se respetan con whitespace-pre-line.
// Diseño provisorio: pendiente de confirmar con UX (colores y textos en announcements-ui.ts).
export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    const date = formatDate(announcement.createdAt);
    // Para un comunicado de curso se muestra el nombre del curso; el alcance va siempre en texto
    const courseName = announcement.scope === "course" ? announcementCourseName(announcement) : null;

    return (
        <li className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="min-w-0 break-words text-base font-semibold text-ink">
                    {announcement.title}
                </h2>
                <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${SCOPE_BADGE_CLASS[announcement.scope]}`}
                >
                    <span className="sr-only">Para: </span>
                    {courseName ?? scopeLabel(announcement)}
                </span>
            </div>

            <p className="mt-2 whitespace-pre-line break-words text-sm text-ink">{announcement.body}</p>

            <p className="mt-3 text-xs text-muted">
                {authorLabel(announcement)}
                {date && (
                    <>
                        {" · "}
                        <time dateTime={announcement.createdAt}>{date}</time>
                    </>
                )}
            </p>
        </li>
    );
}
