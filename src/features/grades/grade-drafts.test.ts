import { describe, expect, it } from "vitest";
import {
    CANNOT_CLEAR_MESSAGE,
    MAX_OBSERVATION_LENGTH,
    OBSERVATION_TOO_LONG_MESSAGE,
    getObservationState,
    getRowState,
    setDraft,
    setObservationDraft,
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

describe("observaciones", () => {
    const withNote: GradeRow = { ...makeRow("4", 8), observations: "Buen trabajo" };

    it("sin edición muestra la de Back (o vacío) y no hay cambios", () => {
        expect(getObservationState(withNote, {})).toEqual({
            text: "Buen trabajo",
            changed: false,
            error: null,
        });
        expect(getObservationState(withGrade, {})).toEqual({ text: "", changed: false, error: null });
    });

    it("escribir lo mismo (o solo espacios de más) no es un cambio", () => {
        expect(getObservationState(withNote, { "4": "Buen trabajo  " }).changed).toBe(false);
        expect(setObservationDraft({}, withNote, "Buen trabajo ")).toEqual({});
    });

    it("más de 500 caracteres es un error", () => {
        const long = "x".repeat(MAX_OBSERVATION_LENGTH + 1);
        expect(getObservationState(withGrade, { "1": long }).error).toBe(OBSERVATION_TOO_LONG_MESSAGE);
        expect(getObservationState(withGrade, { "1": "x".repeat(MAX_OBSERVATION_LENGTH) }).error).toBeNull();
    });

    it("si solo cambió la observación se manda la nota que ya tenía", () => {
        const summary = summarizeDrafts([withNote], {}, { "4": "Revisar oral" });
        expect(summary).toEqual({
            changedCount: 1,
            hasErrors: false,
            entries: [{ studentId: "4", value: 8, observations: "Revisar oral" }],
        });
    });

    it("borrar la observación manda texto vacío (omitida la conservaría)", () => {
        const summary = summarizeDrafts([withNote], {}, { "4": "" });
        expect(summary.entries).toEqual([{ studentId: "4", value: 8, observations: "" }]);
    });

    it("alumno sin nota y con observación manda value null", () => {
        const summary = summarizeDrafts([withoutGrade], {}, { "2": "Faltó al examen" });
        expect(summary.entries).toEqual([{ studentId: "2", value: null, observations: "Faltó al examen" }]);
    });

    it("nota y observación juntas en la misma entrada, sin espacios de más", () => {
        const summary = summarizeDrafts([withGrade], { "1": "9" }, { "1": "  Excelente " });
        expect(summary.entries).toEqual([{ studentId: "1", value: 9, observations: "Excelente" }]);
        expect(summary.changedCount).toBe(1);
    });

    it("sin tocar la observación no se manda el campo", () => {
        const summary = summarizeDrafts([withNote], { "4": "9" });
        expect(summary.entries).toEqual([{ studentId: "4", value: 9 }]);
        expect("observations" in summary.entries[0]).toBe(false);
    });

    it("una observación demasiado larga bloquea el guardado y no se envía", () => {
        const long = "x".repeat(MAX_OBSERVATION_LENGTH + 1);
        const summary = summarizeDrafts([withNote], {}, { "4": long });
        expect(summary.hasErrors).toBe(true);
        expect(summary.entries).toEqual([]);
        expect(summary.changedCount).toBe(1);
    });
});
