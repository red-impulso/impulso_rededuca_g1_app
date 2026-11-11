import { describe, expect, it } from "vitest";
import {
    isSchoolUnconfigured,
    optionsWith,
    activeSchoolYear,
    canManageSchool,
    courseCardMeta,
    courseFiltersQuery,
    courseLabel,
    coursesSubtitle,
    filterCourses,
    filterSubjects,
    formatUpdatedAt,
    hasCourseFilters,
    isDuplicateCourse,
    isDuplicateSubjectName,
    parseCourseName,
    readCourseFilters,
    readSubjectFilters,
    schoolSummary,
    schoolYearOptions,
    showingText,
    studentsPreviewText,
    subjectCardMeta,
    subjectFiltersQuery,
    subjectsCountText,
    teacherLabel,
    teachersOf,
    uniqueTeachers,
    weeklyHoursLong,
    weeklyHoursShort,
    DEFAULT_COURSE_FILTERS,
    DEFAULT_SUBJECT_FILTERS,
} from "./school-rules";
import type { Course, Subject } from "./types";

function course(overrides: Partial<Course> = {}): Course {
    return {
        id: "c1",
        name: "5° A",
        year: 5,
        division: "A",
        shift: "morning",
        schoolYear: 2027,
        classroom: null,
        status: "active",
        studentsCount: 32,
        homeroomTeacher: { id: "t1", fullName: "Marta Ruiz" },
        ...overrides,
    };
}

function subject(overrides: Partial<Subject> = {}): Subject {
    return {
        id: "s1",
        name: "Matemática",
        course: course(),
        teacher: { id: "t2", fullName: "Juan Pérez" },
        weeklyHours: 5,
        description: null,
        status: "active",
        studentsCount: null,
        updatedAt: null,
        ...overrides,
    };
}

describe("permisos", () => {
    it("solo admin y director gestionan la escuela", () => {
        expect(canManageSchool("admin")).toBe(true);
        expect(canManageSchool("director")).toBe(true);
        expect(canManageSchool("teacher")).toBe(false);
        expect(canManageSchool("guardian")).toBe(false);
    });
});

describe("nombre del curso", () => {
    it("arma '5° Año A' con año y división", () => {
        expect(courseLabel(course())).toBe("5° Año A");
        expect(courseLabel(course({ year: null }))).toBe("5° A");
    });

    it("entiende las formas comunes de escribirlo", () => {
        expect(parseCourseName("5° Año A")).toEqual({ year: 5, division: "A" });
        expect(parseCourseName("5° A")).toEqual({ year: 5, division: "A" });
        expect(parseCourseName("5 b")).toEqual({ year: 5, division: "B" });
        expect(parseCourseName("12º año 2")).toEqual({ year: 12, division: "2" });
    });

    it("rechaza lo que no tiene año válido o división", () => {
        expect(parseCourseName("Quinto A")).toBeNull();
        expect(parseCourseName("13° A")).toBeNull();
        expect(parseCourseName("0 A")).toBeNull();
        expect(parseCourseName("5°")).toBeNull();
        expect(parseCourseName("")).toBeNull();
    });
});

describe("textos de la lista", () => {
    it("subtítulo, contador y pie", () => {
        expect(coursesSubtitle(5, 2027)).toBe("5 cursos · año lectivo 2027");
        expect(coursesSubtitle(1, null)).toBe("1 curso");
        expect(subjectsCountText(4)).toBe("4 materias");
        expect(subjectsCountText(1)).toBe("1 materia");
        expect(showingText(5, 5, "cursos")).toBe("Mostrando 5 de 5 cursos");
    });

    it("tarjeta de curso sin los datos que faltan", () => {
        expect(courseCardMeta(course())).toBe("Turno Mañana · 32 estudiantes");
        expect(courseCardMeta(course({ studentsCount: null }))).toBe("Turno Mañana");
        expect(courseCardMeta(course({ shift: null, studentsCount: 1 }))).toBe("1 estudiante");
    });

    it("docente, carga horaria y tarjeta de materia", () => {
        expect(teacherLabel({ id: "t", fullName: "Juan Pérez" })).toBe("Prof. Juan Pérez");
        expect(teacherLabel(null)).toBe("Sin docente");
        expect(weeklyHoursShort(5)).toBe("5 h");
        expect(weeklyHoursLong(5)).toBe("5 h semanales");
        expect(weeklyHoursShort(null)).toBe("—");
        expect(subjectCardMeta(subject())).toBe("5° Año A · 5 h semanales");
        expect(subjectCardMeta(subject({ weeklyHours: null }))).toBe("5° Año A");
    });
});

describe("detalle", () => {
    it("estudiantes: cantidad y primeros apellidos", () => {
        expect(studentsPreviewText({ total: 32, lastNames: ["Aguirre", "Benítez", "Cabrera"] })).toBe(
            "32 · Aguirre, Benítez, Cabrera…",
        );
        expect(studentsPreviewText({ total: 2, lastNames: ["Aguirre", "Benítez"] })).toBe("2 · Aguirre, Benítez");
        expect(studentsPreviewText({ total: 0, lastNames: [] })).toBe("0");
    });

    it("docentes distintos de las materias", () => {
        const juan = { id: "t1", fullName: "Juan" };
        expect(
            uniqueTeachers([
                { id: "s1", name: "A", weeklyHours: null, teacher: juan },
                { id: "s2", name: "B", weeklyHours: null, teacher: null },
                { id: "s3", name: "C", weeklyHours: null, teacher: juan },
            ]),
        ).toEqual([juan]);
    });

    it("resumen del panel Institución", () => {
        expect(schoolSummary({ code: "ESC-0142", schoolYear: 2027 })).toBe("ESC-0142 · Año lectivo 2027");
        expect(schoolSummary({ code: null, schoolYear: 2027 })).toBe("Año lectivo 2027");
    });

    it("última actualización en hora de Argentina", () => {
        const now = new Date("2026-11-10T15:00:00Z");
        expect(formatUpdatedAt("2026-11-10T13:42:00Z", now)).toBe("hoy, 10:42");
        expect(formatUpdatedAt("2026-11-09T13:42:00Z", now)).toBe("ayer, 10:42");
        expect(formatUpdatedAt("2026-11-08T13:42:00Z", now)).toBe("8 de nov de 2026, 10:42");
        expect(formatUpdatedAt(null, now)).toBe("—");
        expect(formatUpdatedAt("cualquier cosa", now)).toBe("—");
    });
});

describe("filtros", () => {
    const courses = [
        course({ id: "a", year: 5, division: "B", studentsCount: 10 }),
        course({ id: "b", year: 1, division: "A", shift: "afternoon", studentsCount: 40, status: "draft" }),
        course({ id: "c", year: 3, division: "A", schoolYear: 2026, homeroomTeacher: null }),
    ];

    it("busca sin tildes ni mayúsculas y ordena por nombre", () => {
        expect(filterCourses(courses, { ...DEFAULT_COURSE_FILTERS }).map((c) => c.id)).toEqual(["b", "a", "c"]);
        expect(filterCourses(courses, { ...DEFAULT_COURSE_FILTERS, q: "marta" }).map((c) => c.id)).toEqual(["b", "a"]);
        expect(filterCourses(courses, { ...DEFAULT_COURSE_FILTERS, q: "5° año" }).map((c) => c.id)).toEqual(["a"]);
    });

    it("filtra por año, turno y estado, y ordena por estudiantes", () => {
        expect(filterCourses(courses, { ...DEFAULT_COURSE_FILTERS, schoolYear: 2026 }).map((c) => c.id)).toEqual(["c"]);
        expect(filterCourses(courses, { ...DEFAULT_COURSE_FILTERS, shift: "afternoon" }).map((c) => c.id)).toEqual(["b"]);
        expect(filterCourses(courses, { ...DEFAULT_COURSE_FILTERS, status: "draft" }).map((c) => c.id)).toEqual(["b"]);
        expect(filterCourses(courses, { ...DEFAULT_COURSE_FILTERS, sort: "students" }).map((c) => c.id)).toEqual([
            "b",
            "c",
            "a",
        ]);
    });

    it("materias por texto, curso, docente y estado", () => {
        const subjects = [
            subject(),
            subject({ id: "s2", name: "Lengua", teacher: null, status: "inactive" }),
            subject({ id: "s3", name: "Física", course: course({ id: "c2", year: 4 }) }),
        ];
        expect(filterSubjects(subjects, { ...DEFAULT_SUBJECT_FILTERS, q: "matematica" }).map((s) => s.id)).toEqual(["s1"]);
        expect(filterSubjects(subjects, { ...DEFAULT_SUBJECT_FILTERS, courseId: "c2" }).map((s) => s.id)).toEqual(["s3"]);
        expect(filterSubjects(subjects, { ...DEFAULT_SUBJECT_FILTERS, teacherId: "t2" }).map((s) => s.id)).toEqual([
            "s1",
            "s3",
        ]);
        expect(filterSubjects(subjects, { ...DEFAULT_SUBJECT_FILTERS, status: "inactive" }).map((s) => s.id)).toEqual([
            "s2",
        ]);
        expect(teachersOf(subjects)).toEqual([{ id: "t2", fullName: "Juan Pérez" }]);
    });

    it("lee y escribe los filtros de la URL en español", () => {
        const filters = readCourseFilters(new URLSearchParams("q=5&anio=2027&turno=tarde&estado=borrador&orden=estudiantes"));
        expect(filters).toEqual({ q: "5", schoolYear: 2027, shift: "afternoon", status: "draft", sort: "students" });
        expect(courseFiltersQuery(filters)).toBe("?q=5&anio=2027&turno=tarde&estado=borrador&orden=estudiantes");
        expect(courseFiltersQuery(DEFAULT_COURSE_FILTERS)).toBe("");
        expect(readCourseFilters(new URLSearchParams("turno=otro&anio=abc"))).toEqual(DEFAULT_COURSE_FILTERS);
        expect(hasCourseFilters({ ...DEFAULT_COURSE_FILTERS, sort: "students" })).toBe(false);
        expect(hasCourseFilters({ ...DEFAULT_COURSE_FILTERS, q: "a" })).toBe(true);

        const subjectFilters = readSubjectFilters(new URLSearchParams("curso=c1&docente=t1&estado=activo"));
        expect(subjectFilters).toEqual({ q: "", courseId: "c1", teacherId: "t1", status: "active" });
        expect(subjectFiltersQuery(subjectFilters)).toBe("?curso=c1&docente=t1&estado=activo");
    });
});

describe("duplicados", () => {
    it("materia repetida en el mismo curso (sin tildes ni mayúsculas)", () => {
        const subjects = [subject()];
        expect(isDuplicateSubjectName(subjects, "c1", "matematica")).toBe(true);
        expect(isDuplicateSubjectName(subjects, "c1", "matemática", "s1")).toBe(false);
        expect(isDuplicateSubjectName(subjects, "c2", "Matemática")).toBe(false);
    });

    it("curso con el mismo año, división, turno y ciclo", () => {
        const key = { year: 5, division: "a", shift: "morning" as const, schoolYear: 2027 };
        expect(isDuplicateCourse([course()], key)).toBe(true);
        expect(isDuplicateCourse([course()], key, "c1")).toBe(false);
        expect(isDuplicateCourse([course()], { ...key, shift: "evening" })).toBe(false);
    });
});

describe("año lectivo", () => {
    const now = new Date("2026-11-10T15:00:00Z");

    it("usa el de la escuela, si no el mayor de los cursos, si no el actual", () => {
        expect(activeSchoolYear(2027, [], now)).toBe(2027);
        expect(activeSchoolYear(null, [course({ schoolYear: 2025 }), course({ schoolYear: 2026 })], now)).toBe(2026);
        expect(activeSchoolYear(null, [], now)).toBe(2026);
    });

    it("opciones: anterior, actual y siguiente, más el elegido", () => {
        expect(schoolYearOptions(now)).toEqual([2027, 2026, 2025]);
        expect(schoolYearOptions(now, 2020)).toEqual([2027, 2026, 2025, 2020]);
    });
});

describe("isSchoolUnconfigured y optionsWith", () => {
    const base = {
        id: "i1", name: "Escuela", code: null, level: null, address: null, city: null, province: null,
        phone: null, email: null, website: null, schoolYear: null, schedule: null,
        familyCommunications: false, dailyAttendance: false, logoUrl: null, updatedAt: null,
    };

    it("sin datos además del nombre", () => {
        expect(isSchoolUnconfigured(base)).toBe(true);
        expect(isSchoolUnconfigured({ ...base, city: "Perico" })).toBe(false);
    });

    it("agrega el valor guardado si no está en la lista", () => {
        expect(optionsWith(["A", "B"], "C").map((o) => o.value)).toEqual(["A", "B", "C"]);
        expect(optionsWith(["A", "B"], "A")).toHaveLength(2);
        expect(optionsWith(["A"], null)).toEqual([{ value: "A", label: "A" }]);
    });
});
