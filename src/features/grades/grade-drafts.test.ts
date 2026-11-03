import { describe, expect, it } from "vitest";
import {
    CANNOT_CLEAR_MESSAGE,
    getRowState,
    setDraft,
    summarizeDrafts,
} from "./grade-drafts";
import { INVALID_GRADE_MESSAGE } from "./grade-rules";
import type { GradeRow } from "./types";

function makeRow(id: string, value: number | null): GradeRow {
    return { student: { id, firstName: "Nombre", lastName: "Apellido" }, value };
}

const withGrade = makeRow("1", 8.5);
const withoutGrade = makeRow("2", null);
const rows = [withGrade, withoutGrade, makeRow("3", 7)];

describe("getRowState", () => {
    it("sin edición muestra la nota de Back y no hay cambios", () => {
        expect(getRowState(withGrade, {})).toEqual({
            text: "8,5",
            value: 8.5,
            changed: false,
            error: null,
        });
        expect(getRowState(withoutGrade, {})).toEqual({
            text: "",
            value: null,
            changed: false,
            error: null,
        });
    });

    it("una nota nueva válida cuenta como cambio", () => {
        expect(getRowState(withGrade, { "1": "9" })).toEqual({
            text: "9",
            value: 9,
            changed: true,
            error: null,
        });
    });

    it("escribir lo mismo que ya estaba guardado no es un cambio", () => {
        expect(getRowState(withGrade, { "1": "8,50" }).changed).toBe(false);
    });

    it("un valor fuera de 1–10 es un error y cuenta como cambio sin guardar", () => {
        expect(getRowState(withGrade, { "1": "11" })).toEqual({
            text: "11",
            value: null,
            changed: true,
            error: INVALID_GRADE_MESSAGE,
        });
    });

    it("no se puede vaciar una nota ya cargada", () => {
        expect(getRowState(withGrade, { "1": "" })).toEqual({
            text: "",
            value: null,
            changed: true,
            error: CANNOT_CLEAR_MESSAGE,
        });
    });

    it("dejar vacío un casillero sin nota no es un cambio", () => {
        expect(getRowState(withoutGrade, { "2": "  " }).changed).toBe(false);
    });
});

describe("setDraft", () => {
    it("guarda lo que escribió el docente", () => {
        expect(setDraft({}, withGrade, "9")).toEqual({ "1": "9" });
    });

    it("al volver a la nota original, el cambio desaparece", () => {
        const edited = setDraft({}, withGrade, "9");
        expect(setDraft(edited, withGrade, "8,5")).toEqual({});
    });

    it("no modifica el objeto que recibe", () => {
        const before = { "2": "7" };
        setDraft(before, withGrade, "9");
        expect(before).toEqual({ "2": "7" });
    });
});

describe("summarizeDrafts", () => {
    it("sin ediciones no hay cambios ni nada para enviar", () => {
        expect(summarizeDrafts(rows, {})).toEqual({
            changedCount: 0,
            hasErrors: false,
            entries: [],
        });
    });

    it("cuenta los cambios y arma solo las notas cambiadas", () => {
        const drafts = { "1": "9", "2": "7,5" };
        expect(summarizeDrafts(rows, drafts)).toEqual({
            changedCount: 2,
            hasErrors: false,
            entries: [
                { studentId: "1", value: 9 },
                { studentId: "2", value: 7.5 },
            ],
        });
    });

    it("un casillero inválido bloquea el guardado y no se envía", () => {
        const drafts = { "2": "7,5", "3": "11" };
        expect(summarizeDrafts(rows, drafts)).toEqual({
            changedCount: 2,
            hasErrors: true,
            entries: [{ studentId: "2", value: 7.5 }],
        });
    });

    it("vaciar una nota ya cargada bloquea el guardado", () => {
        const summary = summarizeDrafts(rows, { "1": "" });
        expect(summary.hasErrors).toBe(true);
        expect(summary.entries).toEqual([]);
    });
});