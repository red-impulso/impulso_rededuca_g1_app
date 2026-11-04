import { describe, expect, it } from "vitest";
import {
    OFFLINE_MESSAGE,
    SAVE_ERROR_MESSAGE,
    coursesPathFor,
    describeSaveError,
    sheetPath,
} from "./attendance-api";

describe("coursesPathFor", () => {
    it("el docente usa sus propios cursos", () => {
        expect(coursesPathFor("teacher")).toBe("/me/courses");
    });

    it("admin y director usan todos los cursos de la institución", () => {
        expect(coursesPathFor("admin")).toBe("/courses");
        expect(coursesPathFor("director")).toBe("/courses");
    });

    it("el tutor no toma lista", () => {
        expect(coursesPathFor("guardian")).toBeNull();
    });
});

describe("sheetPath", () => {
    it("arma la ruta con el curso y la fecha", () => {
        expect(sheetPath("abc-123", "2026-11-03")).toBe("/attendance?courseId=abc-123&date=2026-11-03");
    });

    it("codifica los caracteres especiales", () => {
        expect(sheetPath("a&b", "2026-11-03")).toBe("/attendance?courseId=a%26b&date=2026-11-03");
    });
});

describe("describeSaveError", () => {
    it("sin respuesta del servidor es falta de conexión", () => {
        expect(describeSaveError(0, "No pudimos conectar")).toEqual({
            kind: "offline",
            message: OFFLINE_MESSAGE,
        });
    });

    it("un rechazo de la API muestra su mensaje", () => {
        expect(describeSaveError(400, "No se puede registrar asistencia a fecha futura")).toEqual({
            kind: "error",
            message: "No se puede registrar asistencia a fecha futura",
        });
    });

    it("un error del servidor muestra el texto genérico", () => {
        expect(describeSaveError(500, "Internal Server Error")).toEqual({
            kind: "error",
            message: SAVE_ERROR_MESSAGE,
        });
    });

    it("un error que no vino de la API muestra el texto genérico", () => {
        expect(describeSaveError(null, "algo raro")).toEqual({
            kind: "error",
            message: SAVE_ERROR_MESSAGE,
        });
    });
});
