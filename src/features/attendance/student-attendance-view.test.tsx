import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StudentAttendanceView } from "./student-attendance-view";
import type { StudentAttendanceResponse } from "./student-attendance";

const data: StudentAttendanceResponse = {
    records: [
        { date: "2026-11-02", status: "present" },
        { date: "2026-11-03", status: "absent" },
        { date: "2026-10-30", status: "late" },
        { date: "2026-10-29", status: "justified" },
    ],
    summary: { present: 1, absent: 1, late: 1, justified: 1, percentage: 66.7 },
};

function render(value: StudentAttendanceResponse) {
    return renderToStaticMarkup(<StudentAttendanceView records={value.records} summary={value.summary} />);
}

describe("StudentAttendanceView con registros", () => {
    const html = render(data);

    it("muestra el porcentaje grande con coma decimal", () => {
        expect(html).toContain("66,7%");
        expect(html).toContain("text-4xl");
    });

    it("muestra los totales de cada estado", () => {
        for (const label of ["Presentes", "Ausentes", "Tarde", "Justificadas"]) {
            expect(html).toContain(label);
        }
    });

    it("lista cada día con su estado en texto", () => {
        expect(html).toContain("3 de noviembre");
        expect(html).toContain(">Ausente<");
        expect(html).toContain(">Presente<");
        expect(html).toContain(">Tarde<");
        expect(html).toContain(">Justificada<");
    });

    it("pone primero el día más nuevo", () => {
        expect(html.indexOf("3 de noviembre")).toBeLessThan(html.indexOf("29 de octubre"));
    });
});

describe("StudentAttendanceView sin registros", () => {
    const html = render({
        records: [],
        summary: { present: 0, absent: 0, late: 0, justified: 0, percentage: null },
    });

    it("en vez del porcentaje muestra «Sin registros»", () => {
        expect(html).toContain("Sin registros");
        expect(html).not.toContain("%</p>");
    });

    it("explica que todavía no hay días y no muestra totales", () => {
        expect(html).toContain("Todavía no hay días registrados");
        expect(html).not.toContain("Presentes");
    });
});

describe("StudentAttendanceView con registros pero sin porcentaje", () => {
    it("si solo hay justificadas, el porcentaje es «Sin registros» y los días se listan", () => {
        const html = render({
            records: [{ date: "2026-11-03", status: "justified" }],
            summary: { present: 0, absent: 0, late: 0, justified: 1, percentage: null },
        });
        expect(html).toContain("Sin registros");
        expect(html).toContain(">Justificada<");
    });
});
