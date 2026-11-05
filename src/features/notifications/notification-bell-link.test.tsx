import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotificationBellLink } from "./notification-bell-link";
import { BADGE_CLASS, BELL_ACTIVE_CLASS } from "./notifications-ui";

function render(count: number | null, active = false) {
    return renderToStaticMarkup(<NotificationBellLink count={count} active={active} />);
}

describe("campanita", () => {
    it("lleva a la bandeja", () => {
        expect(render(0)).toContain('href="/notificaciones"');
    });

    it("sin no leídas no muestra contador y se llama «Notificaciones»", () => {
        const html = render(0);
        expect(html).toContain('aria-label="Notificaciones"');
        expect(html).not.toContain(BADGE_CLASS);
    });

    it("mientras no llegó el contador tampoco muestra número", () => {
        const html = render(null);
        expect(html).toContain('aria-label="Notificaciones"');
        expect(html).not.toContain(BADGE_CLASS);
    });

    it("con no leídas muestra el número y lo dice en el nombre accesible", () => {
        const html = render(3);
        expect(html).toContain('aria-label="Notificaciones, 3 sin leer"');
        expect(html).toContain(BADGE_CLASS);
        expect(html).toContain(">3</span>");
    });

    it("más de 99 muestra «99+» pero el nombre accesible dice el número real", () => {
        const html = render(120);
        expect(html).toContain(">99+</span>");
        expect(html).toContain('aria-label="Notificaciones, 120 sin leer"');
    });

    it("en la bandeja queda marcada como página actual", () => {
        const html = render(0, true);
        expect(html).toContain('aria-current="page"');
        expect(html).toContain(BELL_ACTIVE_CLASS);
        expect(render(0, false)).not.toContain("aria-current");
    });

    it("el ícono es decorativo y el área táctil es de 44 px", () => {
        const html = render(0);
        expect(html).toContain('<svg');
        expect(html).toContain('aria-hidden="true"');
        expect(html).toContain("h-11 w-11");
    });

    it("solo usa clases del proyecto (sin colores hexadecimales ni valores sueltos)", () => {
        const html = render(5);
        expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
        expect(html).not.toContain("[#");
    });
});
