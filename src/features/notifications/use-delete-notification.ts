"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { deletePath, describeDeleteError } from "./notifications-api";
import type { ErrorKind } from "./notifications-api";
import { isUnread, removeNotification, restoreNotification } from "./notifications-rules";
import type { NotificationItem } from "./types";
import type { UpdateNotifications } from "./use-notifications";
import { useUnreadCount } from "./use-unread-count";

// null = se ignoró (ya se estaba eliminando)
export type DeleteResult = { ok: true } | { ok: false; kind: ErrorKind; message: string } | null;

// Elimina una notificación. Primero la saca de la pantalla (y del contador si estaba sin leer)
// sin esperar a Back; si Back falla, la vuelve a poner. Si Back dice 404 (ya no existe), queda
// eliminada. Al final siempre pide el contador real a Back.
export function useDeleteNotification(update: UpdateNotifications) {
    const { adjust, refresh } = useUnreadCount();
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    // Evita mandar dos veces lo mismo con un doble toque (el estado de React llega tarde; la ref no)
    const busyIds = useRef(new Set<string>());

    const remove = useCallback(
        async (item: NotificationItem): Promise<DeleteResult> => {
            if (busyIds.current.has(item.id)) return null;
            busyIds.current.add(item.id);
            setPendingIds((ids) => [...ids, item.id]);
            const wasUnread = isUnread(item);
            update((items) => removeNotification(items, item.id));
            if (wasUnread) adjust(-1);
            try {
                await apiFetch<unknown>(deletePath(item.id), { method: "DELETE" });
                return { ok: true };
            } catch (error) {
                const status = error instanceof ApiError ? error.status : null;
                // 404: Back ya no la tiene, así que no se vuelve a poner
                if (status !== 404) {
                    update((items) => restoreNotification(items, item));
                    if (wasUnread) adjust(1);
                }
                return { ok: false, ...describeDeleteError(status) };
            } finally {
                busyIds.current.delete(item.id);
                setPendingIds((ids) => ids.filter((id) => id !== item.id));
                refresh();
            }
        },
        [update, adjust, refresh],
    );

    return { remove, pendingIds };
}
