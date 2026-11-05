import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnnouncementCard } from "./announcement-card";
import { NO_AUTHOR_LABEL, NO_COURSE_NAME_LABEL, SCOPE_INSTITUTION_LABEL } from "./announcements-ui";
import type { Announcement } from "./types";

function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
    return {
        id: "a1",
        scope: "institution",
        title: "Reunión de padres",
        body: "Es el viernes.",
        createdAt: "2026-11-04T01:30:00Z",
        author: { id: "u1", fullName: "Ana Pérez" },
        course: null,
        student: null,
        ...overrides,
    };
}

function render(announcement: Announcement) {
    return renderToStaticMarkup(
        <ul>
            <AnnouncementCard announcement={announcement} />
        </ul>,
    );
}

describe("tarjeta de un comunicado de institución", () => {
    const html = render(makeAnnouncement());

    it("muestra título, texto, autoría y fecha en hora de Argentina", () => {
        expect(html).toContain("Reunión de padres");
        expect(html).toContain("Es el viernes.");
        expect(html).toContain("Ana Pérez");
        expect(html).toContain("3 nov 2026, 22:30");
    });

    it("dice a quién va dirigido en texto, no solo con color", () => {
        expect(html).toContain(SCOPE_INSTITUTION_LABEL);
        expect(html).toContain("Para: ");
    });

    it("la fecha va en una etiqueta time con el valor original", () => {
        expect(html).toContain('dateTime="2026-11-04T01:30:00Z"');
    });
});

describe("tarjeta de un comunicado de curso", () => {
    it("muestra el nombre del curso como destinatario", () => {
        const html = render(
            makeAnnouncement({ scope: "course", course: { id: "c1", name: "1.º A" } }),
        );
        expect(html).toContain("1.º A");
        expect(html).not.toContain(SCOPE_INSTITUTION_LABEL);
    });

    it("si Back manda el curso sin nombre, usa el texto provisorio y no se rompe", () => {
        const html = render(
            makeAnnouncement({ scope: "course", course: { id: "c1", name: null } }),
        );
        expect(html).toContain(NO_COURSE_NAME_LABEL);
    });
});

describe("tarjeta de un comunicado de alumno", () => {
    it("muestra «Apellido, Nombre» como destinatario", () => {
        const html = render(
            makeAnnouncement({
                scope: "student",
                student: { id: "s1", firstName: "Luis", lastName: "Gómez" },
            }),
        );
        expect(html).toContain("Gómez, Luis");
    });
});

describe("datos que pueden faltar", () => {
    it("sin nombre de autor muestra el texto provisorio", () => {
        const html = render(makeAnnouncement({ author: { id: "u1", fullName: null } }));
        expect(html).toContain(NO_AUTHOR_LABEL);
    });

    it("con una fecha inválida no muestra la etiqueta time ni queda un punto suelto", () => {
        const html = render(makeAnnouncement({ createdAt: "no es una fecha" }));
        expect(html).not.toContain("<time");
        expect(html).not.toContain("·");
    });
});

describe("seguridad del texto", () => {
    const attack = makeAnnouncement({
        title: "<img src=x onerror=alert(1)>",
        body: "<script>alert(1)</script>\nSegunda línea",
    });
    const html = render(attack);

    it("el HTML del título y del texto se escapa: nunca se interpreta", () => {
        expect(html).not.toContain("<script>");
        expect(html).not.toContain("<img");
        expect(html).toContain("&lt;script&gt;");
        expect(html).toContain("&lt;img");
    });

    it("respeta los saltos de línea del texto", () => {
        expect(html).toContain("whitespace-pre-line");
        expect(html).toContain("\nSegunda línea");
    });
});

describe("estilos", () => {
    it("solo usa clases del proyecto (sin colores hexadecimales ni valores sueltos)", () => {
        const html = render(makeAnnouncement());
        expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
        expect(html).not.toContain("[#");
    });
});
