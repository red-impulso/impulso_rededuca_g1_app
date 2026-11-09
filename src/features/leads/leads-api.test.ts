import { describe, expect, it } from "vitest";
import { describeLoadError, describeUpdateError, leadPath, leadsPath, parseLead, parseLeads } from "./leads-api";

const RAW = {
    id: "l1",
    institutionName: "Escuela 1",
    contactName: "Ana Pérez",
    city: "Perico",
    contactRole: "Directora",
    level: "Primario",
    contactChannel: "ana@escuela.edu.ar",
    studentCount: 120,
    comment: "Hola",
    status: "new",
    createdAt: "2026-11-08T22:30:00Z",
};

describe("rutas de leads", () => {
    it("filtra por estado y 'Todos' no manda status", () => {
        expect(leadsPath("new")).toBe("/leads?status=new");
        expect(leadsPath("contacted")).toBe("/leads?status=contacted");
        expect(leadsPath("discarded")).toBe("/leads?status=discarded");
        expect(leadsPath("all")).toBe("/leads");
    });

    it("arma la ruta del PATCH con el id", () => {
        expect(leadPath("abc-123")).toBe("/leads/abc-123");
    });
});

describe("parseLeads", () => {
    it("convierte una lista válida", () => {
        expect(parseLeads([RAW])).toEqual([RAW]);
    });

    it("saca los elementos sin id o con estado desconocido", () => {
        expect(parseLeads([RAW, { ...RAW, id: "" }, { ...RAW, id: "l2", status: "otro" }])).toEqual([RAW]);
    });

    it("comentario vacío queda en null", () => {
        expect(parseLead({ ...RAW, comment: "  " })?.comment).toBeNull();
        expect(parseLead({ ...RAW, comment: undefined })?.comment).toBeNull();
    });

    it("si no es una lista devuelve null", () => {
        expect(parseLeads({ data: [] })).toBeNull();
        expect(parseLeads(null)).toBeNull();
    });
});

describe("errores", () => {
    it("sin conexión, 403 y 500 tienen su texto", () => {
        expect(describeLoadError(0).kind).toBe("offline");
        expect(describeLoadError(403).message).toContain("administración");
        expect(describeLoadError(500).message).toContain("nuestro lado");
        expect(describeUpdateError(404).message).toBe("Esa postulación ya no existe.");
    });
});
