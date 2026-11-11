import { describe, expect, it } from "vitest";
import {
    courseToValues,
    makeCourseSchema,
    makeSubjectSchema,
    schoolSchema,
    schoolToValues,
    subjectToValues,
} from "./school-schemas";
import type { Course, Subject } from "./types";

const COURSE: Course = {
    id: "c1",
    name: "5° A",
    year: 5,
    division: "A",
    shift: "morning",
    schoolYear: 2027,
    classroom: "Aula 12",
    status: "active",
    studentsCount: 32,
    homeroomTeacher: { id: "t1", fullName: "Marta Ruiz" },
};

const SUBJECT: Subject = {
    id: "s1",
    name: "Matemática",
    course: COURSE,
    teacher: null,
    weeklyHours: 5,
    description: null,
    status: "active",
    studentsCount: null,
    updatedAt: null,
};

function firstError(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
    return result.error?.issues.map((issue) => [issue.path.join("."), issue.message]);
}

describe("formulario de la escuela", () => {
    const valid = { ...schoolToValues(null, new Date("2026-11-10T12:00:00Z")), name: "Escuela Normal N.° 1" };

    it("acepta los datos mínimos", () => {
        expect(schoolSchema.safeParse(valid).success).toBe(true);
        expect(valid.schoolYear).toBe("2026");
    });

    it("nombre obligatorio y código con formato ESC-0000", () => {
        expect(firstError(schoolSchema.safeParse({ ...valid, name: "  " }))).toEqual([
            ["name", "Este campo es obligatorio."],
        ]);
        expect(firstError(schoolSchema.safeParse({ ...valid, code: "ESC-12" }))).toEqual([
            ["code", "Formato inválido. Usa ESC-0000."],
        ]);
        expect(schoolSchema.safeParse({ ...valid, code: "ESC-0142" }).success).toBe(true);
    });

    it("valida correo, teléfono, sitio y horario solo si se completan", () => {
        expect(firstError(schoolSchema.safeParse({ ...valid, email: "escuela@", phone: "12", website: "hola", schedule: "7 a 17" }))).toEqual([
            ["phone", "Formato inválido."],
            ["email", "Formato inválido."],
            ["website", "Formato inválido."],
            ["schedule", "Formato inválido. Usa 07:30 – 17:30."],
        ]);
        expect(
            schoolSchema.safeParse({
                ...valid,
                email: "info@escuela.edu.ar",
                phone: "+54 388 400-0000",
                website: "www.escuela.edu.ar",
                schedule: "07:30 – 17:30",
            }).success,
        ).toBe(true);
    });
});

describe("formulario de curso", () => {
    const schema = makeCourseSchema([COURSE]);
    const values = { ...courseToValues(null, 2027), name: "4° Año B", shift: "morning" };

    it("arranca vacío con el año lectivo activo", () => {
        expect(courseToValues(null, 2027)).toEqual({
            name: "",
            shift: "",
            schoolYear: "2027",
            classroom: "",
            homeroomTeacherId: "",
            status: "active",
        });
        expect(courseToValues(COURSE, 2027).name).toBe("5° Año A");
    });

    it("pide nombre con año y división y turno", () => {
        expect(schema.safeParse(values).success).toBe(true);
        expect(firstError(schema.safeParse({ ...values, name: "" }))).toEqual([["name", "Este campo es obligatorio."]]);
        expect(firstError(schema.safeParse({ ...values, name: "Quinto" }))?.[0][0]).toBe("name");
        expect(firstError(schema.safeParse({ ...values, shift: "" }))).toEqual([["shift", "Este campo es obligatorio."]]);
    });

    it("avisa si el curso ya existe, salvo que sea el mismo", () => {
        const duplicated = { ...values, name: "5° A" };
        expect(firstError(schema.safeParse(duplicated))).toEqual([
            ["name", "Ya existe un curso con el mismo año, división, turno y ciclo lectivo."],
        ]);
        expect(makeCourseSchema([COURSE], "c1").safeParse(duplicated).success).toBe(true);
    });
});

describe("formulario de materia", () => {
    const schema = makeSubjectSchema([SUBJECT], [COURSE]);

    it("nombre único dentro del curso", () => {
        const values = { ...subjectToValues(null, "c1"), name: "matematica" };
        expect(firstError(schema.safeParse(values))).toEqual([
            ["name", "Ya existe una materia con ese nombre en 5° Año A."],
        ]);
        expect(makeSubjectSchema([SUBJECT], [COURSE], "s1").safeParse(values).success).toBe(true);
    });

    it("curso obligatorio y carga horaria de 1 a 40", () => {
        expect(firstError(schema.safeParse({ ...subjectToValues(null), name: "Lengua" }))).toEqual([
            ["courseId", "Este campo es obligatorio."],
        ]);
        expect(firstError(schema.safeParse({ ...subjectToValues(null, "c1"), name: "Lengua", weeklyHours: "50" }))).toEqual([
            ["weeklyHours", "Ingresa un número entre 1 y 40."],
        ]);
        expect(subjectToValues(SUBJECT).weeklyHours).toBe("5");
    });
});
