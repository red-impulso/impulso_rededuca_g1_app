import { describe, expect, it } from "vitest";
import {
    allowedScopes,
    announcementCourseName,
    announcementStudentName,
    authorLabel,
    buildPayload,
    canPublish,
    coursesPathFor,
    courseLabel,
    emptyForm,
    formatDate,
    isFormDirty,
    scopeLabel,
    validateForm,
} from "./announcements-rules";
import {
    ERROR_BODY_EMPTY,
    ERROR_COURSE,
    ERROR_SCOPE,
    ERROR_TITLE_EMPTY,
    ERROR_TITLE_TOO_LONG,
    NO_AUTHOR_LABEL,
    NO_COURSE_NAME_LABEL,
    NO_STUDENT_NAME_LABEL,
    SCOPE_BADGE_CLASS,
    SCOPE_COURSE_LABEL,
    SCOPE_INSTITUTION_LABEL,
    SCOPE_STUDENT_LABEL,
} from "./announcements-ui";
import type { Announcement, AnnouncementCourse, AnnouncementForm } from "./types";

const courses: AnnouncementCourse[] = [
    { id: "c1", name: "1.º A", year: 1, division: "A", shift: "mañana" },
    { id: "c2", year: 2, division: "B", shift: null },
];

function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
    return {
        id: "a1",
        scope: "institution",
        title: "Título",
        body: "Texto",
        createdAt: "2026-11-03T15:00:00Z",
        author: { id: "u1", fullName: "Ana Pérez" },
        course: null,
        student: null,
        ...overrides,
    };
}

function makeForm(overrides: Partial<AnnouncementForm> = {}): AnnouncementForm {
    return { scope: "course", courseId: "c1", title: "Reunión", body: "Es el viernes.", ...overrides };
}

describe("allowedScopes y canPublish", () => {
    it("admin y director publican en institución y curso", () => {
        expect(allowedScopes("admin")).toEqual(["institution", "course"]);
        expect(allowedScopes("director")).toEqual(["institution", "course"]);
    });

    it("el docente solo publica en curso", () => {
        expect(allowedScopes("teacher")).toEqual(["course"]);
    });

    it("el tutor no publica y no ve el botón", () => {
        expect(allowedScopes("guardian")).toEqual([]);
        expect(canPublish("guardian")).toBe(false);
        expect(canPublish("teacher")).toBe(true);
        expect(canPublish("admin")).toBe(true);
        expect(canPublish("director")).toBe(true);
    });
});

describe("coursesPathFor", () => {
    it("docente /me/courses; admin y director /courses; tutor ninguno", () => {
        expect(coursesPathFor("teacher")).toBe("/me/courses");
        expect(coursesPathFor("admin")).toBe("/courses");
        expect(coursesPathFor("director")).toBe("/courses");
        expect(coursesPathFor("guardian")).toBeNull();
    });
});

describe("courseLabel", () => {
    it("usa el name de Back si viene", () => {
        expect(courseLabel(courses[0])).toBe("1.º A");
    });

    it("si no hay name, arma año y división", () => {
        expect(courseLabel(courses[1])).toBe("2.º B");
    });

    it("sin división queda solo el año", () => {
        expect(courseLabel({ id: "x", year: 3, division: null, shift: null })).toBe("3.º");
    });
});

describe("scopeLabel", () => {
    it("institución", () => {
        expect(scopeLabel(makeAnnouncement())).toBe(SCOPE_INSTITUTION_LABEL);
    });

    it("curso con nombre", () => {
        const a = makeAnnouncement({ scope: "course", course: { id: "c1", name: "1.º A" } });
        expect(scopeLabel(a)).toBe("1.º A");
    });

    it("curso sin nombre (Back manda null)", () => {
        const a = makeAnnouncement({ scope: "course", course: { id: "c1", name: null } });
        expect(scopeLabel(a)).toBe(SCOPE_COURSE_LABEL);
    });

    it("alumno con nombre", () => {
        const a = makeAnnouncement({
            scope: "student",
            student: { id: "s1", firstName: "Luis", lastName: "Gómez" },
        });
        expect(scopeLabel(a)).toBe("Gómez, Luis");
    });

    it("alumno que Back no encontró (nombres vacíos)", () => {
        const a = makeAnnouncement({
            scope: "student",
            student: { id: "s1", firstName: "", lastName: "" },
        });
        expect(scopeLabel(a)).toBe(SCOPE_STUDENT_LABEL);
    });
});

describe("authorLabel y nombres dentro de la tarjeta", () => {
    it("autoría con y sin nombre", () => {
        expect(authorLabel(makeAnnouncement())).toBe("Ana Pérez");
        const sinNombre = makeAnnouncement({ author: { id: "u1", fullName: null } });
        expect(authorLabel(sinNombre)).toBe(NO_AUTHOR_LABEL);
        const vacio = makeAnnouncement({ author: { id: "u1", fullName: "  " } });
        expect(authorLabel(vacio)).toBe(NO_AUTHOR_LABEL);
    });

    it("curso: null si no hay, texto provisorio si no tiene nombre", () => {
        expect(announcementCourseName(makeAnnouncement())).toBeNull();
        const sinNombre = makeAnnouncement({ course: { id: "c1", name: null } });
        expect(announcementCourseName(sinNombre)).toBe(NO_COURSE_NAME_LABEL);
    });

    it("alumno: null si no hay, texto provisorio si vino vacío", () => {
        expect(announcementStudentName(makeAnnouncement())).toBeNull();
        const vacio = makeAnnouncement({ student: { id: "s1", firstName: "", lastName: "" } });
        expect(announcementStudentName(vacio)).toBe(NO_STUDENT_NAME_LABEL);
    });
});

describe("formatDate", () => {
    it("usa la hora de Argentina (a las 01:30 UTC todavía es el día anterior)", () => {
        expect(formatDate("2026-11-04T01:30:00Z")).toBe("3 nov 2026, 22:30");
    });

    it("medianoche de Argentina se ve 00:00 y no 24:00", () => {
        expect(formatDate("2026-11-03T03:00:00Z")).toBe("3 nov 2026, 00:00");
    });

    it("el día no lleva cero adelante", () => {
        expect(formatDate("2026-12-05T15:05:00Z")).toBe("5 dic 2026, 12:05");
    });

    it("una fecha inválida no muestra nada", () => {
        expect(formatDate("no es una fecha")).toBe("");
        expect(formatDate("")).toBe("");
    });
});

describe("emptyForm e isFormDirty", () => {
    it("arranca en curso para todos los roles que publican", () => {
        expect(emptyForm("admin").scope).toBe("course");
        expect(emptyForm("director").scope).toBe("course");
        expect(emptyForm("teacher").scope).toBe("course");
    });

    it("un formulario vacío no cuenta como cambios", () => {
        expect(isFormDirty(emptyForm("admin"), "admin")).toBe(false);
    });

    it("espacios solos no cuentan como cambios", () => {
        expect(isFormDirty({ ...emptyForm("admin"), title: "   " }, "admin")).toBe(false);
    });

    it("escribir o elegir algo sí cuenta", () => {
        expect(isFormDirty({ ...emptyForm("admin"), title: "Hola" }, "admin")).toBe(true);
        expect(isFormDirty({ ...emptyForm("admin"), body: "Hola" }, "admin")).toBe(true);
        expect(isFormDirty({ ...emptyForm("admin"), courseId: "c1" }, "admin")).toBe(true);
        expect(isFormDirty({ ...emptyForm("admin"), scope: "institution" }, "admin")).toBe(true);
    });
});

describe("validateForm", () => {
    it("un formulario correcto no tiene errores", () => {
        expect(validateForm(makeForm(), "teacher", courses)).toEqual({});
    });

    it("el formulario vacío marca título, curso y mensaje", () => {
        const errors = validateForm(emptyForm("teacher"), "teacher", courses);
        expect(errors).toEqual({
            title: ERROR_TITLE_EMPTY,
            courseId: ERROR_COURSE,
            body: ERROR_BODY_EMPTY,
        });
    });

    it("título de 120 caracteres sí; de 121 no", () => {
        expect(validateForm(makeForm({ title: "a".repeat(120) }), "admin", courses).title).toBeUndefined();
        expect(validateForm(makeForm({ title: "a".repeat(121) }), "admin", courses).title).toBe(
            ERROR_TITLE_TOO_LONG,
        );
    });

    it("los espacios de los costados no cuentan para el largo ni para el vacío", () => {
        const justRight = `  ${"a".repeat(120)}  `;
        expect(validateForm(makeForm({ title: justRight }), "admin", courses).title).toBeUndefined();
        expect(validateForm(makeForm({ title: "   " }), "admin", courses).title).toBe(ERROR_TITLE_EMPTY);
    });

    it("un mensaje de solo espacios o saltos de línea está vacío", () => {
        expect(validateForm(makeForm({ body: " \n \n " }), "admin", courses).body).toBe(ERROR_BODY_EMPTY);
    });

    it("el docente no puede elegir institución", () => {
        const errors = validateForm(makeForm({ scope: "institution", courseId: "" }), "teacher", courses);
        expect(errors.scope).toBe(ERROR_SCOPE);
    });

    it("el tutor no puede publicar nada", () => {
        expect(validateForm(makeForm(), "guardian", courses).scope).toBe(ERROR_SCOPE);
    });

    it("en institución no se pide curso", () => {
        const form = makeForm({ scope: "institution", courseId: "" });
        expect(validateForm(form, "admin", courses)).toEqual({});
    });

    it("un curso que no está en la lista permitida es error", () => {
        expect(validateForm(makeForm({ courseId: "otro" }), "teacher", courses).courseId).toBe(ERROR_COURSE);
        expect(validateForm(makeForm(), "teacher", []).courseId).toBe(ERROR_COURSE);
    });
});

describe("buildPayload", () => {
    it("curso: manda scope, courseId, título y texto sin espacios de los costados", () => {
        const form = makeForm({ title: "  Reunión  ", body: "  Es el viernes.  " });
        expect(buildPayload(form, "teacher", courses)).toEqual({
            scope: "course",
            courseId: "c1",
            title: "Reunión",
            body: "Es el viernes.",
        });
    });

    it("institución: no manda courseId aunque haya uno elegido", () => {
        const payload = buildPayload(makeForm({ scope: "institution", courseId: "c1" }), "admin", courses);
        expect(payload).toEqual({ scope: "institution", title: "Reunión", body: "Es el viernes." });
        expect(payload).not.toHaveProperty("courseId");
    });

    it("conserva los saltos de línea del medio", () => {
        const payload = buildPayload(makeForm({ body: "Línea 1\n\nLínea 2" }), "admin", courses);
        expect(payload?.body).toBe("Línea 1\n\nLínea 2");
    });

    it("devuelve null si el formulario no es válido", () => {
        expect(buildPayload(makeForm({ title: "" }), "admin", courses)).toBeNull();
        expect(buildPayload(makeForm({ scope: "institution" }), "teacher", courses)).toBeNull();
    });
});

describe("zona provisoria de UX", () => {
    it("las etiquetas de alcance usan solo clases del proyecto (sin hexadecimales)", () => {
        for (const value of Object.values(SCOPE_BADGE_CLASS)) {
            expect(value).not.toMatch(/#[0-9a-fA-F]{3,8}/);
            expect(value).not.toMatch(/\[/);
        }
    });
});
