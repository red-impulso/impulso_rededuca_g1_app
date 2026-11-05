import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnnouncementFormFields } from "./announcement-form-fields";
import {
    COURSES_ERROR_TEXT,
    COURSES_LOADING_TEXT,
    COURSE_PLACEHOLDER,
    FORM_SUBMIT_LABEL,
    NO_COURSES_TEXT,
    PUBLISHING_LABEL,
    TEACHER_SCOPE_NOTE,
} from "./announcements-ui";
import type { AnnouncementCourse, AnnouncementForm } from "./types";

const courses: AnnouncementCourse[] = [
    { id: "c1", name: "1.º A", year: 1, division: "A", shift: "mañana" },
    { id: "c2", year: 2, division: "B", shift: null },
];

const noop = () => {};

function render(props: Partial<Parameters<typeof AnnouncementFormFields>[0]> = {}) {
    const form: AnnouncementForm = { scope: "course", courseId: "", title: "", body: "" };
    return renderToStaticMarkup(
        <AnnouncementFormFields
            role="admin"
            form={form}
            errors={{}}
            coursesStatus="ready"
            courses={courses}
            publishing={false}
            publishError={null}
            onChange={noop}
            onBlur={noop}
            onSubmit={noop}
            onCancel={noop}
            onRetryCourses={noop}
            {...props}
        />,
    );
}

function countOf(html: string, text: string): number {
    return html.split(text).length - 1;
}

describe("formulario vacío de un admin", () => {
    const html = render();

    it("tiene título con contador, alcance, curso, mensaje y botón de publicar", () => {
        expect(html).toContain("0/120");
        expect(html).toContain("Ej.: Reunión de padres de 3.º B");
        expect(html).toContain("Toda la institución");
        expect(html).toContain("Un curso");
        expect(html).toContain(COURSE_PLACEHOLDER);
        expect(html).toContain("Mensaje");
        expect(html).toContain(FORM_SUBMIT_LABEL);
    });

    it("el alcance es un grupo de dos opciones y «curso» viene elegido", () => {
        expect(countOf(html, 'type="radio"')).toBe(2);
        expect(countOf(html, 'checked=""')).toBe(1);
    });

    it("lista los cursos, con el turno cuando lo hay", () => {
        expect(html).toContain("1.º A · mañana");
        expect(html).toContain(">2.º B<");
    });

    it("no muestra ningún error ni marca campos inválidos", () => {
        expect(html).not.toContain('role="alert"');
        expect(html).not.toContain("aria-invalid");
    });

    it("el botón de publicar está habilitado (así se ven los errores al tocarlo)", () => {
        expect(html).not.toContain('disabled=""');
    });
});

describe("formulario de un docente", () => {
    const html = render({ role: "teacher" });

    it("no ofrece elegir alcance: solo explica que publica en un curso", () => {
        expect(countOf(html, 'type="radio"')).toBe(0);
        expect(html).toContain(TEACHER_SCOPE_NOTE);
    });

    it("igual pide el curso", () => {
        expect(html).toContain(COURSE_PLACEHOLDER);
    });
});

describe("alcance institución", () => {
    it("no pide curso", () => {
        const html = render({ form: { scope: "institution", courseId: "", title: "", body: "" } });
        expect(html).not.toContain(COURSE_PLACEHOLDER);
        expect(html).not.toContain("<select");
    });
});

describe("errores", () => {
    const html = render({
        errors: { title: "Escribí un título.", courseId: "Elegí un curso.", body: "El mensaje no puede estar vacío." },
    });

    it("muestra cada error con su texto y role alert", () => {
        for (const text of ["Escribí un título.", "Elegí un curso.", "El mensaje no puede estar vacío."]) {
            expect(html).toContain(text);
        }
        expect(countOf(html, 'role="alert"')).toBe(3);
    });

    it("marca los campos como inválidos y los vincula con su error", () => {
        expect(countOf(html, 'aria-invalid="true"')).toBe(3);
        expect(html).toContain("announcement-title-error");
        expect(html).toContain('id="announcement-title-error"');
        expect(html).toContain('id="announcement-body-error"');
        expect(html).toContain("border-error");
    });

    it("un título que se pasa de 120 muestra el contador en rojo y con texto", () => {
        const long = render({ form: { scope: "course", courseId: "", title: "a".repeat(121), body: "" } });
        expect(long).toContain("121/120");
        expect(long).toContain("text-error");
    });
});

describe("cursos", () => {
    it("mientras cargan dice que están cargando y no muestra la lista", () => {
        const html = render({ coursesStatus: "loading", courses: [] });
        expect(html).toContain(COURSES_LOADING_TEXT);
        expect(html).not.toContain("<select");
    });

    it("si fallan muestra el error y el botón Reintentar", () => {
        const html = render({ coursesStatus: "error", courses: [] });
        expect(html).toContain(COURSES_ERROR_TEXT);
        expect(html).toContain("Reintentar");
    });

    it("si no tiene cursos asignados lo dice", () => {
        const html = render({ role: "teacher", coursesStatus: "ready", courses: [] });
        expect(html).toContain(NO_COURSES_TEXT);
        expect(html).not.toContain("<select");
    });
});

describe("publicando", () => {
    it("bloquea los campos y los botones y cambia el texto del botón", () => {
        const html = render({ publishing: true });
        expect(html).toContain(PUBLISHING_LABEL);
        expect(html).not.toContain(FORM_SUBMIT_LABEL);
        // título, curso, mensaje, grupo de alcance, cancelar y publicar
        expect(countOf(html, 'disabled=""')).toBeGreaterThan(4);
    });
});

describe("error al publicar", () => {
    it("sin conexión va en amarillo", () => {
        const html = render({ publishError: { kind: "offline", message: "Sin conexión." } });
        expect(html).toContain("Sin conexión.");
        expect(html).toContain("bg-warning-bg");
    });

    it("otro error va en rojo", () => {
        const html = render({ publishError: { kind: "error", message: "No pudimos publicar." } });
        expect(html).toContain("bg-error-bg");
    });
});

describe("estilos", () => {
    it("usa solo clases del proyecto (sin hexadecimales)", () => {
        const html = render();
        expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
        expect(html).not.toContain("[#");
    });
});
