import { describe, expect, it } from "vitest";
import {
    NO_RECORDS_TEXT,
    OFFLINE_ERROR_MESSAGE,
    SERVER_ERROR_MESSAGE,
    describeLoadError,
    formatAttendanceDate,
    formatPercentage,
    sortNewestFirst,
} from "./student-attendance";

describe("formatPercentage", () => {
    it("usa coma decimal y el signo %", () => {
        expect(formatPercentage(92.5)).toBe("92,5%");
        expect(formatPercentage(66.7)).toBe("66,7%");
    });

    it("no agrega decimales de más", () => {
        expect(formatPercentage(100)).toBe("100%");
        expect(formatPercentage(0)).toBe("0%");
    });

    it("sin porcentaje (null) muestra «Sin registros»", () => {
        expect(formatPercentage(null)).toBe(NO_RECORDS_TEXT);
        expect(NO_RECORDS_TEXT).toBe("Sin registros");
    });
});

describe("formatAttendanceDate", () => {
    it("muestra el día en español con el año", () => {
        const text = formatAttendanceDate("2026-11-03");
        expect(text).toContain("martes");
        expect(text).toContain("3 de noviembre");
        expect(text).toContain("2026");
    });

    it("no corre el día por la zona horaria", () => {
        expect(formatAttendanceDate("2026-11-01")).toContain("1 de noviembre");
    });

    it("si la fecha no es válida la deja como vino", () => {
        expect(formatAttendanceDate("hoy")).toBe("hoy");
    });
});

describe("sortNewestFirst", () => {
    it("ordena del día más nuevo al más viejo sin modificar la lista original", () => {
        const records = [
            { date: "2026-10-01", status: "present" as const },
            { date: "2026-11-03", status: "absent" as const },
            { date: "2026-10-15", status: "late" as const },
        ];
        expect(sortNewestFirst(records).map((record) => record.date)).toEqual([
            "2026-11-03",
            "2026-10-15",
            "2026-10-01",
        ]);
        expect(records[0].date).toBe("2026-10-01");
    });
});

describe("describeLoadError", () => {
    it("sin respuesta del servidor es falta de conexión", () => {
        expect(describeLoadError(0, "No pudimos conectar")).toBe(OFFLINE_ERROR_MESSAGE);
    });

    it("un rechazo de la API muestra su mensaje", () => {
        expect(describeLoadError(403, "El tutor no está vinculado a este estudiante")).toBe(
            "El tutor no está vinculado a este estudiante",
        );
    });

    it("un error del servidor o desconocido muestra el texto genérico", () => {
        expect(describeLoadError(500, "Internal Server Error")).toBe(SERVER_ERROR_MESSAGE);
        expect(describeLoadError(null, "algo raro")).toBe(SERVER_ERROR_MESSAGE);
    });
});
