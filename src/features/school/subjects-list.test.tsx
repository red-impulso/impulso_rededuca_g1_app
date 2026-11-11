import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SubjectDetail } from "./subject-detail";
import { SubjectsList } from "./subjects-list";
import type { Subject } from "./types";

const subject: Subject = {
    id: "s1",
    name: "Matemática",
    course: { id: "c1", name: "5° A", year: 5, division: "A", shift: "morning", schoolYear: 2027 },
    teacher: { id: "t1", fullName: "Juan Pérez" },
    weeklyHours: 5,
    description: null,
    status: "active",
    studentsCount: null,
    updatedAt: null,
};
const noop = () => {};

describe("SubjectsList", () => {
    it("tabla y tarjeta del SDD", () => {
        const html = renderToStaticMarkup(<SubjectsList subjects={[subject]} total={4} onEdit={noop} onAssign={noop} onDelete={noop} />);
        expect(html).toContain("Prof. Juan Pérez");
        expect(html).toContain("5 h<");
        expect(html).toContain("5° Año A · 5 h semanales");
        expect(html).toContain('href="/materias/s1"');
        expect(html).toContain("Mostrando 1 de 4 materias");
    });

    it("sin curso no se puede asignar docente", () => {
        const html = renderToStaticMarkup(<SubjectsList subjects={[{ ...subject, course: null }]} total={1} onEdit={noop} onAssign={noop} onDelete={noop} />);
        expect(html).toMatch(/disabled=""[^>]*aria-label="Asignar docente a Matemática"/);
    });
});

describe("SubjectDetail", () => {
    it("título, filas y acciones", () => {
        const html = renderToStaticMarkup(<SubjectDetail subject={subject} onEdit={noop} onChangeTeacher={noop} onDeactivate={noop} />);
        expect(html).toContain("Detalle de materia · Matemática");
        expect(html).toContain("Docente responsable");
        expect(html).toContain("5 h semanales");
        expect(html).toContain('href="/cursos/c1"');
        expect(html).toContain("Cambiar docente");
        expect(html).toContain("Desactivar");
    });

    it("materia inactiva: Desactivar deshabilitado", () => {
        const html = renderToStaticMarkup(<SubjectDetail subject={{ ...subject, status: "inactive" }} onEdit={noop} onChangeTeacher={noop} onDeactivate={noop} />);
        expect(html).toMatch(/disabled=""[^>]*>Desactivar</);
    });
});
