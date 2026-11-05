import { NotificationCard } from "./notification-card";
import { groupByDay } from "./notifications-rules";
import type { NotificationItem } from "./types";

type NotificationsListProps = {
    items: NotificationItem[];
    now: Date;
    // Ids que se están marcando como leídas
    pendingIds: string[];
    // true mientras se vuelve a pedir la lista
    refreshing: boolean;
    onOpen: (item: NotificationItem) => void;
    onMarkRead: (item: NotificationItem) => void;
};

// Bandeja agrupada por día (Hoy, Ayer o la fecha), en el orden que manda Back
export function NotificationsList({ items, now, pendingIds, refreshing, onOpen, onMarkRead }: NotificationsListProps) {
    const groups = groupByDay(items, now);

    return (
        <div aria-busy={refreshing} className="flex max-w-3xl flex-col gap-6">
            {groups.map((group) => (
                <section key={group.day} aria-labelledby={`notificaciones-${group.day}`}>
                    <h2 id={`notificaciones-${group.day}`} className="mb-2 text-sm font-semibold text-muted">
                        {group.label}
                    </h2>
                    <ul className="flex flex-col gap-3">
                        {group.items.map((item) => (
                            <NotificationCard
                                key={item.id}
                                item={item}
                                now={now}
                                pending={pendingIds.includes(item.id)}
                                onOpen={onOpen}
                                onMarkRead={onMarkRead}
                            />
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
