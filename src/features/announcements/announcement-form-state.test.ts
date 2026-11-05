import { describe, expect, it } from "vitest";
import {
    FIELD_ORDER,
    confirmDescription,
    fieldId,
    firstInvalidField,
    pickVisibleErrors,
    titleCounter,
} from "./announcement-form-state";
import { CONFIRM_PUBLISH_INSTITUTION, SCOPE_COURSE_LABEL } from "./announcements-ui";
import type { AnnouncementCourse, AnnouncementForm } from "./types";

const courses: AnnouncementCourse[] = [
    { id: "c1", name: "1.º A", year: 1, division: "A", shift: "mañana" },
    { id: "c2", year: 2, division: "B", shift: null },
];

function makeForm(overrides: Partial<AnnouncementForm> = {}): AnnouncementForm {
    return { scope: "course", courseId: "c1", title: "Reunión", body: "Texto", ...overrides };
}

describe("fieldId", () => {
    it("cada campo tiene un id distinto", () => {
        const ids = FIELD_ORDER.map(fieldId);
        expect(new Set(ids).size).toBe(FIELD_ORDER.length);
        expect(fieldId("title")).toBe("announcement-title");
    });
});

describe("pickVisibleErrors", () => {
    const errors = { title: "T", courseId: "C", body: "B" };

    it("al empezar no muestra ningún error", () => {
        expect(pickVisibleErrors(errors, {}, false)).toEqual({});
    });

    it("muestra solo el error de los campos que ya se tocaron", () => {
        expect(pickVisibleErrors(errors, { title: true }, false)).toEqual({ title: "T" });
        expect(pickVisibleErrors(errors, { title: true, body: true }, false)).toEqual({ title: "T", body: "B" });
    });

    it("después de intentar enviar muestra todos", () => {
        expect(pickVisibleErrors(errors, {}, true)).toEqual(errors);
    });

    it("un campo tocado que está bien no muestra nada", () => {
        expect(pickVisibleErrors({}, { title: true }, true)).toEqual({});
    });
});

describe("firstInvalidField", () => {
    it("sin errores devuelve null", () => {
        expect(firstInvalidField({})).toBeNull();
    });

    it("con el formulario vacío el foco va al título", () => {
        expect(firstInvalidField({ body: "B", courseId: "C", title: "T" })).toBe("title");
    });

    it("sigue el orden de la pantalla: curso antes que mensaje", () => {
        expect(firstInvalidField({ body: "B", courseId: "C" })).toBe("courseId");
        expect(firstInvalidField({ body: "B" })).toBe("body");
    });
});

describe("titleCounter", () => {
    it("cuenta sin los espacios de los costados", () => {
        expect(titleCounter("")).toEqual({ text: "0/120", over: false });
        expect(titleCounter("  Hola  ")).toEqual({ text: "4/120", over: false });
    });

    it("120 está bien; 121 se pasa", () => {
        expect(titleCounter("a".repeat(120)).over).toBe(false);
        expect(titleCounter("a".repeat(121))).toEqual({ text: "121/120", over: true });
    });
});

describe("confirmDescription", () => {
    it("institución: avisa que lo ve toda la institución y que no se puede editar", () => {
        expect(confirmDescription(makeForm({ scope: "institution" }), courses)).toBe(CONFIRM_PUBLISH_INSTITUTION);
        expect(CONFIRM_PUBLISH_INSTITUTION).toContain("no se puede editar ni borrar");
    });

    it("curso: nombra el curso elegido (con name o armado)", () => {
        expect(confirmDescription(makeForm({ courseId: "c1" }), courses)).toContain("1.º A");
        expect(confirmDescription(makeForm({ courseId: "c2" }), courses)).toContain("2.º B");
    });

    it("curso que no está en la lista: texto genérico, sin romperse", () => {
        expect(confirmDescription(makeForm({ courseId: "otro" }), courses)).toContain(SCOPE_COURSE_LABEL);
    });
});
