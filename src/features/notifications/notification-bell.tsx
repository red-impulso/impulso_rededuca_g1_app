"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { NotificationBellLink } from "./notification-bell-link";
import { NotificationsDrawer } from "./notifications-drawer";
import { DRAWER_MEDIA_QUERY, NOTIFICATIONS_HREF } from "./notifications-ui";
import { useUnreadCount } from "./use-unread-count";

// Campanita con datos: el contador lo comparte NotificationsProvider (layout del panel)
// y se vuelve a pedir en cada cambio de pantalla.
// En computadora abre la bandeja en un panel lateral; en celular lleva a /notificaciones.
export function NotificationBell() {
    const pathname = usePathname();
    const { count } = useUnreadCount();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const onInbox = pathname === NOTIFICATIONS_HREF;

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        // Ctrl/Cmd + clic abre la pantalla en otra pestaña como cualquier enlace
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (onInbox || !window.matchMedia(DRAWER_MEDIA_QUERY).matches) return;
        event.preventDefault();
        setDrawerOpen(true);
    }

    return (
        <>
            <NotificationBellLink count={count} active={onInbox} onClick={handleClick} />
            <NotificationsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    );
}
