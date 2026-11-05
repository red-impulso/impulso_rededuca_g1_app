import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BAND_CLASS, BAND_LABELS, GRADE_AVERAGES_EMPTY, GRADE_AVERAGES_TITLE, NO_GRADES_TEXT } from "./dashboard-ui";
import { GradeAveragesTable } from "./grade-averages-table";
import type { GradeAverageRow } from "./types";

function row(id: string, name: string, average: number | null): GradeAverageRow {
    return { subject: { id, name }, course: { id: "c1", name: "3° A" }, average };
}

describe("promedios por materia", () => {
    const html = renderToStaticMarkup(
        <GradeAveragesTable
            rows={[
                row("m1", "Biología", 9.2),
                row("m2", "Historia", 7.45),
                row("m3", "Lengua", 6.5),
                row("m4", "Matemática", 5),
                row("m5", "Música", null),
            ]}
        />,
    );

    it("muestra título, materia, curso y promedio con 1 decimal", () => {
        expect(html).toContain(GRADE_AVERAGES_TITLE);
        expect(html).toContain("Matemática");
        expect(html).toContain("3° A");
        expect(html).toContain("7,5");
        expect(html).toContain("5,0");
    });

    it("cada rango lleva texto además del color", () => {
        expect(html).toContain(BAND_LABELS.outstanding);
        expect(html).toContain(BAND_LABELS.satisfactory);
        expect(html).toContain(BAND_LABELS.atRisk);
        expect(html).toContain(BAND_LABELS.critical);
        expect(html).toContain(BAND_CLASS.critical);
    });

    it("materia sin notas dice «Sin notas»", () => {
        expect(html).toContain(NO_GRADES_TEXT);
    });

    it("tarjetas en celular y tabla en computadora", () => {
        expect(html).toContain("lg:hidden");
        expect(html).toContain("<table");
        expect(html).toContain('scope="col"');
    });

    it("sin materias muestra el texto de vacío", () => {
        const empty = renderToStaticMarkup(<GradeAveragesTable rows={[]} />);
        expect(empty).toContain(GRADE_AVERAGES_EMPTY);
        expect(empty).not.toContain("<table");
    });
});
