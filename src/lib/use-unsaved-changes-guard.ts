"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Avisa antes de perder cambios sin guardar (M1-UX, sección 7: "Edición en curso").
// - Cerrar o recargar la pestaña: lo maneja el propio navegador.
// - Tocar un enlace del sitio (menú, logo, etc.): se frena y se guarda a dónde iba,
//   para preguntar "Seguir editando" o "Salir sin guardar".
// Limitación: los botones atrás/adelante del navegador no se pueden frenar en Next.
export function useUnsavedChangesGuard(active: boolean) {
    const router = useRouter();
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    useEffect(() => {
        if (!active) return;

        function handleBeforeUnload(event: BeforeUnloadEvent) {
            event.preventDefault();
            event.returnValue = "";
        }

        function handleClick(event: MouseEvent) {
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            const target = event.target;
            if (!(target instanceof Element)) return;
            const anchor = target.closest("a");
            if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

            const url = new URL(anchor.href, window.location.href);
            // Enlaces a otros sitios: los cubre el aviso del navegador
            if (url.origin !== window.location.origin) return;
            // Mismo lugar: no se sale de la pantalla
            if (url.pathname === window.location.pathname && url.search === window.location.search) {
                return;
            }

            // Se corta antes de que Next navegue y se pregunta primero
            event.preventDefault();
            event.stopPropagation();
            setPendingHref(url.pathname + url.search + url.hash);
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("click", handleClick, true);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("click", handleClick, true);
        };
    }, [active]);

    // "Seguir editando"
    const stay = useCallback(() => setPendingHref(null), []);

    // "Salir sin guardar": sigue hacia donde iba
    const leave = useCallback(() => {
        if (pendingHref) router.push(pendingHref);
        setPendingHref(null);
    }, [pendingHref, router]);

    return { pendingHref, stay, leave };
}
