import { describe, expect, it } from "vitest";
import { DASHBOARD_PATH, describeLoadError, parseDashboard } from "./dashboard-api";
import { FORBIDDEN_TEXT, LOAD_ERROR_TEXT, OFFLINE_TEXT, SERVER_ERROR_TEXT } from "./dashboard-ui";

const valid = {
    students: 1847,
    courses: 24,
    teachers: 96,
    attendanceAverage: 92.5,
    lowAttendance: [
        {
            student: { id: "s1", firstName: "Ana", lastName: "Pérez" },
            course: { id: "c1", name: "3° A" },
            percentage: 70.5,
        },
    ],
    gradeAverages: [
        {
            subject: { id: "m1", name: "Matemática" },
            course: { id: "c1", name: "3° A" },
            average: 7.45,
        },
        {
            subject: { id: "m2", name: "Lengua" },
            course: { id: "c1", name: "3° A" },
            average: null,
        },
    ],
};

describe("ruta de Back", () => {
    it("GET /dashboard", () => {
        expect(DASHBOARD_PATH).toBe("/dashboard");
    });
});

describe("describeLoadError", () => {
    it("sin conexión", () => {
        expect(describeLoadError(0)).toEqual({ kind: "offline", message: OFFLINE_TEXT });
    });

    it("sin permiso", () => {
        expect(describeLoadError(403)).toEqual({ kind: "forbidden", message: FORBIDDEN_TEXT });
    });

    it("error del servidor", () => {
        expect(describeLoadError(500)).toEqual({ kind: "error", message: SERVER_ERROR_TEXT });
        expect(describeLoadError(503)).toEqual({ kind: "error", message: SERVER_ERROR_TEXT });
    });

    it("otro error o sin código", () => {
        expect(describeLoadError(400)).toEqual({ kind: "error", message: LOAD_ERROR_TEXT });
        expect(describeLoadError(null)).toEqual({ kind: "error", message: LOAD_ERROR_TEXT });
    });
});

describe("parseDashboard", () => {
    it("respuesta completa", () => {
        expect(parseDashboard(valid)).toEqual(valid);
    });

    it("null si no es un objeto", () => {
        expect(parseDashboard(null)).toBeNull();
        expect(parseDashboard([])).toBeNull();
        expect(parseDashboard("hola")).toBeNull();
    });

    it("null si falta o está mal un total", () => {
        expect(parseDashboard({ ...valid, students: undefined })).toBeNull();
        expect(parseDashboard({ ...valid, courses: "24" })).toBeNull();
        expect(parseDashboard({ ...valid, teachers: -1 })).toBeNull();
        expect(parseDashboard({ ...valid, students: 1.5 })).toBeNull();
    });

    it("asistencia promedio null o inválida queda null", () => {
        expect(parseDashboard({ ...valid, attendanceAverage: null })?.attendanceAverage).toBeNull();
        expect(parseDashboard({ ...valid, attendanceAverage: "92" })?.attendanceAverage).toBeNull();
    });

    it("listas que no son listas quedan vacías", () => {
        const parsed = parseDashboard({ ...valid, lowAttendance: null, gradeAverages: {} });
        expect(parsed?.lowAttendance).toEqual([]);
        expect(parsed?.gradeAverages).toEqual([]);
    });

    it("saltea alumnos sin id o sin porcentaje", () => {
        const parsed = parseDashboard({
            ...valid,
            lowAttendance: [
                { student: { firstName: "Sin id" }, course: valid.lowAttendance[0].course, percentage: 50 },
                { ...valid.lowAttendance[0], percentage: null },
                "roto",
                valid.lowAttendance[0],
            ],
        });
        expect(parsed?.lowAttendance).toEqual(valid.lowAttendance);
    });

    it("completa nombres y curso que faltan", () => {
        const parsed = parseDashboard({
            ...valid,
            lowAttendance: [{ student: { id: "s2" }, percentage: 40 }],
        });
        expect(parsed?.lowAttendance).toEqual([
            {
                student: { id: "s2", firstName: "", lastName: "" },
                course: { id: "", name: "" },
                percentage: 40,
            },
        ]);
    });

    it("saltea materias sin id y deja null los promedios inválidos", () => {
        const parsed = parseDashboard({
            ...valid,
            gradeAverages: [
                { subject: { name: "Sin id" }, course: valid.gradeAverages[0].course, average: 8 },
                { subject: { id: "m3", name: "Historia" }, average: "8" },
            ],
        });
        expect(parsed?.gradeAverages).toEqual([
            { subject: { id: "m3", name: "Historia" }, course: { id: "", name: "" }, average: null },
        ]);
    });
});
