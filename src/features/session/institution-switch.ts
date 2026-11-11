"use client";

import { createContext, useContext } from "react";
import type { Membership } from "./types";

export const REMEMBERED_INSTITUTION_KEY = "rededuca:escuela";
export const INSTITUTION_CHANNEL = "rededuca-escuela";
export const SWITCH_STEPS = ["Verificando tu acceso", "Cargando permisos y roles", "Cargando datos de la escuela", "Sincronizando información"] as const;

export type SwitchState =
    | { phase: "idle" }
    | { phase: "loading"; target: Membership; step: 0 | 1 | 2 | 3 }
    | { phase: "error"; target: Membership; message: string };

export type InstitutionSwitch = {
    state: SwitchState;
    switchTo: (target: Membership) => void;
    dismiss: () => void;
};

export const InstitutionSwitchContext = createContext<InstitutionSwitch>({ state: { phase: "idle" }, switchTo: () => undefined, dismiss: () => undefined });

export function useInstitutionSwitch(): InstitutionSwitch {
    return useContext(InstitutionSwitchContext);
}

// Escuela inicial: la última elegida si sigue entre las membresías, si no la primera (SDD 8.5)
export function initialMembership(memberships: Membership[], rememberedId: string | null): Membership | undefined {
    return memberships.find((item) => item.id === rememberedId || item.institutionId === rememberedId) ?? memberships[0];
}

export function switchErrorText(target: string, current: string): string {
    return `No pudimos cambiar a ${target}. Seguís en ${current}.`;
}

export function readRememberedInstitution(): string | null {
    try {
        return window.localStorage.getItem(REMEMBERED_INSTITUTION_KEY);
    } catch {
        return null;
    }
}

export function rememberInstitution(id: string): void {
    try {
        window.localStorage.setItem(REMEMBERED_INSTITUTION_KEY, id);
    } catch {
        // Sin almacenamiento (modo privado): no se recuerda
    }
}
