import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CourseDetail } from "./course-detail";
import type { SectionState } from "./course-detail";
import type { Course, CourseAssignment, StudentsPreview } from "./types";

const course: Course = {
    id: "c1",
    name: "5° A",
    year: 5,
    division: "A",
    shift: "morning",
    schoolYear: 2027,
    classroom: "Aula 12",
    status: "active",
    studentsCount: 32,
    homeroomTeacher: null,
};

const subjects: CourseAssignment[] = [
    { id: "s1", name: "Matemática", weeklyHours: 5, teacher: { id: "t1", fullName: "Juan Pérez" } },
    { id: "s2", name: "Física", weeklyHours: 3, teacher: { id: "t1", fullName: "Juan Pérez" } },
    { id: "s3", name: "Lengua", weeklyHours: 4, teacher: null },
];

const noop = () => {};
function render(
    assignments: SectionState<CourseAssignment[]> = { status: "ready", data: subjects },
    students: SectionState<StudentsPreview> = { status: "ready", data: { total: 32, lastNames: ["Aguirre", "Benítez", "Cabrera"] } },
    value: Course = course,
) {
    return renderToStaticMarkup(
        <CourseDetail
            course={value}
            assignments={assignments}
            students={students}
            onRetryAssignments={noop}
            onRetryStudents={noop}
            onEdit={noop}
            onAssign={noop}
        />,
    );
}

describe("CourseDetail", () => {
    it("título y filas del SDD", () => {
        const html = render();
        expect(html).toContain("Detalle de curso · 5° Año A");
        expect(html).toContain("Aula 12");
        expect(html).toContain("Matemática, Física, Lengua");
        // Docente repetido una sola vez
        expect(html).toContain("<dd class=\"min-w-0 text-sm break-words text-ink\">Juan Pérez</dd>");
        expect(html).toContain("32 · Aguirre, Benítez, Cabrera…");
        expect(html).toContain('href="/alumnos?curso=c1"');
    });

    it("cargando y error por dato, con Reintentar", () => {
        const html = render({ status: "loading" }, { status: "error", message: "Sin conexión." });
        expect(html).toContain("Cargando…");
        expect(html).toContain("Sin conexión.");
        expect(html).toContain("Reintentar");
    });

    it("sin aula ni materias → —", () => {
        const html = render({ status: "ready", data: [] }, undefined, { ...course, classroom: null });
        expect(html.match(/>—</g)?.length).toBeGreaterThanOrEqual(3);
    });
});
