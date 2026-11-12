import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TeacherDetailView } from "./teacher-detail";
import { TeachersList } from "./teachers-list";
import { parseAssignmentRows, parseCandidates, parseTeacherDetail, parseTeacherPage, teachersListPath } from "./teachers-api";
import {
    DEFAULT_TEACHER_FILTERS,
    applyChanges,
    availability,
    changedCount,
    loadLevel,
    pendingHoursFor,
    readTeacherFilters,
    seniorityText,
    teacherFiltersQuery,
    toCsv,
} from "./teachers-rules";
import { teacherSchema, teacherToValues, toTeacherPatch } from "./teachers-schemas";
import type { AssignmentRow, TeacherCandidate } from "./types";

const apiTeacher = {
    id: "t1",
    fullName: "Laura Suárez",
    email: "laura@x.com",
    phone: "3884123456",
    fileNumber: "L-1042",
    employmentStatus: "titular",
    status: "activo",
    coursesCount: 2,
    subjects: [{ id: "m1", name: "Física", weeklyHours: 4, course: { id: "c1", name: "", year: 4, division: "A", shift: "morning" } }],
    weeklyHours: 28,
    maxWeeklyHours: 30,
};

describe("teachers-api", () => {
    it("arma la URL con los filtros de Back", () => {
        const path = teachersListPath({ ...DEFAULT_TEACHER_FILTERS, q: " pe ", status: "licencia", employmentStatus: "suplente", sort: "hours", page: 2 });
        expect(path).toBe("/teachers?q=pe&status=licencia&employmentStatus=suplente&sort=-weeklyHours&page=2&limit=25");
    });

    it("lee lista y ficha", () => {
        const page = parseTeacherPage({ data: [apiTeacher, { nope: 1 }], total: 1, page: 1, limit: 25 });
        expect(page?.data).toHaveLength(1);
        expect(page?.data[0]).toMatchObject({ fullName: "Laura Suárez", status: "activo", weeklyHours: 28 });
        const detail = parseTeacherDetail({ ...apiTeacher, hiredAt: "2015-03-01", seniority: { years: 9, months: 2 }, kpis: { weeklyHours: 28, maxWeeklyHours: 30, subjectsCount: 1, coursesCount: 2, studentsReached: 60 }, schedule: [] });
        expect(detail?.kpis.studentsReached).toBe(60);
        expect(detail?.schedule).toEqual([]);
        expect(parseAssignmentRows({ course: {}, subjects: [{ id: "m1", name: "Física", weeklyHours: 4, teacher: null }] })).toEqual([{ subjectId: "m1", subjectName: "Física", weeklyHours: 4, teacher: null }]);
    });
});

describe("teachers-rules", () => {
    it("filtros en la URL ida y vuelta", () => {
        const filters = { ...DEFAULT_TEACHER_FILTERS, q: "ana", status: "activo" as const, shift: "afternoon" as const, sort: "file-number" as const, page: 3 };
        const query = teacherFiltersQuery(filters);
        expect(query).toBe("?q=ana&estado=activo&turno=tarde&orden=legajo&pagina=3");
        expect(readTeacherFilters(new URLSearchParams(query))).toEqual(filters);
    });

    it("carga: texto cerca y sobre el límite", () => {
        expect(loadLevel(20, 30)).toBe("ok");
        expect(loadLevel(28, 30)).toBe("near");
        expect(loadLevel(33, 30)).toBe("over");
    });

    it("disponibilidad del candidato", () => {
        const base: TeacherCandidate = { id: "t", fullName: "T", status: "activo", weeklyHours: 26, maxWeeklyHours: 30, conflict: null };
        expect(availability(base, 4)).toBe("available");
        expect(availability(base, 4, 2)).toBe("over-limit");
        expect(availability({ ...base, conflict: "Química · 5° B · Lunes 8:00" }, 4)).toBe("conflict");
        expect(availability({ ...base, status: "inactivo" }, 4)).toBe("unavailable");
        expect(availability({ ...base, status: "licencia" }, 4)).toBe("available");
    });

    it("cambios acumulados y horas pendientes", () => {
        const rows: AssignmentRow[] = [
            { subjectId: "a", subjectName: "A", weeklyHours: 4, teacher: { id: "t1", fullName: "Uno" } },
            { subjectId: "b", subjectName: "B", weeklyHours: 3, teacher: null },
        ];
        const changes = { a: { id: "t2", fullName: "Dos" }, b: { id: "t2", fullName: "Dos" } };
        expect(changedCount(rows, changes)).toBe(2);
        expect(changedCount(rows, { a: { id: "t1", fullName: "Uno" } })).toBe(0);
        expect(applyChanges(rows, { a: null })[0]).toMatchObject({ teacher: null, changed: true });
        expect(pendingHoursFor("t2", rows, changes)).toBe(7);
        expect(pendingHoursFor("t1", rows, changes)).toBe(-4);
    });

    it("antigüedad y CSV", () => {
        expect(seniorityText({ years: 1, months: 0 })).toBe("1 año");
        expect(seniorityText({ years: 9, months: 2 })).toBe("9 años y 2 meses");
        expect(toCsv([["a", 'b"c'], ["d,e", "f"]])).toBe('a,"b""c"\n"d,e",f');
    });
});

describe("teachers-schemas", () => {
    it("valida y arma el PATCH solo con campos de Back", () => {
        const values = { ...teacherToValues(null), fullName: "Ana Paz", email: "ana@x.com", fileNumber: "L-1", hiredAt: "2020-01-02" };
        expect(teacherSchema.safeParse(values).success).toBe(true);
        expect(teacherSchema.safeParse({ ...values, maxWeeklyHours: "81" }).success).toBe(false);
        expect(teacherSchema.safeParse({ ...values, email: "x" }).success).toBe(false);
        expect(toTeacherPatch(values)).toEqual({ fullName: "Ana Paz", email: "ana@x.com", phone: undefined, fileNumber: "L-1", employmentStatus: "titular", status: "activo", maxWeeklyHours: 30, hiredAt: "2020-01-02" });
    });
});

describe("vistas M8", () => {
    const teacher = parseTeacherPage({ data: [apiTeacher], total: 1 })!.data[0];
    it("lista con selección, medidor y estado con texto", () => {
        const html = renderToStaticMarkup(<TeachersList teachers={[teacher]} selected={["t1"]} onToggle={() => undefined} onToggleAll={() => undefined} onEdit={() => undefined} />);
        expect(html).toContain("Laura Suárez");
        expect(html).toContain("L-1042");
        expect(html).toContain("28 de 30 hs");
        expect(html).toContain("Cerca del límite");
        expect(html).toContain("Titular");
        expect(html).toContain("Activo");
        expect(html).toContain('href="/docentes/t1"');
        expect(html).toContain("checked");
    });

    it("ficha sin materias ni horario", () => {
        const detail = parseTeacherDetail({ ...apiTeacher, subjects: [], kpis: {}, schedule: [] })!;
        const html = renderToStaticMarkup(<TeacherDetailView teacher={detail} activity={{ status: "error", message: "Cannot GET", onRetry: () => undefined }} actions={null} onRemoveSubject={() => undefined} />);
        expect(html).toContain("Este docente todavía no tiene materias asignadas.");
        expect(html).toContain("Todavía no hay horarios cargados.");
        expect(html).toContain("No pudimos cargar la actividad.");
        expect(html).toContain("mailto:laura@x.com");
    });
});

describe("candidatos de GET /teachers/candidates", () => {
    it("solo conserva como conflicto el choque de horario", () => {
        const base = { fullName: "Ana Pérez", status: "activo", weeklyHours: 10, maxWeeklyHours: 30 };
        const rows = parseCandidates([
            { ...base, id: "a", conflict: "El docente está de licencia" },
            { ...base, id: "b", conflict: "Supera el límite de horas semanales" },
            { ...base, id: "c", conflict: "Química · 5° B · Lunes 8:00" },
            { ...base, id: "d", conflict: null },
        ]);
        expect(rows?.map((row) => row.conflict)).toEqual([null, null, "Química · 5° B · Lunes 8:00", null]);
    });
});
