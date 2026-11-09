"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/features/session/use-session";
import { ApiError, apiFetch } from "@/lib/api";
import { describeLoadError, describeUpdateError, leadPath, leadsPath, parseLead, parseLeads } from "./leads-api";
import type { ErrorKind } from "./leads-api";
import { applyStatusChange } from "./leads-rules";
import { LOAD_ERROR_TEXT } from "./leads-ui";
import type { Lead, LeadFilter, LeadStatus } from "./types";

// Resultado de pedir la lista (key = cuál de los pedidos)
type LeadsResult =
    | { key: string; status: "ready"; leads: Lead[] }
    | { key: string; status: "error"; kind: ErrorKind; message: string };

export type LeadsState =
    | { status: "loading" }
    | { status: "error"; kind: ErrorKind; message: string }
    | { status: "ready"; leads: Lead[] };

// Trae las postulaciones del filtro elegido (GET /leads?status=)
export function useLeads(filter: LeadFilter) {
    const { active } = useSession();
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<LeadsResult | null>(null);

    // Cada pedido tiene su clave: al cambiar el filtro o reintentar, es otro pedido
    const key = `${active.id}:${filter}:${attempt}`;

    useEffect(() => {
        let cancelled = false;
        apiFetch<unknown>(leadsPath(filter))
            .then((data) => {
                if (cancelled) return;
                const leads = parseLeads(data);
                setResult(
                    leads
                        ? { key, status: "ready", leads }
                        : { key, status: "error", kind: "error", message: LOAD_ERROR_TEXT },
                );
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                const status = error instanceof ApiError ? error.status : null;
                setResult({ key, status: "error", ...describeLoadError(status) });
            });
        return () => {
            cancelled = true;
        };
    }, [key, filter]);

    // Si lo guardado es de otro pedido, está cargando
    let state: LeadsState;
    if (result?.key === key) {
        state =
            result.status === "ready"
                ? { status: "ready", leads: result.leads }
                : { status: "error", kind: result.kind, message: result.message };
    } else {
        state = { status: "loading" };
    }

    // Reintentar tras un error
    const reload = useCallback(() => setAttempt((value) => value + 1), []);

    // Cambia una postulación en la lista (o la saca si ya no coincide con el filtro)
    const replace = useCallback(
        (updated: Lead) =>
            setResult((current) =>
                current?.status === "ready"
                    ? { ...current, leads: applyStatusChange(current.leads, updated, filter) }
                    : current,
            ),
        [filter],
    );

    return { state, reload, replace };
}

// null = se ignoró (ya tenía ese estado o ya se estaba guardando)
export type UpdateResult =
    | { ok: true; status: LeadStatus }
    | { ok: false; kind: ErrorKind; message: string }
    | null;

// Cambia el estado de una postulación (PATCH /leads/:id) y avisa con onUpdated
export function useUpdateLeadStatus(onUpdated: (lead: Lead) => void) {
    // Ids que se están guardando (para mostrar "Guardando…" y deshabilitar los botones)
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    // Evita mandar dos veces lo mismo con un doble toque (el estado de React llega tarde; la ref no)
    const busyIds = useRef(new Set<string>());

    const changeStatus = useCallback(
        async (lead: Lead, status: LeadStatus): Promise<UpdateResult> => {
            if (lead.status === status || busyIds.current.has(lead.id)) return null;
            busyIds.current.add(lead.id);
            setPendingIds((ids) => [...ids, lead.id]);
            try {
                const data = await apiFetch<unknown>(leadPath(lead.id), {
                    method: "PATCH",
                    body: JSON.stringify({ status }),
                });
                onUpdated(parseLead(data) ?? { ...lead, status });
                return { ok: true, status };
            } catch (error) {
                const code = error instanceof ApiError ? error.status : null;
                return { ok: false, ...describeUpdateError(code) };
            } finally {
                busyIds.current.delete(lead.id);
                setPendingIds((ids) => ids.filter((id) => id !== lead.id));
            }
        },
        [onUpdated],
    );

    return { changeStatus, pendingIds };
}
