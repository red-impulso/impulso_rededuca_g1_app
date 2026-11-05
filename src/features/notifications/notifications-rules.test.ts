import { describe, expect, it } from "vitest";
import {
    adjustCount,
    badgeText,
    countUnread,
    dayInArgentina,
    groupByDay,
    isUnread,
    markAllAsRead,
    markOneAsRead,
    notificationHref,
    restoreUnread,
    timeAgo,
} from "./notifications-rules";
import { JUST_NOW_LABEL, NOTIFICATIONS_HREF, TODAY_LABEL, YESTERDAY_LABEL, bellAriaLabel } from "./notifications-ui";
import type { NotificationItem } from "./types";

function makeItem(overrides: Partial<NotificationItem> = {}): NotificationItem {
    return {
        id: "n1",
        title: "Nueva nota",
        body: "Nueva nota en Matemática",
        readAt: null,
        createdAt: "2026-11-04T15:00:00Z",
        ...overrides,
    };
}

// 4 nov 2026, 12:00 en Argentina (UTC-3)
const NOW = new Date("2026-11-04T15:00:00Z");

describe("badgeText", () => {
    it("sin no leídas no hay contador", () => {
        expect(badgeText(0)).toBe("");
        expect(badgeText(-2)).toBe("");
        expect(badgeText(Number.NaN)).toBe("");
    });

    it("de 1 a 99 muestra el número", () => {
        expect(badgeText(1)).toBe("1");
        expect(badgeText(99)).toBe("99");
    });

    it("más de 99 muestra 99+", () => {
        expect(badgeText(100)).toBe("99+");
        expect(badgeText(1500)).toBe("99+");
    });
});

describe("bellAriaLabel", () => {
    it("dice cuántas hay sin leer (no solo el color)", () => {
        expect(bellAriaLabel(0)).toBe("Notificaciones");
        expect(bellAriaLabel(3)).toBe("Notificaciones, 3 sin leer");
        expect(bellAriaLabel(150)).toBe("Notificaciones, 150 sin leer");
    });
});

describe("isUnread y countUnread", () => {
    it("no leída es la que tiene readAt en null", () => {
        expect(isUnread(makeItem())).toBe(true);
        expect(isUnread(makeItem({ readAt: "2026-11-04T16:00:00Z" }))).toBe(false);
    });

    it("cuenta solo las no leídas", () => {
        const items = [makeItem({ id: "a" }), makeItem({ id: "b", readAt: "2026-11-04T16:00:00Z" }), makeItem({ id: "c" })];
        expect(countUnread(items)).toBe(2);
        expect(countUnread([])).toBe(0);
    });
});

describe("dayInArgentina", () => {
    it("usa la hora de Argentina, no la de UTC", () => {
        // 4 nov 01:30 UTC = 3 nov 22:30 en Argentina
        expect(dayInArgentina(new Date("2026-11-04T01:30:00Z"))).toBe("2026-11-03");
        expect(dayInArgentina(new Date("2026-11-04T03:00:00Z"))).toBe("2026-11-04");
    });

    it("una fecha inválida da vacío", () => {
        expect(dayInArgentina(new Date("no es fecha"))).toBe("");
    });
});

describe("groupByDay", () => {
    it("agrupa en Hoy, Ayer y fecha, en el orden de Back", () => {
        const groups = groupByDay(
            [
                makeItem({ id: "hoy1", createdAt: "2026-11-04T14:00:00Z" }),
                makeItem({ id: "hoy2", createdAt: "2026-11-04T03:30:00Z" }),
                makeItem({ id: "ayer", createdAt: "2026-11-04T01:30:00Z" }),
                makeItem({ id: "viejo", createdAt: "2026-11-01T18:00:00Z" }),
            ],
            NOW,
        );
        expect(groups.map((group) => group.label)).toEqual([TODAY_LABEL, YESTERDAY_LABEL, "1 nov 2026"]);
        expect(groups.map((group) => group.day)).toEqual(["2026-11-04", "2026-11-03", "2026-11-01"]);
        expect(groups[0].items.map((item) => item.id)).toEqual(["hoy1", "hoy2"]);
        expect(groups[1].items.map((item) => item.id)).toEqual(["ayer"]);
    });

    it("Ayer funciona al cambiar de mes y de año", () => {
        const groups = groupByDay(
            [makeItem({ createdAt: "2026-12-31T20:00:00Z" })],
            new Date("2027-01-01T15:00:00Z"),
        );
        expect(groups[0].label).toBe(YESTERDAY_LABEL);
    });

    it("sin notificaciones no hay grupos; las fechas inválidas se saltean", () => {
        expect(groupByDay([], NOW)).toEqual([]);
        expect(groupByDay([makeItem({ createdAt: "x" })], NOW)).toEqual([]);
    });
});

describe("timeAgo", () => {
    it("menos de un minuto (o fecha futura) es Recién", () => {
        expect(timeAgo("2026-11-04T14:59:30Z", NOW)).toBe(JUST_NOW_LABEL);
        expect(timeAgo("2026-11-04T15:05:00Z", NOW)).toBe(JUST_NOW_LABEL);
    });

    it("minutos y horas de hoy, en singular y plural", () => {
        expect(timeAgo("2026-11-04T14:59:00Z", NOW)).toBe("Hace 1 minuto");
        expect(timeAgo("2026-11-04T14:15:00Z", NOW)).toBe("Hace 45 minutos");
        expect(timeAgo("2026-11-04T14:00:00Z", NOW)).toBe("Hace 1 hora");
        expect(timeAgo("2026-11-04T04:00:00Z", NOW)).toBe("Hace 11 horas");
    });

    it("de otro día muestra la hora de Argentina", () => {
        // 4 nov 01:30 UTC = 3 nov 22:30 en Argentina
        expect(timeAgo("2026-11-04T01:30:00Z", NOW)).toBe("22:30");
    });

    it("una fecha inválida da vacío", () => {
        expect(timeAgo("no es fecha", NOW)).toBe("");
    });
});

describe("notificationHref", () => {
    it("cada título conocido lleva a su pantalla", () => {
        expect(notificationHref(makeItem({ title: "Nuevo comunicado" }))).toBe("/comunicados");
        expect(notificationHref(makeItem({ title: "Nueva nota" }))).toBe("/hijos");
        expect(notificationHref(makeItem({ title: "Inasistencia registrada" }))).toBe("/hijos");
    });

    it("un título desconocido se queda en la bandeja", () => {
        expect(notificationHref(makeItem({ title: "Otra cosa" }))).toBe(NOTIFICATIONS_HREF);
        expect(NOTIFICATIONS_HREF).toBe("/notificaciones");
    });
});

describe("markOneAsRead y markAllAsRead", () => {
    const readAt = "2026-11-04T15:10:00Z";
    const items = [
        makeItem({ id: "a" }),
        makeItem({ id: "b", readAt: "2026-11-01T10:00:00Z" }),
        makeItem({ id: "c" }),
    ];

    it("marca solo la elegida y no toca la lista original", () => {
        const result = markOneAsRead(items, "a", readAt);
        expect(result.map((item) => item.readAt)).toEqual([readAt, "2026-11-01T10:00:00Z", null]);
        expect(items[0].readAt).toBeNull();
    });

    it("una ya leída conserva su fecha; un id desconocido no cambia nada", () => {
        expect(markOneAsRead(items, "b", readAt)[1].readAt).toBe("2026-11-01T10:00:00Z");
        expect(markOneAsRead(items, "zz", readAt)).toEqual(items);
    });

    it("marcar todas deja 0 no leídas y respeta las ya leídas", () => {
        const result = markAllAsRead(items, readAt);
        expect(countUnread(result)).toBe(0);
        expect(result[1].readAt).toBe("2026-11-01T10:00:00Z");
    });
});

describe("restoreUnread", () => {
    it("vuelve a dejar como no leídas solo las de esos ids", () => {
        const readAt = "2026-11-04T15:10:00Z";
        const items = [makeItem({ id: "a", readAt }), makeItem({ id: "b", readAt }), makeItem({ id: "c" })];
        const result = restoreUnread(items, ["a", "c"]);
        expect(result.map((item) => item.readAt)).toEqual([null, readAt, null]);
        expect(items[0].readAt).toBe(readAt);
    });

    it("sin ids no cambia nada", () => {
        const items = [makeItem({ readAt: "2026-11-04T15:10:00Z" })];
        expect(restoreUnread(items, [])).toEqual(items);
    });
});

describe("adjustCount", () => {
    it("suma y resta", () => {
        expect(adjustCount(3, -1)).toBe(2);
        expect(adjustCount(3, 2)).toBe(5);
    });

    it("nunca baja de 0", () => {
        expect(adjustCount(0, -1)).toBe(0);
        expect(adjustCount(1, -5)).toBe(0);
    });

    it("valores raros quedan en 0", () => {
        expect(adjustCount(Number.NaN, 0)).toBe(0);
        expect(adjustCount(-3, 0)).toBe(0);
    });
});
