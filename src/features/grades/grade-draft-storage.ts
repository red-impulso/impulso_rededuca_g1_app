import type { GradeDrafts, ObservationDrafts } from "./grade-drafts";

// Borradores de la planilla guardados en este dispositivo (localStorage),
// para no perder lo escrito al recargar, cerrar la pestaña o cambiar de pantalla.
// Se separan por usuario y escuela (scope) y por materia y período.

const PREFIX = "rededuca:grades";
// Un borrador sin tocar por más de 30 días se descarta
export const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type StoredDrafts = {
    grades: GradeDrafts;
    observations: ObservationDrafts;
};

export type GradesSelection = {
    subjectId: string | null;
    periodId: string | null;
};

export function draftsStorageKey(scope: string, subjectId: string, periodId: string): string {
    return `${PREFIX}:drafts:${scope}:${subjectId}:${periodId}`;
}

function selectionStorageKey(scope: string): string {
    return `${PREFIX}:selection:${scope}`;
}

function isStringRecord(value: unknown): value is Record<string, string> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.values(value).every((item) => typeof item === "string")
    );
}

function isEmpty(drafts: StoredDrafts): boolean {
    return Object.keys(drafts.grades).length === 0 && Object.keys(drafts.observations).length === 0;
}

// Lee lo guardado; null si no hay, está dañado o venció
export function parseStoredDrafts(raw: string | null, now: number): StoredDrafts | null {
    if (!raw) return null;
    try {
        const data: unknown = JSON.parse(raw);
        if (typeof data !== "object" || data === null) return null;
        const { grades, observations, savedAt } = data as Record<string, unknown>;
        if (typeof savedAt !== "number" || now - savedAt > DRAFT_MAX_AGE_MS) return null;
        if (!isStringRecord(grades) || !isStringRecord(observations)) return null;
        const drafts = { grades, observations };
        return isEmpty(drafts) ? null : drafts;
    } catch {
        return null;
    }
}

export function readDrafts(key: string): StoredDrafts | null {
    try {
        const raw = window.localStorage.getItem(key);
        const drafts = parseStoredDrafts(raw, Date.now());
        if (raw && !drafts) window.localStorage.removeItem(key);
        return drafts;
    } catch {
        return null;
    }
}

// Sin cambios pendientes se borra la entrada
export function writeDrafts(key: string, drafts: StoredDrafts): void {
    try {
        if (isEmpty(drafts)) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, JSON.stringify({ ...drafts, savedAt: Date.now() }));
        }
    } catch {
        // Sin almacenamiento (modo privado o lleno): el borrador queda solo en pantalla
    }
}

export function readSelection(scope: string): GradesSelection {
    try {
        const data: unknown = JSON.parse(window.localStorage.getItem(selectionStorageKey(scope)) ?? "null");
        if (typeof data !== "object" || data === null) return { subjectId: null, periodId: null };
        const { subjectId, periodId } = data as Record<string, unknown>;
        return {
            subjectId: typeof subjectId === "string" ? subjectId : null,
            periodId: typeof periodId === "string" ? periodId : null,
        };
    } catch {
        return { subjectId: null, periodId: null };
    }
}

export function writeSelection(scope: string, selection: GradesSelection): void {
    try {
        window.localStorage.setItem(selectionStorageKey(scope), JSON.stringify(selection));
    } catch {
        // Sin almacenamiento: al volver se abre la primera materia
    }
}
