import { describe, expect, it } from "vitest";
import { getNavItems, navItems } from "./navigation";

describe("getNavItems", () => {
    it("el tutor no ve ítems solo de docentes", () => {
        const teacherOnly = navItems.filter(
            (item) => item.roles.length === 1 && item.roles[0] === "teacher",
        );
        expect(teacherOnly.length).toBeGreaterThan(0);

        const guardianHrefs = getNavItems("guardian").map((item) => item.href);
        for (const item of teacherOnly) {
            expect(guardianHrefs).not.toContain(item.href);
        }
    });

    it("el tutor ve Inicio, Mis hijos y Avisos, y no Calificaciones", () => {
        const labels = getNavItems("guardian").map((item) => item.label);
        expect(labels).toEqual(["Inicio", "Mis hijos", "Avisos"]);
    });

    it("el docente no ve ítems solo de tutores", () => {
        const labels = getNavItems("teacher").map((item) => item.label);
        expect(labels).toContain("Mis cursos");
        expect(labels).not.toContain("Mis hijos");
    });

    it("todos los roles ven Inicio", () => {
        for (const role of ["admin", "director", "teacher", "guardian"] as const) {
            expect(getNavItems(role).map((item) => item.href)).toContain("/inicio");
        }
    });
});
