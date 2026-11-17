"use client";

import { useCallback, useState } from "react";
import type { SaveState } from "@/components/ui/save-bar";
import { ApiError, apiFetch } from "@/lib/api";
import type { SaveGradesBody, SaveGradesResponse } from "./types";

// Textos del diseño (M1-UX, sección 7)
export const SAVED_MESSAGE = "Cambios guardados correctamente";
export const NOTHING_TO_SAVE_MESSAGE = "No había cambios para guardar.";
export const OFFLINE_MESSAGE = "Sin conexión. Tus cambios no se perdieron.";
export const SAVE_ERROR_MESSAGE = "No pudimos guardar los cambios. Inténtalo de nuevo.";
export const INVALID_SAVE_MESSAGE = "Alguna nota u observación no es válida. Revísalas e inténtalo de nuevo.";
export const FORBIDDEN_SAVE_MESSAGE = "No tienes permiso para cargar notas en esta materia.";
export const NOT_FOUND_SAVE_MESSAGE = "La materia o el período ya no existen. Recarga la página.";

// Convierte el error en el texto que ve el docente
function describeError(error: unknown): { kind: "offline" | "error"; message: string } {
    if (error instanceof ApiError) {
        // Sin respuesta del servidor: no hay conexión
        if (error.status === 0) return { kind: "offline", message: OFFLINE_MESSAGE };
        // Los mensajes de Back son técnicos ("subjectId inválido"): se usan textos propios
        if (error.status === 400) return { kind: "error", message: INVALID_SAVE_MESSAGE };
        if (error.status === 403) return { kind: "error", message: FORBIDDEN_SAVE_MESSAGE };
        if (error.status === 404) return { kind: "error", message: NOT_FOUND_SAVE_MESSAGE };
    }
    return { kind: "error", message: SAVE_ERROR_MESSAGE };
}

// Guarda la planilla con PUT /grades
export function useSaveGrades() {
    const [state, setState] = useState<SaveState>({ status: "idle" });

    // Devuelve la respuesta de Back si se guardó, o null si falló
    const save = useCallback(async (body: SaveGradesBody): Promise<SaveGradesResponse | null> => {
        setState({ status: "saving" });
        try {
            const result = await apiFetch<SaveGradesResponse>("/grades", {
                method: "PUT",
                body: JSON.stringify(body),
            });
            setState({ status: "saved", saved: result.saved });
            return result;
        } catch (error) {
            setState({ status: "error", ...describeError(error) });
            return null;
        }
    }, []);

    // Vuelve a "sin estado" (por ejemplo, al seguir editando o cambiar de materia)
    const reset = useCallback(() => setState({ status: "idle" }), []);

    return { state, save, reset };
}