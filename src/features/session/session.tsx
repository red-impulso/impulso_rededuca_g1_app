"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

// Tipos del contrato de sesión (los consume todo el Front)
export type Role = "admin" | "director" | "teacher" | "guardian";

export type Profile = {
    id: string;
    fullName: string;
};

export type Membership = {
    id: string;
    role: Role;
    institutionId: string;
    institutionName: string;
    detail: string;
};

export type Session = {
    profile: Profile;
    memberships: Membership[];
    active: Membership | null;
};

// Nombres de rol visibles en pantalla
export const ROLE_LABELS: Record<Role, string> = {
    admin: "Administración",
    director: "Directiva",
    teacher: "Docente",
    guardian: "Tutor/a",
};

// Datos inventados: se reemplazan cuando exista la API
const MOCK_PROFILE: Profile = { id: "profile-1", fullName: "Persona de Ejemplo" };

const MOCK_MEMBERSHIPS: Membership[] = [
{
    id: "membership-1",
    role: "guardian",
    institutionId: "institution-1",
    institutionName: "Escuela de Ejemplo N.º 1",
    detail: "Estudiante A · 1.º B y Estudiante B · 4.º A",
},
{
    id: "membership-2",
    role: "teacher",
    institutionId: "institution-2",
    institutionName: "Instituto de Ejemplo N.º 2",
    detail: "Matemática · 3 cursos",
},
{
    id: "membership-3",
    role: "director",
    institutionId: "institution-3",
    institutionName: "Colegio de Ejemplo",
    detail: "Equipo de conducción",
},
];

const STORAGE_KEY = "rededuca.active-membership";
const CHANGE_EVENT = "rededuca:active-membership-change";

// Respaldo en memoria si el navegador bloquea el almacenamiento
let memoryId: string | null = null;

function readSavedId(): string | null {
try {
    return window.sessionStorage.getItem(STORAGE_KEY);
} catch {
    return memoryId;
}
}

function writeSavedId(id: string | null) {
try {
    if (id) {
        window.sessionStorage.setItem(STORAGE_KEY, id);
    } else {
        window.sessionStorage.removeItem(STORAGE_KEY);
    }
} catch {
    // Sin almacenamiento: el perfil vale solo mientras la pantalla esté abierta
    memoryId = id;
}
  // Avisa a React que cambió el perfil guardado
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
};
}

// En el servidor todavía no se sabe si hay perfil guardado
function getServerSavedId(): string | null | undefined {
return undefined;
}

type SessionContextValue = Session & {
  // true cuando ya se leyó el perfil guardado (evita parpadeos al recargar)
    ready: boolean;
    setActive: (membership: Membership | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  // Lee el perfil elegido antes (si hay) sin usar efectos
const savedId = useSyncExternalStore<string | null | undefined>(
    subscribe,
    readSavedId,
    getServerSavedId,
);
const ready = savedId !== undefined;

const active = useMemo(
    () => MOCK_MEMBERSHIPS.find((m) => m.id === savedId) ?? null,
    [savedId],
);

const setActive = useCallback((membership: Membership | null) => {
    writeSavedId(membership ? membership.id : null);
}, []);

const value = useMemo<SessionContextValue>(
    () => ({
        profile: MOCK_PROFILE,
        memberships: MOCK_MEMBERSHIPS,
        active,
        ready,
        setActive,
    }),
    [active, ready, setActive],
);

return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
const context = useContext(SessionContext);
if (!context) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
}
return context;
}