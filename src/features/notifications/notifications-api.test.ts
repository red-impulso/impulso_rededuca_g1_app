import { describe, expect, it } from "vitest";
import {
    NOTIFICATIONS_PATH,
    READ_ALL_PATH,
    UNREAD_COUNT_PATH,
    describeLoadError,
    describeMarkAllError,
    describeMarkError,
    markReadPath,
    parseMarkRead,
    parseNotifications,
    parseReadAll,
    parseUnreadCount,
} from "./notifications-api";
import {
    LOAD_ERROR_TEXT,
    MARK_ALL_ERROR_MESSAGE,
    MARK_ALL_OFFLINE_MESSAGE,
    MARK_ERROR_MESSAGE,
    MARK_NOT_FOUND_MESSAGE,
    MARK_OFFLINE_MESSAGE,
    OFFLINE_TEXT,
    SERVER_ERROR_TEXT,
} from "./notifications-ui";

const valid = {
    id: "n1",
    title: "Nueva nota",
    body: "Nueva nota en Matemática",
    readAt: null,
    createdAt: "2026-11-04T15:00:00Z",
};

describe("rutas de Back", () => {
    it("lista, contador y marcar todas", () => {
        expect(NOTIFICATIONS_PATH).toBe("/notifications");
        expect(UNREAD_COUNT_PATH).toBe("/notifications/unread-count");
        expect(READ_ALL_PATH).toBe("/notifications/read-all");
    });

    it("marcar una lleva el id en la ruta, escapado", () => {
        expect(markReadPath("n1")).toBe("/notifications/n1/read");
        expect(markReadPath("a/b")).toBe("/notifications/a%2Fb/read");
    });
});

describe("describeLoadError", () => {
    it("sin respuesta es falta de conexión", () => {
        expect(describeLoadError(0)).toEqual({ kind: "offline", message: OFFLINE_TEXT });
    });

    it("un error del servidor usa el texto propio", () => {
        expect(describeLoadError(500)).toEqual({ kind: "error", message: SERVER_ERROR_TEXT });
        expect(describeLoadError(503).message).toBe(SERVER_ERROR_TEXT);
    });

    it("cualquier otro error usa el texto general, no el técnico de Back", () => {
        expect(describeLoadError(403)).toEqual({ kind: "error", message: LOAD_ERROR_TEXT });
        expect(describeLoadError(null)).toEqual({ kind: "error", message: LOAD_ERROR_TEXT });
    });
});

describe("describeMarkError y describeMarkAllError", () => {
    it("marcar una: sin conexión, 404 y el resto", () => {
        expect(describeMarkError(0)).toEqual({ kind: "offline", message: MARK_OFFLINE_MESSAGE });
        expect(describeMarkError(404)).toEqual({ kind: "error", message: MARK_NOT_FOUND_MESSAGE });
        expect(describeMarkError(500).message).toBe(MARK_ERROR_MESSAGE);
        expect(describeMarkError(null).message).toBe(MARK_ERROR_MESSAGE);
    });

    it("marcar todas: sin conexión y el resto", () => {
        expect(describeMarkAllError(0)).toEqual({ kind: "offline", message: MARK_ALL_OFFLINE_MESSAGE });
        expect(describeMarkAllError(500)).toEqual({ kind: "error", message: MARK_ALL_ERROR_MESSAGE });
        expect(describeMarkAllError(null).message).toBe(MARK_ALL_ERROR_MESSAGE);
    });
});

describe("parseNotifications", () => {
    it("convierte la forma real de GET /notifications", () => {
        expect(parseNotifications([valid])).toEqual([valid]);
    });

    it("una leída conserva su fecha de lectura", () => {
        const list = parseNotifications([{ ...valid, readAt: "2026-11-04T16:00:00Z" }]);
        expect(list?.[0].readAt).toBe("2026-11-04T16:00:00Z");
    });

    it("una lista vacía es una lista vacía (no un error)", () => {
        expect(parseNotifications([])).toEqual([]);
    });

    it("algo que no es una lista devuelve null", () => {
        expect(parseNotifications(null)).toBeNull();
        expect(parseNotifications({})).toBeNull();
        expect(parseNotifications("hola")).toBeNull();
        expect(parseNotifications(undefined)).toBeNull();
    });

    it("conserva el orden que manda Back", () => {
        const list = parseNotifications([{ ...valid, id: "nueva" }, { ...valid, id: "vieja" }]);
        expect(list?.map((item) => item.id)).toEqual(["nueva", "vieja"]);
    });

    it("sin cuerpo queda vacío; readAt raro queda como no leída", () => {
        const list = parseNotifications([{ ...valid, body: undefined, readAt: 5 }]);
        expect(list?.[0].body).toBe("");
        expect(list?.[0].readAt).toBeNull();
    });

    it("saltea los elementos rotos y deja los buenos", () => {
        const list = parseNotifications([
            null,
            "texto",
            { ...valid, id: "" },
            { ...valid, title: 5 },
            { ...valid, createdAt: undefined },
            { ...valid, id: "buena" },
        ]);
        expect(list?.map((item) => item.id)).toEqual(["buena"]);
    });

    it("no inventa HTML: el texto queda tal cual (la pantalla lo muestra como texto)", () => {
        const list = parseNotifications([{ ...valid, body: "<b>hola</b>" }]);
        expect(list?.[0].body).toBe("<b>hola</b>");
    });
});

describe("parseUnreadCount, parseReadAll y parseMarkRead", () => {
    it("contador de no leídas", () => {
        expect(parseUnreadCount({ count: 3 })).toBe(3);
        expect(parseUnreadCount({ count: 0 })).toBe(0);
        expect(parseUnreadCount({ count: -1 })).toBeNull();
        expect(parseUnreadCount({ count: 1.5 })).toBeNull();
        expect(parseUnreadCount({ count: "3" })).toBeNull();
        expect(parseUnreadCount(null)).toBeNull();
        expect(parseUnreadCount([])).toBeNull();
    });

    it("cuántas marcó read-all", () => {
        expect(parseReadAll({ updated: 4 })).toBe(4);
        expect(parseReadAll({ updated: 0 })).toBe(0);
        expect(parseReadAll({})).toBeNull();
        expect(parseReadAll(undefined)).toBeNull();
    });

    it("confirmación de marcar una", () => {
        expect(parseMarkRead({ success: true })).toBe(true);
        expect(parseMarkRead({ success: false })).toBe(false);
        expect(parseMarkRead({})).toBe(false);
        expect(parseMarkRead(null)).toBe(false);
    });
});
