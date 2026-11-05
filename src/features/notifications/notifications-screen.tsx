"use client";

import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { NotificationsList } from "./notifications-list";
import { countUnread } from "./notifications-rules";
import {
    ALL_READ_MESSAGE,
    EMPTY_DESCRIPTION,
    EMPTY_TITLE,
    LOADING_TEXT,
    MARKING_LABEL,
    MARK_ALL_LABEL,
} from "./notifications-ui";
import type { NotificationItem } from "./types";
import { useMarkNotifications } from "./use-mark-notifications";
import type { MarkResult } from "./use-mark-notifications";
import { useNotifications } from "./use-notifications";

// Mientras carga la bandeja
function LoadingCard() {
    return (
        <div className="max-w-3xl rounded-2xl border border-line bg-surface p-4">
            <SkeletonLines lines={4} />
            <p className="mt-3 text-xs font-semibold text-muted">{LOADING_TEXT}</p>
        </div>
    );
}

// Bandeja de notificaciones: agrupada por día, con "Marcar leída" por aviso y
// "Marcar todas como leídas". Tocar una notificación la marca y lleva a su pantalla.
export function NotificationsScreen() {
    const { state, reload, update } = useNotifications();
    const { markOne, markAll, pendingIds, markingAll } = useMarkNotifications(update);
    const { showToast } = useToast();
    // Hora de referencia para "Hace X minutos"; se toma al abrir la pantalla
    const [now] = useState(() => new Date());

    // Los errores se avisan con un toast; marcar una con éxito no avisa (ya se ve en la tarjeta)
    const notifyError = useCallback(
        (result: MarkResult) => {
            if (result && !result.ok) showToast(result.message);
        },
        [showToast],
    );

    const handleMarkRead = useCallback(
        (item: NotificationItem) => {
            void markOne(item).then(notifyError);
        },
        [markOne, notifyError],
    );

    // Al tocar una notificación se marca como leída y el enlace navega (no se espera a Back)
    const handleOpen = useCallback(
        (item: NotificationItem) => {
            void markOne(item);
        },
        [markOne],
    );

    const items = state.status === "ready" ? state.items : [];
    const unread = countUnread(items);

    async function handleMarkAll() {
        const result = await markAll(items);
        if (result?.ok) showToast(ALL_READ_MESSAGE);
        else notifyError(result);
    }

    let content: ReactNode;
    if (state.status === "loading") {
        content = <LoadingCard />;
    } else if (state.status === "error") {
        content = <ErrorState message={state.message} onRetry={reload} />;
    } else if (state.items.length === 0) {
        content = <EmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />;
    } else {
        content = (
            <NotificationsList
                items={state.items}
                now={now}
                pendingIds={pendingIds}
                refreshing={state.refreshing}
                onOpen={handleOpen}
                onMarkRead={handleMarkRead}
            />
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {(unread > 0 || markingAll) && (
                <button
                    type="button"
                    onClick={handleMarkAll}
                    disabled={markingAll}
                    className="h-11 self-start rounded-[10px] bg-blue px-4 font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3 disabled:opacity-60"
                >
                    {markingAll ? MARKING_LABEL : MARK_ALL_LABEL}
                </button>
            )}
            {content}
        </div>
    );
}
