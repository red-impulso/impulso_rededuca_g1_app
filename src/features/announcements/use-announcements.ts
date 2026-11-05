"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/session/use-session";
import { ApiError, apiFetch } from "@/lib/api";
import { ANNOUNCEMENTS_PATH, describeLoadError, parseAnnouncements } from "./announcements-api";
import type { ErrorKind } from "./announcements-api";
import { LOAD_ERROR_TEXT } from "./announcements-ui";
import type { Announcement } from "./types";

// Resultado de pedir la lista (key = cuál de los pedidos; institutionId = de qué institución)
type ListResult =
    | { key: string; institutionId: string; status: "ready"; items: Announcement[] }
    | { key: string; institutionId: string; status: "error"; kind: ErrorKind; message: string };

export type AnnouncementsState =
    | { status: "loading" }
    | { status: "error"; kind: ErrorKind; message: string }
    // refreshing = se está volviendo a pedir la lista y mientras tanto se ve la anterior
    | { status: "ready"; items: Announcement[]; refreshing: boolean };

// Trae la lista de comunicados que el rol puede ver (GET /announcements, del más nuevo al más viejo).
// Back ya filtra por rol, curso e hijos: el Front no filtra nada.
export function useAnnouncements() {
    const { active } = useSession();
    const institutionId = active.institutionId;
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<ListResult | null>(null);

    // Cada pedido tiene su clave: al cambiar de institución o reintentar, es otro pedido
    const key = `${active.id}:${attempt}`;

    useEffect(() => {
        let cancelled = false;
        apiFetch<unknown>(ANNOUNCEMENTS_PATH)
            .then((data) => {
                if (cancelled) return;
                const items = parseAnnouncements(data);
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
    let state: AnnouncementsState;
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

    // Reintentar tras un error o actualizar después de publicar (la respuesta del POST no trae la lista)
    const reload = useCallback(() => setAttempt((value) => value + 1), []);

    return { state, reload };
}
