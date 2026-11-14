import { describe, expect, it } from "vitest";
import { DRAFT_MAX_AGE_MS, draftsStorageKey, parseStoredDrafts } from "./grade-draft-storage";
import { pruneDrafts } from "./grade-drafts";
import type { GradeRow } from "./types";

function makeRow(id: string, value: number | null, observations?: string): GradeRow {
    return { student: { id, firstName: "Nombre", lastName: "Apellido" }, value, observations };
}

const NOW = 1_700_000_000_000;

describe("parseStoredDrafts", () => {
    it("recupera las notas y observaciones guardadas", () => {
        const raw = JSON.stringify({ grades: { "1": "7" }, observations: { "2": "Mejoró" }, savedAt: NOW });
        expect(parseStoredDrafts(raw, NOW)).toEqual({ grades: { "1": "7" }, observations: { "2": "Mejoró" } });
    });

    it("descarta un borrador vencido", () => {
        const raw = JSON.stringify({ grades: { "1": "7" }, observations: {}, savedAt: NOW - DRAFT_MAX_AGE_MS - 1 });
        expect(parseStoredDrafts(raw, NOW)).toBeNull();
    });

    it("descarta datos dañados o vacíos", () => {
        expect(parseStoredDrafts(null, NOW)).toBeNull();
        expect(parseStoredDrafts("{no es json", NOW)).toBeNull();
        expect(parseStoredDrafts(JSON.stringify({ grades: { "1": 7 }, observations: {}, savedAt: NOW }), NOW)).toBeNull();
        expect(parseStoredDrafts(JSON.stringify({ grades: {}, observations: {}, savedAt: NOW }), NOW)).toBeNull();
    });
});

describe("draftsStorageKey", () => {
    it("separa por usuario/escuela, materia y período", () => {
        expect(draftsStorageKey("u1:i1", "m1", "p1")).not.toBe(draftsStorageKey("u1:i1", "m1", "p2"));
        expect(draftsStorageKey("u1:i1", "m1", "p1")).not.toBe(draftsStorageKey("u2:i1", "m1", "p1"));
    });
});

describe("pruneDrafts", () => {
    const rows = [makeRow("1", 8), makeRow("2", null, "Bien"), makeRow("3", 6)];

    it("conserva solo lo que sigue siendo un cambio frente a Back", () => {
        const result = pruneDrafts(
            rows,
            // "1" ya se guardó desde otro lado; "3" sigue cambiado; "9" ya no está en el curso
            { "1": "8", "3": "9", "9": "5" },
            { "2": "Bien", "3": "Nueva" },
        );
        expect(result).toEqual({ grades: { "3": "9" }, observations: { "3": "Nueva" } });
    });

    it("conserva los valores inválidos para que el docente los corrija", () => {
        expect(pruneDrafts(rows, { "1": "11" }, {}).grades).toEqual({ "1": "11" });
    });
});
