import { describe, expect, it } from "vitest";
import { groupGradesBySubject, summarizeStudent } from "./student-grades";
import type { StudentGrade } from "./types";

function grade(subject: string, period: string, value: number | null): StudentGrade {
    return {
        subject: { id: `s-${subject}`, name: subject },
        period: { id: `p-${period}`, name: period },
        value,
    };
}

const grades: StudentGrade[] = [
    grade("Matemática", "1.er trimestre", 8),
    grade("Lengua", "1.er trimestre", 6),
    grade("Matemática", "2.º trimestre", 9),
    grade("Historia", "1.er trimestre", 5),
    grade("Lengua", "2.º trimestre", 7),
    grade("Biología", "1.er trimestre", null),
];

describe("groupGradesBySubject", () => {
    it("agrupa por materia y las ordena de la A a la Z", () => {
        const subjects = groupGradesBySubject(grades);
        expect(subjects.map((subject) => subject.subjectName)).toEqual([
            "Biología",
            "Historia",
            "Lengua",
            "Matemática",
        ]);
    });

    it("junta los períodos de cada materia y calcula su promedio", () => {
        const math = groupGradesBySubject(grades).find((s) => s.subjectName === "Matemática");
        expect(math?.periods).toEqual([
            { periodId: "p-1.er trimestre", periodName: "1.er trimestre", value: 8, observations: null },
            { periodId: "p-2.º trimestre", periodName: "2.º trimestre", value: 9, observations: null },
        ]);
        expect(math?.average).toBe(8.5);
    });

    it("una materia sin ninguna nota tiene promedio null", () => {
        const biology = groupGradesBySubject(grades).find((s) => s.subjectName === "Biología");
        expect(biology?.average).toBeNull();
    });

    it("sin notas devuelve una lista vacía", () => {
        expect(groupGradesBySubject([])).toEqual([]);
    });
});

describe("summarizeStudent", () => {
    it("calcula el promedio general y cuenta aprobadas y pendientes", () => {
        // Promedios: Biología sin nota, Historia 5, Lengua 6,5, Matemática 8,5
        const summary = summarizeStudent(groupGradesBySubject(grades));
        expect(summary).toEqual({ generalAverage: 6.7, approved: 2, pending: 1 });
    });

    it("sin notas no hay promedio ni materias contadas", () => {
        expect(summarizeStudent([])).toEqual({
            generalAverage: null,
            approved: 0,
            pending: 0,
        });
    });
});

describe("observaciones del docente", () => {
    it("pasan al período; vacías o ausentes quedan en null", () => {
        const subjects = groupGradesBySubject([
            { ...grade("Lengua", "1.er trimestre", 7), observations: "  Participa mucho " },
            { ...grade("Lengua", "2.º trimestre", 8), observations: "   " },
            { ...grade("Lengua", "3.er trimestre", 9) },
        ]);
        expect(subjects[0].periods.map((period) => period.observations)).toEqual([
            "Participa mucho",
            null,
            null,
        ]);
    });
});
