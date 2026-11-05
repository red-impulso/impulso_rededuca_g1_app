import { describe, expect, it } from "vitest";
import {
    ANNOUNCEMENTS_PATH,
    describeLoadError,
    describePublishError,
    parseAnnouncements,
    parseCourses,
} from "./announcements-api";
import {
    LOAD_ERROR_TEXT,
    OFFLINE_TEXT,
    PUBLISH_ERROR_MESSAGE,
    PUBLISH_FORBIDDEN_MESSAGE,
    PUBLISH_INVALID_MESSAGE,
    PUBLISH_NOT_FOUND_MESSAGE,
    PUBLISH_OFFLINE_MESSAGE,
    SERVER_ERROR_TEXT,
} from "./announcements-ui";

const valid = {
    id: "a1",
    scope: "course",
    title: "Reunión",
    body: "Es el viernes.",
    createdAt: "2026-11-03T15:00:00Z",
    author: { id: "u1", fullName: "Ana Pérez" },
    course: { id: "c1", name: "1.º A" },
    student: null,
};

describe("ANNOUNCEMENTS_PATH", () => {
    it("es la ruta de Back", () => {
        expect(ANNOUNCEMENTS_PATH).toBe("/announcements");
    });
});

describe("describeLoadError", () => {
    it("sin respuesta es falta de conexión", () => {
        expect(describeLoadError(0)).toEqual({ kind: "offline", message: OFFLINE_TEXT });
    });

    it("un error del servidor usa el texto de UX", () => {
        expect(describeLoadError(500)).toEqual({ kind: "error", message: SERVER_ERROR_TEXT });
        expect(describeLoadError(503).message).toBe(SERVER_ERROR_TEXT);
    });

    it("cualquier otro error usa el texto general, no el técnico de Back", () => {
        expect(describeLoadError(403)).toEqual({ kind: "error", message: LOAD_ERROR_TEXT });
        expect(describeLoadError(null)).toEqual({ kind: "error", message: LOAD_ERROR_TEXT });
    });
});

describe("describePublishError", () => {
    it("sin respuesta pide revisar la lista antes de reintentar", () => {
        expect(describePublishError(0)).toEqual({ kind: "offline", message: PUBLISH_OFFLINE_MESSAGE });
    });

    it("un texto propio por cada código conocido", () => {
        expect(describePublishError(403).message).toBe(PUBLISH_FORBIDDEN_MESSAGE);
        expect(describePublishError(404).message).toBe(PUBLISH_NOT_FOUND_MESSAGE);
        expect(describePublishError(400).message).toBe(PUBLISH_INVALID_MESSAGE);
    });

    it("el resto (500, 401, error desconocido) usa el texto general", () => {
        expect(describePublishError(500)).toEqual({ kind: "error", message: PUBLISH_ERROR_MESSAGE });
        expect(describePublishError(401).message).toBe(PUBLISH_ERROR_MESSAGE);
        expect(describePublishError(null).message).toBe(PUBLISH_ERROR_MESSAGE);
    });
});

describe("parseAnnouncements", () => {
    it("convierte la forma real de GET /announcements", () => {
        expect(parseAnnouncements([valid])).toEqual([valid]);
    });

    it("una lista vacía es una lista vacía (no un error)", () => {
        expect(parseAnnouncements([])).toEqual([]);
    });

    it("algo que no es una lista devuelve null", () => {
        expect(parseAnnouncements(null)).toBeNull();
        expect(parseAnnouncements({})).toBeNull();
        expect(parseAnnouncements("hola")).toBeNull();
        expect(parseAnnouncements(undefined)).toBeNull();
    });

    it("conserva el orden que manda Back", () => {
        const list = parseAnnouncements([{ ...valid, id: "nuevo" }, { ...valid, id: "viejo" }]);
        expect(list?.map((item) => item.id)).toEqual(["nuevo", "viejo"]);
    });

    it("autoría y curso con null se conservan como null", () => {
        const list = parseAnnouncements([
            { ...valid, author: { id: "u1", fullName: null }, course: { id: "c1", name: null } },
        ]);
        expect(list?.[0].author.fullName).toBeNull();
        expect(list?.[0].course).toEqual({ id: "c1", name: null });
    });

    it("sin autoría completa un autor vacío en vez de romper", () => {
        const list = parseAnnouncements([{ ...valid, author: undefined }]);
        expect(list?.[0].author).toEqual({ id: "", fullName: null });
    });

    it("un comunicado de alumno trae el nombre del alumno", () => {
        const list = parseAnnouncements([
            {
                ...valid,
                scope: "student",
                course: null,
                student: { id: "s1", firstName: "Luis", lastName: "Gómez" },
            },
        ]);
        expect(list?.[0].student).toEqual({ id: "s1", firstName: "Luis", lastName: "Gómez" });
    });

    it("saltea los elementos rotos y deja los buenos", () => {
        const list = parseAnnouncements([
            null,
            "texto",
            { ...valid, id: "" },
            { ...valid, title: 5 },
            { ...valid, createdAt: undefined },
            { ...valid, scope: "otro" },
            { ...valid, id: "bueno" },
        ]);
        expect(list?.map((item) => item.id)).toEqual(["bueno"]);
    });

    it("no inventa HTML: el texto queda tal cual (la pantalla lo muestra como texto)", () => {
        const list = parseAnnouncements([{ ...valid, body: "<script>alert(1)</script>\nLínea 2" }]);
        expect(list?.[0].body).toBe("<script>alert(1)</script>\nLínea 2");
    });
});

describe("parseCourses", () => {
    it("convierte la forma de GET /courses (con name)", () => {
        expect(parseCourses([{ id: "c1", name: "1.º A", year: 1, division: "A", shift: "mañana" }])).toEqual([
            { id: "c1", name: "1.º A", year: 1, division: "A", shift: "mañana" },
        ]);
    });

    it("convierte la forma de GET /me/courses (sin name)", () => {
        const courses = parseCourses([{ id: "c1", year: 1, division: "A", shift: "tarde" }]);
        expect(courses).toEqual([{ id: "c1", year: 1, division: "A", shift: "tarde" }]);
        expect(courses?.[0]).not.toHaveProperty("name");
    });

    it("división y turno que faltan quedan en null", () => {
        expect(parseCourses([{ id: "c1", year: 2 }])).toEqual([
            { id: "c1", year: 2, division: null, shift: null },
        ]);
    });

    it("un name vacío o null se ignora", () => {
        expect(parseCourses([{ id: "c1", name: "", year: 1 }])?.[0]).not.toHaveProperty("name");
        expect(parseCourses([{ id: "c1", name: null, year: 1 }])?.[0]).not.toHaveProperty("name");
    });

    it("algo que no es una lista devuelve null; una lista vacía, lista vacía", () => {
        expect(parseCourses({})).toBeNull();
        expect(parseCourses(null)).toBeNull();
        expect(parseCourses([])).toEqual([]);
    });

    it("saltea cursos sin id o sin año", () => {
        const courses = parseCourses([{ year: 1 }, { id: "c1" }, { id: "", year: 1 }, "x", { id: "ok", year: 3 }]);
        expect(courses?.map((course) => course.id)).toEqual(["ok"]);
    });
});
