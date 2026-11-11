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

    it("todos los roles ven el ítem de comunicados, que lleva a /comunicados", () => {
        for (const role of ["admin", "director", "teacher", "guardian"] as const) {
            const hrefs = getNavItems(role).map((item) => item.href);
            expect(hrefs).toContain("/comunicados");
            // El enlace viejo ya no existe
            expect(hrefs).not.toContain("/avisos");
        }
    });

    it("solo admin y director ven el tablero, que lleva a /tablero", () => {
        expect(getNavItems("admin").map((item) => item.href)).toContain("/tablero");
        expect(getNavItems("director").map((item) => item.href)).toContain("/tablero");
        expect(getNavItems("teacher").map((item) => item.href)).not.toContain("/tablero");
        expect(getNavItems("guardian").map((item) => item.href)).not.toContain("/tablero");
    });

    it("solo admin ve Interesados, que lleva a /interesados", () => {
        expect(getNavItems("admin").map((item) => item.href)).toContain("/interesados");
        expect(getNavItems("teacher").map((item) => item.label)).not.toContain("Interesados");
        expect(getNavItems("director").map((item) => item.label)).not.toContain("Interesados");
        expect(getNavItems("guardian").map((item) => item.label)).not.toContain("Interesados");
    });

    it("admin y director ven Escuela, Alumnos, Docentes, Cursos y Materias, en el orden del SDD", () => {
        for (const role of ["admin", "director"] as const) {
            const labels = getNavItems(role).map((item) => item.label);
            const m6 = labels.filter((label) => ["Escuela", "Alumnos", "Docentes", "Cursos", "Materias"].includes(label));
            expect(m6).toEqual(["Escuela", "Alumnos", "Docentes", "Cursos", "Materias"]);
        }
        for (const role of ["teacher", "guardian"] as const) {
            const hrefs = getNavItems(role).map((item) => item.href);
            for (const href of ["/escuela", "/alumnos", "/docentes", "/cursos", "/materias", "/usuarios"]) {
                expect(hrefs).not.toContain(href);
            }
        }
    });

    it("solo admin ve Usuarios", () => {
        expect(getNavItems("admin").map((item) => item.href)).toContain("/usuarios");
        expect(getNavItems("director").map((item) => item.href)).not.toContain("/usuarios");
    });
});
