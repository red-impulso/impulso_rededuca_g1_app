import { describe, expect, it } from "vitest";
import {
    courseAssignmentsPath,
    coursePath,
    courseStudentsPath,
    describeApiError,
    parseCourseAssignments,
    parseCourses,
    parseSchool,
    parseStudentsPreview,
    parseSubjects,
    parseTeacherOptions,
    subjectPath,
    subjectsPath,
    subjectTeacherPath,
    toCourseBody,
    toSchoolBody,
    toSubjectBody,
    PENDING_ENDPOINT_TEXT,
} from "./school-api";
import { schoolToValues } from "./school-schemas";

describe("rutas", () => {
    it("arma las rutas de cursos, materias y alumnos", () => {
        expect(coursePath("c 1")).toBe("/courses/c%201");
        expect(courseAssignmentsPath("c1")).toBe("/courses/c1/assignments");
        expect(courseStudentsPath("c1")).toBe("/students?courseId=c1&limit=3");
        expect(subjectsPath()).toBe("/subjects");
        expect(subjectsPath("c1")).toBe("/subjects?courseId=c1");
        expect(subjectPath("s1")).toBe("/subjects/s1");
        expect(subjectTeacherPath("s1")).toBe("/subjects/s1/teacher");
    });
});

describe("errores", () => {
    it("sin conexión, permiso, servidor y texto por defecto", () => {
        expect(describeApiError(0, "", "x").kind).toBe("offline");
        expect(describeApiError(403, "no", "x").message).toMatch(/permiso/);
        expect(describeApiError(500, "boom", "x").message).toMatch(/servidor/);
        expect(describeApiError(null, "raro", "No pudimos cargar los cursos.")).toEqual({
            kind: "error",
            message: "No pudimos cargar los cursos.",
        });
    });

    it("409 y 400 muestran el mensaje de Back", () => {
        expect(describeApiError(409, "Ya existe un curso", "x").message).toBe("Ya existe un curso");
        expect(describeApiError(400, "", "x").message).toBe("x");
    });

    it("ruta inexistente en Back → aviso de función pendiente", () => {
        expect(describeApiError(404, "Cannot GET /institution", "x").message).toBe(PENDING_ENDPOINT_TEXT);
        expect(describeApiError(404, "Curso no encontrado", "x").message).toMatch(/No encontramos/);
    });
});

describe("respuestas", () => {
    it("escuela: los campos que faltan quedan en null", () => {
        expect(parseSchool({ id: "i1", name: "Escuela", address: "Calle 1", levels: ["Secundario"] })).toEqual({
            id: "i1",
            name: "Escuela",
            code: null,
            level: "Secundario",
            address: "Calle 1",
            city: null,
            province: null,
            phone: null,
            email: null,
            website: null,
            schoolYear: null,
            schedule: null,
            familyCommunications: false,
            dailyAttendance: false,
            logoUrl: null,
            updatedAt: null,
        });
        expect(parseSchool({ name: "Sin id" })).toBeNull();
    });

    it("cursos como los manda Back hoy", () => {
        expect(parseCourses([{ id: "c1", name: "5° A", year: 5, division: "A", shift: "morning", schoolYear: 2027 }, { id: "" }])).toEqual([
            {
                id: "c1",
                name: "5° A",
                year: 5,
                division: "A",
                shift: "morning",
                schoolYear: 2027,
                classroom: null,
                status: null,
                studentsCount: null,
                homeroomTeacher: null,
            },
        ]);
        expect(parseCourses({})).toBeNull();
    });

    it("cursos con todos los campos de Back", () => {
        const [course] = parseCourses([
            { id: "c1", name: "5° A", classroom: "Aula 3", status: "draft", studentsCount: 32, homeroomTeacher: { id: "t1", fullName: "Marta Ruiz" } },
        ])!;
        expect(course.classroom).toBe("Aula 3");
        expect(course.status).toBe("draft");
        expect(course.studentsCount).toBe(32);
        expect(course.homeroomTeacher).toEqual({ id: "t1", fullName: "Marta Ruiz" });
    });

    it("materias con curso y docente", () => {
        const [subject] = parseSubjects([
            { id: "s1", name: "Matemática", course: { id: "c1", name: "5° A", year: 5, division: "A", shift: null, schoolYear: 2027 }, teacher: { id: "t1", fullName: null }, weeklyHours: 5 },
        ])!;
        expect(subject.course?.id).toBe("c1");
        expect(subject.teacher).toEqual({ id: "t1", fullName: null });
        expect(subject.weeklyHours).toBe(5);
        expect(subject.status).toBeNull();
    });

    it("asignaciones, alumnos y docentes", () => {
        expect(
            parseCourseAssignments({
                course: { id: "c1", name: "5° A" },
                subjects: [{ id: "s1", name: "Matemática", weeklyHours: null, teacher: null }],
            }),
        ).toEqual({
            course: { id: "c1", name: "5° A", year: null, division: null, shift: null, schoolYear: null },
            subjects: [{ id: "s1", name: "Matemática", weeklyHours: null, teacher: null }],
        });
        expect(parseStudentsPreview({ data: [{ lastName: "Aguirre" }, { lastName: "" }], total: 32 })).toEqual({
            total: 32,
            lastNames: ["Aguirre"],
        });
        expect(parseTeacherOptions({ data: [{ id: "t1", fullName: "Juan" }, {}] })).toEqual([{ id: "t1", fullName: "Juan" }]);
        expect(parseTeacherOptions([])).toBeNull();
    });
});

describe("cuerpos", () => {
    it("escuela: manda levels para Back actual y los campos nuevos", () => {
        const body = toSchoolBody({
            ...schoolToValues(null, new Date("2026-11-10T12:00:00Z")),
            name: " Escuela ",
            level: "Secundario",
            schedule: "07:30-17:30",
        });
        expect(body).toMatchObject({
            name: "Escuela",
            level: "Secundario",
            levels: ["Secundario"],
            address: "",
            code: null,
            schoolYear: 2026,
            schedule: "07:30 – 17:30",
            familyCommunications: false,
        });
    });

    it("curso: '5° Año A' → año y división", () => {
        expect(
            toCourseBody({ name: "5° Año a", shift: "morning", schoolYear: "2027", classroom: "", homeroomTeacherId: "t1", status: "active" }),
        ).toEqual({
            year: 5,
            division: "A",
            shift: "morning",
            schoolYear: 2027,
            classroom: null,
            homeroomTeacherMembershipId: "t1",
            status: "active",
        });
    });

    it("materia: carga horaria como número y docente opcional", () => {
        expect(
            toSubjectBody({ name: " Lengua ", courseId: "c1", weeklyHours: "4", description: "", teacherId: "", status: "active" }),
        ).toEqual({
            courseId: "c1",
            name: "Lengua",
            teacherMembershipId: null,
            weeklyHours: 4,
            description: null,
            status: "active",
        });
    });
});
