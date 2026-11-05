import { describe, expect, it } from "vitest";
import {
    canSeeDashboard,
    courseName,
    formatAverage,
    formatCount,
    formatPercentage,
    getPerformanceBand,
    isInstitutionEmpty,
    studentName,
    subjectName,
} from "./dashboard-rules";
import {
    NO_COURSE_NAME_LABEL,
    NO_GRADES_TEXT,
    NO_RECORDS_TEXT,
    NO_STUDENT_NAME_LABEL,
    NO_SUBJECT_NAME_LABEL,
} from "./dashboard-ui";
import type { DashboardSummary } from "./types";

describe("formatCount", () => {
    it("separa miles con punto", () => {
        expect(formatCount(0)).toBe("0");
        expect(formatCount(96)).toBe("96");
        expect(formatCount(1847)).toBe("1.847");
        expect(formatCount(1234567)).toBe("1.234.567");
    });
});

describe("formatPercentage", () => {
    it("coma decimal y hasta 1 decimal", () => {
        expect(formatPercentage(92.5)).toBe("92,5%");
        expect(formatPercentage(94)).toBe("94%");
        expect(formatPercentage(100)).toBe("100%");
    });

    it("sin registros", () => {
        expect(formatPercentage(null)).toBe(NO_RECORDS_TEXT);
    });
});

describe("formatAverage", () => {
    it("siempre 1 decimal con coma", () => {
        expect(formatAverage(7)).toBe("7,0");
        expect(formatAverage(7.4)).toBe("7,4");
        expect(formatAverage(6.96)).toBe("7,0");
    });

    it("sin notas", () => {
        expect(formatAverage(null)).toBe(NO_GRADES_TEXT);
    });
});

describe("getPerformanceBand", () => {
    it("sobresaliente desde 9", () => {
        expect(getPerformanceBand(10)).toBe("outstanding");
        expect(getPerformanceBand(9)).toBe("outstanding");
    });

    it("satisfactorio de 7 a 8,9", () => {
        expect(getPerformanceBand(8.99)).toBe("satisfactory");
        expect(getPerformanceBand(7)).toBe("satisfactory");
    });

    it("en riesgo de 6 a 6,9", () => {
        expect(getPerformanceBand(6.99)).toBe("atRisk");
        expect(getPerformanceBand(6)).toBe("atRisk");
    });

    it("crítico menos de 6", () => {
        expect(getPerformanceBand(5.99)).toBe("critical");
        expect(getPerformanceBand(1)).toBe("critical");
    });
});

describe("nombres", () => {
    it("alumno: Apellido, Nombre", () => {
        expect(studentName({ id: "s1", firstName: "Ana", lastName: "Pérez" })).toBe("Pérez, Ana");
    });

    it("alumno con solo un dato o sin datos", () => {
        expect(studentName({ id: "s1", firstName: "Ana", lastName: " " })).toBe("Ana");
        expect(studentName({ id: "s1", firstName: "", lastName: "Pérez" })).toBe("Pérez");
        expect(studentName({ id: "s1", firstName: "", lastName: "" })).toBe(NO_STUDENT_NAME_LABEL);
    });

    it("curso y materia sin nombre", () => {
        expect(courseName({ id: "c1", name: "3° A" })).toBe("3° A");
        expect(courseName({ id: "", name: "" })).toBe(NO_COURSE_NAME_LABEL);
        expect(subjectName({ name: "Matemática" })).toBe("Matemática");
        expect(subjectName({ name: "  " })).toBe(NO_SUBJECT_NAME_LABEL);
    });
});

describe("isInstitutionEmpty", () => {
    const empty: DashboardSummary = {
        students: 0,
        courses: 0,
        teachers: 0,
        attendanceAverage: null,
        lowAttendance: [],
        gradeAverages: [],
    };

    it("vacía si no hay estudiantes, cursos ni docentes", () => {
        expect(isInstitutionEmpty(empty)).toBe(true);
    });

    it("no vacía si hay alguno", () => {
        expect(isInstitutionEmpty({ ...empty, students: 1 })).toBe(false);
        expect(isInstitutionEmpty({ ...empty, courses: 1 })).toBe(false);
        expect(isInstitutionEmpty({ ...empty, teachers: 1 })).toBe(false);
    });
});

describe("canSeeDashboard", () => {
    it("admin y director sí", () => {
        expect(canSeeDashboard("admin")).toBe(true);
        expect(canSeeDashboard("director")).toBe(true);
    });

    it("docente y tutor no", () => {
        expect(canSeeDashboard("teacher")).toBe(false);
        expect(canSeeDashboard("guardian")).toBe(false);
    });
});
