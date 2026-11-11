import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CoursesList } from "./courses-list";
import type { Course } from "./types";

const base: Course = {
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
};

const noop = () => {};
const render = (courses: Course[], total = courses.length) =>
    renderToStaticMarkup(<CoursesList courses={courses} total={total} onEdit={noop} onAssign={noop} onDelete={noop} />);

describe("CoursesList", () => {
    it("tabla y tarjeta con los datos del SDD", () => {
        const html = render([base]);
        expect(html).toContain("5° Año A");
        expect(html).toContain("Mañana");
        expect(html).toContain("32 estudiantes");
        expect(html).toContain("Turno Mañana · 32 estudiantes");
        expect(html).toContain("Tutor: Marta Ruiz");
        expect(html).toContain("Activo");
        expect(html).toContain('href="/cursos/c1"');
        expect(html).toContain("Ver detalle");
        expect(html).toContain("Asignar docente");
    });

    it("lo que Back todavía no manda se ve como —", () => {
        const html = render([{ ...base, studentsCount: null, homeroomTeacher: null, status: null }]);
        expect(html).toContain("Tutor: —");
        expect(html).not.toContain("32 estudiantes");
        expect(html).toContain("Turno Mañana</p>");
    });

    it("pie con el total", () => {
        expect(render([base], 5)).toContain("Mostrando 1 de 5 cursos");
    });

    it("las acciones de la tabla dicen de qué curso son", () => {
        const html = render([base]);
        expect(html).toContain('aria-label="Eliminar 5° Año A"');
        expect(html).toContain('aria-label="Editar 5° Año A"');
    });
});
