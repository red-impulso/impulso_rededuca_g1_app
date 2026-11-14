import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Role } from "@/features/session/types";
import { NOT_ALLOWED_DESCRIPTION, NOT_ALLOWED_TITLE, SCREEN_SUBTITLE } from "./dashboard-ui";

let role: Role = "teacher";
vi.mock("@/features/session/use-session", () => ({
    useSession: () => ({ active: { id: "m1", institutionId: "i1", role } }),
}));
// Docentes y tutores no deben pedir GET /dashboard
const useDashboard = vi.fn(() => ({ state: { status: "loading" }, reload: () => {} }));
vi.mock("./use-dashboard", () => ({ useDashboard: () => useDashboard() }));

const { DashboardNotAllowed, DashboardScreen } = await import("./dashboard-screen");

describe("tablero para otros roles", () => {
    it.each<Role>(["teacher", "guardian"])("%s ve el aviso institucional, sin pedir el tablero", (current) => {
        role = current;
        useDashboard.mockClear();
        const html = renderToStaticMarkup(<DashboardScreen />);
        expect(html).toContain(NOT_ALLOWED_TITLE);
        expect(html).toContain(NOT_ALLOWED_DESCRIPTION);
        expect(html).toContain('href="/inicio"');
        expect(html).not.toContain(SCREEN_SUBTITLE);
        expect(html).not.toContain('role="alert"');
        expect(useDashboard).not.toHaveBeenCalled();
    });

    it.each<Role>(["admin", "director"])("%s ve el tablero", (current) => {
        role = current;
        const html = renderToStaticMarkup(<DashboardScreen />);
        expect(html).toContain(SCREEN_SUBTITLE);
        expect(html).not.toContain(NOT_ALLOWED_TITLE);
    });

    it("el aviso usa el estado vacío estándar", () => {
        const html = renderToStaticMarkup(<DashboardNotAllowed />);
        expect(html).toContain("border-dashed");
        expect(html).toContain("Esta pantalla es para la dirección");
    });
});
