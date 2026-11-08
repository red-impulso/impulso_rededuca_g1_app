import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotificationsList } from "./notifications-list";
import { MARKING_LABEL, TODAY_LABEL, YESTERDAY_LABEL } from "./notifications-ui";
import type { NotificationItem } from "./types";

// 4 nov 2026, 12:00 en Argentina
const NOW = new Date("2026-11-04T15:00:00Z");

function makeItem(overrides: Partial<NotificationItem> = {}): NotificationItem {
    return {
        id: "n1",
        title: "Nueva nota",
        body: "Nueva nota en Matemática",
        type: "grade",
        studentId: null,
        readAt: null,
        createdAt: "2026-11-04T14:00:00Z",
        ...overrides,
    };
}

function render(items: NotificationItem[], pendingIds: string[] = []) {
    return renderToStaticMarkup(
        <NotificationsList
            items={items}
            now={NOW}
            pendingIds={pendingIds}
            refreshing={false}
            onOpen={() => {}}
            onMarkRead={() => {}}
        />,
    );
}

describe("bandeja agrupada por día", () => {
    const html = render([
        makeItem({ id: "a", title: "Nuevo comunicado" }),
        // 3 nov 22:30 en Argentina
        makeItem({ id: "b", title: "Inasistencia registrada", createdAt: "2026-11-04T01:30:00Z" }),
        makeItem({ id: "c", title: "Nueva nota", createdAt: "2026-11-01T18:00:00Z" }),
    ]);

    it("muestra Hoy, Ayer y la fecha, en ese orden", () => {
        const today = html.indexOf(TODAY_LABEL);
        const yesterday = html.indexOf(YESTERDAY_LABEL);
        const older = html.indexOf("1 nov 2026");
        expect(today).toBeGreaterThan(-1);
        expect(yesterday).toBeGreaterThan(today);
        expect(older).toBeGreaterThan(yesterday);
    });

    it("cada grupo es una sección con su título", () => {
        expect(html).toContain('aria-labelledby="notificaciones-2026-11-04"');
        expect(html).toContain('id="notificaciones-2026-11-04"');
        expect((html.match(/<section/g) ?? []).length).toBe(3);
    });

    it("de otro día muestra la hora en vez de «Hace…»", () => {
        expect(html).toContain("22:30");
    });
});

describe("marcando como leídas", () => {
    it("solo la que se está marcando dice «Marcando…»", () => {
        const html = render([makeItem({ id: "a" }), makeItem({ id: "b" })], ["b"]);
        expect((html.match(new RegExp(MARKING_LABEL, "g")) ?? []).length).toBe(1);
    });
});
