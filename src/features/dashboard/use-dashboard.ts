"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/session/use-session";
import { ApiError, apiFetch } from "@/lib/api";
import { DASHBOARD_PATH, describeLoadError, parseDashboard } from "./dashboard-api";
import type { ErrorKind } from "./dashboard-api";
import { LOAD_ERROR_TEXT } from "./dashboard-ui";
import type { DashboardSummary } from "./types";

// Resultado de pedir el tablero (key = cuál de los pedidos; institutionId = de qué institución)
type SummaryResult =
    | { key: string; institutionId: string; status: "ready"; summary: DashboardSummary }
    | { key: string; institutionId: string; status: "error"; kind: ErrorKind; message: string };

export type DashboardState =
    | { status: "loading" }
    | { status: "error"; kind: ErrorKind; message: string }
    // refreshing = se está volviendo a pedir y mientras tanto se ve el anterior
    | { status: "ready"; summary: DashboardSummary; refreshing: boolean };

// Trae el resumen de la institución activa (GET /dashboard).
export function useDashboard() {
    const { active } = useSession();
    const institutionId = active.institutionId;
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<SummaryResult | null>(null);

    // Cada pedido tiene su clave: al cambiar de institución o reintentar, es otro pedido
    const key = `${active.id}:${attempt}`;

    useEffect(() => {
        let cancelled = false;
        apiFetch<unknown>(DASHBOARD_PATH)
            .then((data) => {
                if (cancelled) return;
                const summary = parseDashboard(data);
                setResult(
                    summary
                        ? { key, institutionId, status: "ready", summary }
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
    // Excepción: si ya había datos de la misma institución, se siguen mostrando mientras se actualiza.
    let state: DashboardState;
    if (result?.key === key) {
        state =
            result.status === "ready"
                ? { status: "ready", summary: result.summary, refreshing: false }
                : { status: "error", kind: result.kind, message: result.message };
    } else if (result?.status === "ready" && result.institutionId === institutionId) {
        state = { status: "ready", summary: result.summary, refreshing: true };
    } else {
        state = { status: "loading" };
    }

    // Reintentar tras un error
    const reload = useCallback(() => setAttempt((value) => value + 1), []);

    return { state, reload };
}
