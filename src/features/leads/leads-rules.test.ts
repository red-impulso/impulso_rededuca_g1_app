import { describe, expect, it } from "vitest";
import {
    applyStatusChange,
    canSeeLeads,
    contactLink,
    formatLeadDate,
    formatStudentCount,
    nextStatuses,
    whatsappNumber,
} from "./leads-rules";
import type { Lead } from "./types";

const lead = (id: string, status: Lead["status"]): Lead => ({
    id,
    institutionName: "Escuela",
    contactName: "Ana",
    city: "Perico",
    contactRole: "Directora",
    level: "Primario",
    contactChannel: "ana@escuela.edu.ar",
    studentCount: 10,
    comment: null,
    status,
    createdAt: "2026-11-08T12:00:00Z",
});

describe("canSeeLeads", () => {
    it("solo admin", () => {
        expect(canSeeLeads("admin")).toBe(true);
        expect(canSeeLeads("director")).toBe(false);
        expect(canSeeLeads("teacher")).toBe(false);
        expect(canSeeLeads("guardian")).toBe(false);
    });
});

describe("contactLink", () => {
    it("email → mailto", () => {
        expect(contactLink(" ana@escuela.edu.ar ")).toEqual({ kind: "email", href: "mailto:ana@escuela.edu.ar" });
    });

    it("teléfono → WhatsApp con 549", () => {
        expect(contactLink("388 400-0000")).toEqual({ kind: "whatsapp", href: "https://wa.me/5493884000000" });
        expect(contactLink("0388 4000000")?.href).toBe("https://wa.me/5493884000000");
        expect(contactLink("+54 9 388 400-0000")?.href).toBe("https://wa.me/5493884000000");
        expect(contactLink("+54 388 400-0000")?.href).toBe("https://wa.me/5493884000000");
    });

    it("texto que no es email ni teléfono → sin link", () => {
        expect(contactLink("por la mañana")).toBeNull();
        expect(contactLink("123")).toBeNull();
    });

    it("whatsappNumber deja solo dígitos", () => {
        expect(whatsappNumber("(388) 400-0000")).toBe("5493884000000");
    });
});

describe("formatos", () => {
    it("fecha en hora de Argentina", () => {
        // 01:00 UTC del 9 es todavía 8 en Argentina
        expect(formatLeadDate("2026-11-09T01:00:00Z")).toBe("8 de nov de 2026");
        expect(formatLeadDate("no-es-fecha")).toBe("");
    });

    it("cantidad de alumnos con punto de miles", () => {
        expect(formatStudentCount(1500)).toBe("1.500");
    });
});

describe("cambio de estado", () => {
    it("ofrece los otros dos estados", () => {
        expect(nextStatuses("new")).toEqual(["contacted", "discarded"]);
        expect(nextStatuses("contacted")).toEqual(["discarded", "new"]);
    });

    it("si ya no coincide con el filtro, sale de la lista", () => {
        const list = [lead("a", "new"), lead("b", "new")];
        expect(applyStatusChange(list, lead("a", "contacted"), "new").map((l) => l.id)).toEqual(["b"]);
    });

    it("con 'Todos' se queda y se actualiza", () => {
        const list = [lead("a", "new"), lead("b", "new")];
        expect(applyStatusChange(list, lead("a", "contacted"), "all")[0].status).toBe("contacted");
    });
});
