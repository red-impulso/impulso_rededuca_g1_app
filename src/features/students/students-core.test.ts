import { describe, expect, it } from "vitest";
import { parseStudentPage, parseStudentProfile, studentsListPath, toStudentBody } from "./students-api";
import {
    DEFAULT_STUDENT_FILTERS,
    formatDate,
    formatDni,
    pageNumbers,
    readStudentFilters,
    relativeDay,
    studentFiltersQuery,
    studentName,
    withFilter,
} from "./students-rules";
import { profileToValues, studentSchema } from "./students-schemas";
import { pageRangeText, studentsTotalText } from "./students-texts";

describe("students-api", () => {
    it("arma GET /students con filtros y página", () => {
        const path = studentsListPath({ ...DEFAULT_STUDENT_FILTERS, q: " díaz ", courseId: "c1", status: "active", page: 2 });
        expect(path).toBe("/students?q=d%C3%ADaz&courseId=c1&status=active&page=2&limit=25");
        expect(studentsListPath({ ...DEFAULT_STUDENT_FILTERS, sort: "last-desc", shift: "morning", schoolYear: 2027 })).toContain("shift=morning&schoolYear=2027&sort=-lastName");
    });

    it("lee la página de alumnos de Back", () => {
        const page = parseStudentPage({
            data: [{ id: "s1", firstName: "Tomás", lastName: "Díaz", dni: "41220118", status: "active", course: { id: "c1", year: 5, division: "A", shift: "morning", schoolYear: 2027 }, guardian: null, updatedAt: null }, { nope: 1 }],
            total: 1248,
            page: 1,
            limit: 25,
        });
        expect(page?.data).toHaveLength(1);
        expect(page?.data[0].course?.division).toBe("A");
        expect(page?.total).toBe(1248);
        expect(parseStudentPage([])).toBeNull();
    });

    it("lee la ficha; lo que falta queda null", () => {
        const profile = parseStudentProfile({ personal: { id: "s1", firstName: "Tomás", lastName: "Díaz" }, academic: { status: "active" } });
        expect(profile?.academicSummary.averageGrade).toBeNull();
        expect(profile?.guardians).toEqual([]);
        expect(parseStudentProfile({})).toBeNull();
    });

    it("alta sin vacíos; edición con observaciones", () => {
        const values = profileToValues(null, "c1");
        const created = toStudentBody({ ...values, firstName: " Tomás ", lastName: "Díaz" }, false);
        expect(created).toEqual({ firstName: "Tomás", lastName: "Díaz", courseId: "c1", status: "active" });
        const edited = toStudentBody({ ...values, firstName: "T", lastName: "D", dni: "41220118" }, true);
        expect(edited).toMatchObject({ dni: "41220118", observationAcademic: "" });
    });
});

describe("students-schemas", () => {
    it("valida obligatorios, DNI y correo", () => {
        const base = profileToValues(null, "c1");
        expect(studentSchema.safeParse({ ...base, firstName: "A", lastName: "B" }).success).toBe(true);
        expect(studentSchema.safeParse({ ...base, firstName: "", lastName: "B" }).success).toBe(false);
        expect(studentSchema.safeParse({ ...base, firstName: "A", lastName: "B", dni: "123" }).success).toBe(false);
        expect(studentSchema.safeParse({ ...base, firstName: "A", lastName: "B", email: "x@" }).success).toBe(false);
        expect(studentSchema.safeParse({ ...base, firstName: "A", lastName: "B", birthDate: "2999-01-01" }).success).toBe(false);
    });
});

describe("students-rules", () => {
    it("filtros en la URL ida y vuelta", () => {
        const filters = { ...DEFAULT_STUDENT_FILTERS, q: "ana", courseId: "c1", shift: "afternoon" as const, status: "draft" as const, schoolYear: 2027, sort: "course" as const, page: 3 };
        const query = studentFiltersQuery(filters);
        expect(query).toBe("?q=ana&curso=c1&turno=tarde&estado=borrador&anio=2027&orden=curso&pagina=3");
        expect(readStudentFilters(new URLSearchParams(query))).toEqual(filters);
        expect(studentFiltersQuery(DEFAULT_STUDENT_FILTERS)).toBe("");
    });

    it("cambiar un filtro vuelve a la página 1", () => {
        expect(withFilter({ ...DEFAULT_STUDENT_FILTERS, page: 4 }, { status: "active" }).page).toBe(1);
    });

    it("textos de la lista", () => {
        expect(studentName({ firstName: "Tomás", lastName: "Díaz" })).toBe("Díaz, Tomás");
        expect(formatDni("41220118")).toBe("41.220.118");
        expect(formatDate("2027-03-01T00:00:00Z")).toBe("1/3/2027");
        expect(studentsTotalText(1248)).toBe("1.248 alumnos");
        expect(pageRangeText(1, 25, 1248)).toBe("1-25 de 1.248");
        const now = new Date(2026, 10, 10, 12);
        expect(relativeDay(new Date(2026, 10, 10, 8).toISOString(), now)).toBe("Hoy");
        expect(relativeDay(new Date(2026, 10, 9, 8).toISOString(), now)).toBe("Ayer");
    });

    it("botones de página", () => {
        expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
        expect(pageNumbers(5, 50)).toEqual([1, "…", 4, 5, 6, "…", 50]);
    });
});
