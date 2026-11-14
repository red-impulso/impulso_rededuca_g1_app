"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { ANNOUNCEMENTS_PATH, describePublishError } from "./announcements-api";
import type { ErrorKind } from "./announcements-api";
import type { CreateAnnouncementPayload } from "./types";

export type PublishState =
    | { status: "idle" }
    | { status: "publishing" }
    | { status: "published" }
    // kind "offline" se muestra en amarillo y "error" en rojo
    | { status: "error"; kind: ErrorKind; message: string };

// Publica un comunicado con POST /announcements.
export function usePublishAnnouncement() {
    const [state, setState] = useState<PublishState>({ status: "idle" });
    // Evita publicar dos veces con un doble toque: cada publicación avisa de nuevo a los
    // tutores y Back no deja borrar ni editar. (El estado de React llega tarde; la ref no.)
    const busy = useRef(false);

    // Devuelve true si se publicó. La respuesta de Back es el registro crudo (snake_case):
    // no se usa; quien llama tiene que volver a pedir la lista.
    const publish = useCallback(async (payload: CreateAnnouncementPayload): Promise<boolean> => {
        if (busy.current) return false;
        busy.current = true;
        setState({ status: "publishing" });
        try {
            await apiFetch<unknown>(ANNOUNCEMENTS_PATH, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            // Publicado: queda bloqueado hasta reset(), para que un clic mientras se cierra
            // el formulario no lo publique otra vez
            setState({ status: "published" });
            return true;
        } catch (error) {
            const status = error instanceof ApiError ? error.status : null;
            setState({ status: "error", ...describePublishError(status) });
            busy.current = false;
            return false;
        }
    }, []);

    // Vuelve a "sin estado" (por ejemplo, al abrir el formulario de nuevo)
    const reset = useCallback(() => {
        busy.current = false;
        setState({ status: "idle" });
    }, []);

    return { state, publish, reset };
}
