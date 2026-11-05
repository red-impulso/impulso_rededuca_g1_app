"use client";

import { createContext, useContext } from "react";

export type UnreadCountValue = {
    // null mientras no llegó el primer dato de Back (la campanita no muestra contador)
    count: number | null;
    // Suma o resta al contador sin esperar a Back (nunca baja de 0)
    adjust: (delta: number) => void;
    // Fija el contador sin esperar a Back (por ejemplo, 0 al marcar todas)
    setCount: (value: number) => void;
    // Vuelve a pedir el contador a Back
    refresh: () => void;
};

export const UnreadCountContext = createContext<UnreadCountValue | null>(null);

// Contador de no leídas compartido entre la campanita y la bandeja; solo funciona dentro del panel
export function useUnreadCount(): UnreadCountValue {
    const value = useContext(UnreadCountContext);
    if (!value) {
        throw new Error("useUnreadCount debe usarse dentro de NotificationsProvider");
    }
    return value;
}
