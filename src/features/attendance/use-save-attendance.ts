"use client";

import { useCallback, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { describeSaveError } from "./attendance-api";
import type { SaveAttendanceBody, SaveAttendanceResponse } from "./types";

// Misma forma que el SaveState de calificaciones: así la barra de guardado
// de M1 se puede reusar tal cual.
export type SaveState =
    | { status: "idle" }
    | { status: "saving" }
    // saved = cantidad de registros guardados (0 si no había cambios)
    | { status: "saved"; saved: number }
    // kind "offline" se muestra en amarillo y "error" en rojo
    | { status: "error"; kind: "offline" | "error"; message: string };

// Guarda la lista con PUT /attendance
export function useSaveAttendance() {
    const [state, setState] = useState<SaveState>({ status: "idle" });

    // Devuelve la respuesta de Back si se guardó, o null si falló
    const save = useCallback(async (body: SaveAttendanceBody): Promise<SaveAttendanceResponse | null> => {
        // Sin cambios no hace falta llamar a Back
        if (body.entries.length === 0) {
            setState({ status: "saved", saved: 0 });
            return { saved: 0 };
        }
        setState({ status: "saving" });
        try {
            const result = await apiFetch<SaveAttendanceResponse>("/attendance", {
                method: "PUT",
                body: JSON.stringify(body),
            });
            setState({ status: "saved", saved: result.saved });
            return result;
        } catch (error) {
            const status = error instanceof ApiError ? error.status : null;
            const message = error instanceof Error ? error.message : "";
            setState({ status: "error", ...describeSaveError(status, message) });
            return null;
        }
    }, []);

    // Vuelve a "sin estado" (por ejemplo, al seguir editando o cambiar de curso)
    const reset = useCallback(() => setState({ status: "idle" }), []);

    return { state, save, reset };
}
