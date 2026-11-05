"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import {
    READ_ALL_PATH,
    describeMarkAllError,
    describeMarkError,
    markReadPath,
} from "./notifications-api";
import type { ErrorKind } from "./notifications-api";
import { isUnread, markAllAsRead, markOneAsRead, restoreUnread } from "./notifications-rules";
import type { NotificationItem } from "./types";
import type { UpdateNotifications } from "./use-notifications";
import { useUnreadCount } from "./use-unread-count";

// null = se ignoró (ya estaba leída o ya se estaba marcando)
export type MarkResult = { ok: true } | { ok: false; kind: ErrorKind; message: string } | null;

// Marca como leídas una o todas. Primero cambia la pantalla y el contador (sin esperar a Back);
// si Back falla, vuelve atrás. Al final siempre pide el contador real a Back.
export function useMarkNotifications(update: UpdateNotifications) {
    const { adjust, setCount, refresh } = useUnreadCount();
    // Ids que se están marcando y si se están marcando todas (para mostrar "Marcando…")
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    const [markingAll, setMarkingAll] = useState(false);
    // Evitan mandar dos veces lo mismo con un doble toque (el estado de React llega tarde; la ref no)
    const busyIds = useRef(new Set<string>());
    const busyAll = useRef(false);

    const markOne = useCallback(
        async (item: NotificationItem): Promise<MarkResult> => {
            if (!isUnread(item) || busyIds.current.has(item.id)) return null;
            busyIds.current.add(item.id);
            setPendingIds((ids) => [...ids, item.id]);
            update((items) => markOneAsRead(items, item.id, new Date().toISOString()));
            adjust(-1);
            try {
                await apiFetch<unknown>(markReadPath(item.id), { method: "POST" });
                return { ok: true };
            } catch (error) {
                const status = error instanceof ApiError ? error.status : null;
                update((items) => restoreUnread(items, [item.id]));
                return { ok: false, ...describeMarkError(status) };
            } finally {
                busyIds.current.delete(item.id);
                setPendingIds((ids) => ids.filter((id) => id !== item.id));
                refresh();
            }
        },
        [update, adjust, refresh],
    );

    const markAll = useCallback(
        async (items: NotificationItem[]): Promise<MarkResult> => {
            const unreadIds = items.filter(isUnread).map((item) => item.id);
            if (busyAll.current || unreadIds.length === 0) return null;
            busyAll.current = true;
            setMarkingAll(true);
            update((current) => markAllAsRead(current, new Date().toISOString()));
            setCount(0);
            try {
                await apiFetch<unknown>(READ_ALL_PATH, { method: "POST" });
                return { ok: true };
            } catch (error) {
                const status = error instanceof ApiError ? error.status : null;
                update((current) => restoreUnread(current, unreadIds));
                return { ok: false, ...describeMarkAllError(status) };
            } finally {
                busyAll.current = false;
                setMarkingAll(false);
                refresh();
            }
        },
        [update, setCount, refresh],
    );

    return { markOne, markAll, pendingIds, markingAll };
}
