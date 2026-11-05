import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotificationCard } from "./notification-card";
import {
    MARKING_LABEL,
    MARK_ONE_LABEL,
    READ_CARD_CLASS,
    UNREAD_CARD_CLASS,
    UNREAD_LABEL,
} from "./notifications-ui";
import type { NotificationItem } from "./types";

// 4 nov 2026, 12:00 en Argentina
const NOW = new Date("2026-11-04T15:00:00Z");

function makeItem(overrides: Partial<NotificationItem> = {}): NotificationItem {
    return {
        id: "n1",
        title: "Nueva nota",
        body: "Nueva nota en Matemática",
        readAt: null,
        createdAt: "2026-11-04T14:15:00Z",
        ...overrides,
    };
}

function render(item: NotificationItem, pending = false) {
    return renderToStaticMarkup(
        <ul>
            <NotificationCard item={item} now={NOW} pending={pending} onOpen={() => {}} onMarkRead={() => {}} />
        </ul>,
    );
}

describe("notificación sin leer", () => {
    const html = render(makeItem());

    it("muestra título, texto y hace cuánto llegó", () => {
        expect(html).toContain("Nueva nota");
        expect(html).toContain("Nueva nota en Matemática");
        expect(html).toContain("Hace 45 minutos");
        expect(html).toContain('dateTime="2026-11-04T14:15:00Z"');
    });

    it("dice «No leído» en texto, no solo con el punto de color", () => {
        expect(html).toContain(UNREAD_LABEL);
        expect(html).toContain(UNREAD_CARD_CLASS);
    });

    it("tiene el botón «Marcar leída» de 44 px de alto", () => {
        expect(html).toContain(MARK_ONE_LABEL);
        expect(html).toContain("h-11");
    });

    it("mientras se marca, el botón dice «Marcando…» y queda deshabilitado", () => {
        const pending = render(makeItem(), true);
        expect(pending).toContain(MARKING_LABEL);
        expect(pending).toContain("disabled");
    });
});

describe("notificación leída", () => {
    const html = render(makeItem({ readAt: "2026-11-04T14:30:00Z" }));

    it("no dice «No leído» ni muestra el botón", () => {
        expect(html).not.toContain(UNREAD_LABEL);
        expect(html).not.toContain(MARK_ONE_LABEL);
        expect(html).toContain(READ_CARD_CLASS);
    });
});

describe("destino al tocarla", () => {
    it("cada título lleva a su pantalla", () => {
        expect(render(makeItem({ title: "Nuevo comunicado" }))).toContain('href="/comunicados"');
        expect(render(makeItem({ title: "Inasistencia registrada" }))).toContain('href="/hijos"');
        expect(render(makeItem({ title: "Otra cosa" }))).toContain('href="/notificaciones"');
    });
});

describe("datos que pueden faltar", () => {
    it("sin texto muestra solo el título", () => {
        const html = render(makeItem({ body: "" }));
        expect(html).toContain("Nueva nota");
        expect(html).not.toContain("whitespace-pre-line");
    });

    it("con una fecha inválida no muestra la etiqueta time", () => {
        expect(render(makeItem({ createdAt: "no es fecha" }))).not.toContain("<time");
    });
});

describe("seguridad del texto", () => {
    it("el HTML del título y del texto se escapa: nunca se interpreta", () => {
        const html = render(makeItem({ title: "<img src=x onerror=alert(1)>", body: "<script>alert(1)</script>" }));
        expect(html).not.toContain("<script>");
        expect(html).not.toContain("<img");
        expect(html).toContain("&lt;script&gt;");
    });
});

describe("estilos", () => {
    it("solo usa clases del proyecto (sin colores hexadecimales ni valores sueltos)", () => {
        const html = render(makeItem());
        expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
        expect(html).not.toContain("[#");
    });
});
