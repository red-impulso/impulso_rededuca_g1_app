import { describe, expect, it } from "vitest";
import {
    INVALID_GRADE_MESSAGE,
    calculateAverage,
    formatAverage,
    formatGrade,
    getGradeLevel,
    validateGradeInput,
} from "./grade-rules";

describe("validateGradeInput", () => {
    it("un casillero vacío no es un error", () => {
        expect(validateGradeInput("")).toEqual({ status: "empty" });
        expect(validateGradeInput("   ")).toEqual({ status: "empty" });
    });

    it("acepta notas de 1 a 10, con coma o con punto", () => {
        expect(validateGradeInput("1")).toEqual({ status: "valid", value: 1 });
        expect(validateGradeInput("10")).toEqual({ status: "valid", value: 10 });
        expect(validateGradeInput("6,5")).toEqual({ status: "valid", value: 6.5 });
        expect(validateGradeInput("6.5")).toEqual({ status: "valid", value: 6.5 });
    });

    it("un valor fuera de 1–10 es inválido", () => {
        for (const text of ["0", "11", "10,5", "0,5"]) {
            expect(validateGradeInput(text)).toEqual({
                status: "invalid",
                message: INVALID_GRADE_MESSAGE,
            });
        }
    });

    it("el texto que no es un número es inválido", () => {
        for (const text of ["abc", "-3", "6,", "6,555", "1e1"]) {
            expect(validateGradeInput(text).status).toBe("invalid");
        }
    });
});

describe("calculateAverage", () => {
    it("promedia solo las notas cargadas, con 1 decimal", () => {
        expect(calculateAverage([8, 9, 7])).toBe(8);
        expect(calculateAverage([9, 10, 9])).toBe(9.3);
        expect(calculateAverage([6, null, 7])).toBe(6.5);
    });

    it("sin ninguna nota devuelve null", () => {
        expect(calculateAverage([null, null, null])).toBeNull();
        expect(calculateAverage([])).toBeNull();
    });
});

describe("getGradeLevel", () => {
    it("7 o más es satisfactorio", () => {
        expect(getGradeLevel(7)).toBe("satisfactory");
        expect(getGradeLevel(10)).toBe("satisfactory");
    });

    it("de 6 a 6,9 es atención", () => {
        expect(getGradeLevel(6)).toBe("attention");
        expect(getGradeLevel(6.9)).toBe("attention");
    });

    it("menos de 6 es bajo", () => {
        expect(getGradeLevel(5.9)).toBe("low");
        expect(getGradeLevel(1)).toBe("low");
    });
});

describe("formato en pantalla", () => {
    it("las notas usan coma decimal", () => {
        expect(formatGrade(6.5)).toBe("6,5");
        expect(formatGrade(8)).toBe("8");
    });

    it("el promedio siempre lleva 1 decimal", () => {
        expect(formatAverage(7)).toBe("7,0");
        expect(formatAverage(9.3)).toBe("9,3");
    });
});