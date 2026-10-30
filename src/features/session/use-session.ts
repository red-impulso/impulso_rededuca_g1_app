"use client";

import { createContext, useContext } from "react";
import type { Session } from "./types";

export const SessionContext = createContext<Session | null>(null);

// Devuelve { profile, memberships, active }; solo funciona dentro del panel
export function useSession(): Session {
    const session = useContext(SessionContext);
    if (!session) {
        throw new Error("useSession debe usarse dentro de SessionProvider");
    }
    return session;
}
