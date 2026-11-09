import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LeadsList } from "./leads-list";
import type { Lead } from "./types";

const base: Lead = {
    id: "l1",
    institutionName: "Escuela N° 1",
    contactName: "Ana Pérez",
    city: "Perico",
    contactRole: "Directora",
    level: "Primario",
    contactChannel: "388 400-0000",
    studentCount: 1200,
    comment: "Nos interesa",
    status: "new",
    createdAt: "2026-11-08T15:00:00Z",
};

const render = (leads: Lead[], pendingIds: string[] = []) =>
    renderToStaticMarkup(<LeadsList leads={leads} pendingIds={pendingIds} onChangeStatus={() => {}} />);

describe("LeadsList", () => {
    it("muestra institución, localidad, nivel, alumnos, contacto y fecha", () => {
        const html = render([base]);
        for (const text of ["Escuela N° 1", "Perico", "Primario", "1.200", "Ana Pérez", "Directora", "8 de nov de 2026"]) {
            expect(html).toContain(text);
        }
    });

    it("teléfono → link de WhatsApp; email → mailto", () => {
        expect(render([base])).toContain('href="https://wa.me/5493884000000"');
        expect(render([{ ...base, contactChannel: "ana@escuela.edu.ar" }])).toContain('href="mailto:ana@escuela.edu.ar"');
    });

    it("tiene tarjetas para celular y tabla para computadora", () => {
        const html = render([base]);
        expect(html).toContain("lg:hidden");
        expect(html).toContain("<table");
    });

    it("ofrece pasar a los otros estados y los bloquea mientras guarda", () => {
        expect(render([base])).toContain("Marcar contactado");
        expect(render([base])).toContain("Descartar");
        expect(render([base])).not.toContain("Volver a nuevo");
        const busy = render([base], ["l1"]);
        expect(busy).toContain("Guardando…");
        expect(busy).toContain("disabled");
    });
});
