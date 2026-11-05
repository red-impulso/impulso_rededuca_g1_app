"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/features/session/use-session";
import { apiFetch } from "@/lib/api";
import { UNREAD_COUNT_PATH, parseUnreadCount } from "./notifications-api";
import { adjustCount } from "./notifications-rules";
import { UnreadCountContext } from "./use-unread-count";
import type { UnreadCountValue } from "./use-unread-count";

// Último contador que se conoce y de qué institución es
type StoredCount = { institutionId: string; count: number };

// Pide GET /notifications/unread-count al entrar y en cada cambio de pantalla,
// y comparte el contador con la campanita y la bandeja.
// Va dentro de SessionProvider (necesita la membresía activa).
export function NotificationsProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { active } = useSession();
    const institutionId = active.institutionId;
    const [attempt, setAttempt] = useState(0);
    const [stored, setStored] = useState<StoredCount | null>(null);

    // Cada pedido tiene su clave: otra pantalla, otra membresía o un "refresh" es otro pedido
    const key = `${active.id}:${pathname}:${attempt}`;

    useEffect(() => {
        let cancelled = false;
        apiFetch<unknown>(UNREAD_COUNT_PATH)
            .then((data) => {
                if (cancelled) return;
                const count = parseUnreadCount(data);
                if (count !== null) setStored({ institutionId, count });
            })
            .catch(() => {
                // Si falla se queda el último contador: la campanita no muestra errores
            });
        return () => {
            cancelled = true;
        };
    }, [key, institutionId]);

    // Un contador de otra institución no sirve
    const count = stored?.institutionId === institutionId ? stored.count : null;

    const adjust = useCallback((delta: number) => {
        setStored((previous) =>
            previous ? { ...previous, count: adjustCount(previous.count, delta) } : previous,
        );
    }, []);

    const setCount = useCallback(
        (value: number) => setStored({ institutionId, count: adjustCount(value, 0) }),
        [institutionId],
    );

    const refresh = useCallback(() => setAttempt((value) => value + 1), []);

    const value = useMemo<UnreadCountValue>(
        () => ({ count, adjust, setCount, refresh }),
        [count, adjust, setCount, refresh],
    );

    return <UnreadCountContext.Provider value={value}>{children}</UnreadCountContext.Provider>;
}
