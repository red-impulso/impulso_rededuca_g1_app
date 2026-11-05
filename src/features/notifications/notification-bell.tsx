"use client";

import { usePathname } from "next/navigation";
import { NotificationBellLink } from "./notification-bell-link";
import { NOTIFICATIONS_HREF } from "./notifications-ui";
import { useUnreadCount } from "./use-unread-count";

// Campanita con datos: el contador lo comparte NotificationsProvider (layout del panel)
// y se vuelve a pedir en cada cambio de pantalla.
export function NotificationBell() {
    const pathname = usePathname();
    const { count } = useUnreadCount();
    return <NotificationBellLink count={count} active={pathname === NOTIFICATIONS_HREF} />;
}
