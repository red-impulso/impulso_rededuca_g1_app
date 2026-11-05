"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/session/use-session";
import { ApiError, apiFetch } from "@/lib/api";
import { NOTIFICATIONS_PATH, describeLoadError, parseNotifications } from "./notifications-api";
import type { ErrorKind } from "./notifications-api";
import { LOAD_ERROR_TEXT } from "./notifications-ui";
import type { NotificationItem } from "./types";

// Resultado de pedir la lista (key = cuál de los pedidos; institutionId = de qué institución)
type ListResult =
    | { key: string; institutionId: string; status: "ready"; items: NotificationItem[] }
    | { key: string; institutionId: string; status: "error"; kind: ErrorKind; message: string };

export type NotificationsState =
    | { status: "loading" }
    | { status: "error"; kind: ErrorKind; message: string }
    // refreshing = se está volviendo a pedir la lista y mientras tanto se ve la anterior
    | { status: "ready"; items: NotificationItem[]; refreshing: boolean };

// Cambia la lista ya cargada (para marcar leídas sin esperar a Back)
export type UpdateNotifications = (change: (items: NotificationItem[]) => NotificationItem[]) => void;

// Trae la bandeja (GET /notifications: últimas 50, de la más nueva a la más vieja).
export function useNotifications() {
    const { active } = useSession();
    const institutionId = active.institutionId;
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<ListResult | null>(null);

    // Cada pedido tiene su clave: al cambiar de institución o reintentar, es otro pedido
    const key = `${active.id}:${attempt}`;

    useEffect(() => {
        let cancelled = false;
        apiFetch<unknown>(NOTIFICATIONS_PATH)
            .then((data) => {
                if (cancelled) return;
                const items = parseNotifications(data);
                setResult(
                    items
                        ? { key, institutionId, status: "ready", items }
                        : {
                              key,
                              institutionId,
                              status: "error",
                              kind: "error",
                              message: LOAD_ERROR_TEXT,
                          },
                );
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                const status = error instanceof ApiError ? error.status : null;
                setResult({ key, institutionId, status: "error", ...describeLoadError(status) });
            });
        return () => {
            cancelled = true;
        };
    }, [key, institutionId]);

    // Estado: si lo guardado es de otro pedido, está cargando.
    // Excepción: si ya había una lista de la misma institución, se sigue mostrando mientras se actualiza.
    let state: NotificationsState;
    if (result?.key === key) {
        state =
            result.status === "ready"
                ? { status: "ready", items: result.items, refreshing: false }
                : { status: "error", kind: result.kind, message: result.message };
    } else if (result?.status === "ready" && result.institutionId === institutionId) {
        state = { status: "ready", items: result.items, refreshing: true };
    } else {
        state = { status: "loading" };
    }

    // Reintentar tras un error
    const reload = useCallback(() => setAttempt((value) => value + 1), []);

    const update = useCallback<UpdateNotifications>((change) => {
        setResult((previous) =>
            previous?.status === "ready" ? { ...previous, items: change(previous.items) } : previous,
        );
    }, []);

    return { state, reload, update };
}
