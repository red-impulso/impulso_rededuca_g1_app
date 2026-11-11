import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { initialMembership, switchErrorText } from "../session/institution-switch";
import { UsersList } from "./users-list";
import { normalizeQuery, parseUserPage, usersListPath } from "./users-api";
import { DEFAULT_USER_FILTERS, accessLevel, can, filterChips, isLastAdmin, lastAccessText, readUserFilters, userFiltersQuery } from "./users-rules";
import { toCreateUserBody, userSchema, userToValues } from "./users-schemas";
import { showingText, usersNoResultsTitle } from "./users-texts";

const apiUser = { membershipId: "m1", userId: "u1", role: "teacher", status: "active", profile: { fullName: "Laura Suárez", firstName: "Laura", lastName: "Suárez", dni: "30111222", phone: null }, email: "lsuarez@etp1.edu.ar", lastAccess: null, createdAt: "2026-01-01" };

describe("users-api", () => {
    it("URL con filtros y documento sin puntos", () => {
        expect(normalizeQuery(" 30.111.222 ")).toBe("30111222");
        expect(normalizeQuery("Peralta")).toBe("Peralta");
        expect(usersListPath({ ...DEFAULT_USER_FILTERS, q: "30.111", role: "teacher", status: "pending", page: 2 })).toBe("/users?q=30111&role=teacher&status=pending&page=2&limit=25");
    });
    it("lee la respuesta de GET /users y descarta filas inválidas", () => {
        const page = parseUserPage({ data: [apiUser, { membershipId: "x", role: "superadmin" }], total: 1, page: 1, limit: 25 });
        expect(page?.data).toHaveLength(1);
        expect(page?.data[0]).toMatchObject({ fullName: "Laura Suárez", role: "teacher", status: "active", dni: "30111222" });
        expect(parseUserPage({ nope: true })).toBeNull();
    });
});

describe("users-rules", () => {
    it("filtros en la URL en español", () => {
        const filters = { ...DEFAULT_USER_FILTERS, role: "teacher" as const, status: "active" as const, lastAccess: "never" as const, page: 2 };
        expect(userFiltersQuery(filters)).toBe("?rol=docente&estado=activo&acceso=nunca&pagina=2");
        expect(readUserFilters(new URLSearchParams("rol=docente&estado=activo&acceso=nunca&pagina=2"))).toEqual(filters);
        expect(filterChips(filters).map((chip) => chip.label)).toEqual(["Docente", "Activo", "Nunca"]);
    });
    it("último acceso relativo", () => {
        const now = new Date("2026-11-10T12:00:00Z");
        expect(lastAccessText(null, now)).toBe("Nunca");
        expect(lastAccessText("2026-11-10T11:55:00Z", now)).toBe("hace 5 min");
        expect(lastAccessText("2026-11-09T10:00:00Z", now)).toBe("ayer");
    });
    it("permisos, nivel y último administrador", () => {
        expect(can("admin", "users:read")).toBe(true);
        expect(can("director", "users:read")).toBe(false);
        expect(accessLevel("teacher")).toBe(2);
        const admin = parseUserPage({ data: [{ ...apiUser, role: "admin" }] })!.data[0];
        expect(isLastAdmin(admin, [admin])).toBe(true);
        expect(isLastAdmin(admin, [admin, { ...admin, membershipId: "m2" }])).toBe(false);
    });
    it("textos de M10", () => {
        expect(usersNoResultsTitle("Peralta")).toBe("No encontramos usuarios para “Peralta”.");
        expect(showingText(1, 25, 1284)).toBe("Mostrando 1 a 25 de 1.284 usuarios");
    });
});

describe("users-schemas", () => {
    it("valida y arma POST /users", () => {
        const values = { ...userToValues(null), firstName: "Ana", lastName: "Paz", email: "ana@x.com", dni: "30.111.222" };
        expect(userSchema.safeParse(values).success).toBe(true);
        expect(userSchema.safeParse({ ...values, dni: "12" }).success).toBe(false);
        expect(userSchema.safeParse({ ...values, temporaryPassword: "corta" }).success).toBe(false);
        expect(toCreateUserBody(values)).toMatchObject({ email: "ana@x.com", fullName: "Ana Paz", role: "teacher", dni: "30111222" });
    });
});

describe("selector de escuela", () => {
    const memberships = [
        { id: "a", institutionId: "i1", institutionName: "ETP N°1", role: "admin" as const },
        { id: "b", institutionId: "i2", institutionName: "Primaria N°245", role: "teacher" as const },
    ];
    it("recuerda la última escuela", () => {
        expect(initialMembership(memberships, "b")?.id).toBe("b");
        expect(initialMembership(memberships, "zz")?.id).toBe("a");
        expect(initialMembership(memberships, null)?.id).toBe("a");
        expect(switchErrorText("Primaria N°245", "ETP N°1")).toBe("No pudimos cambiar a Primaria N°245. Seguís en ETP N°1.");
    });
});

describe("vista de usuarios", () => {
    it("tabla y tarjetas con rol y estado en texto", () => {
        const users = parseUserPage({ data: [apiUser] })!.data;
        const html = renderToStaticMarkup(<UsersList users={users} schoolName="ETP N°1" selected={[]} onToggle={() => undefined} onToggleAll={() => undefined} onView={() => undefined} onEdit={() => undefined} onMenu={() => undefined} />);
        expect(html).toContain("Laura Suárez");
        expect(html).toContain("Docente");
        expect(html).toContain("Activo");
        expect(html).toContain("Nunca");
        expect(html).toContain('aria-label="Seleccionar a Laura Suárez"');
        expect(html).toContain("ETP N°1");
    });
});
