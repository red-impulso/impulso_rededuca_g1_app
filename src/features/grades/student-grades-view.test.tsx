import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { groupGradesBySubject, summarizeStudent } from "./student-grades";
import { StudentGradesView } from "./student-grades-view";
import type { StudentGrade } from "./types";

function grade(subject: string, period: string, value: number | null): StudentGrade {
    return {
        subject: { id: `s-${subject}`, name: subject },
        period: { id: `p-${period}`, name: period },
        value,
    };
}

const grades: StudentGrade[] = [
    grade("Matemática", "1.er trimestre", 8),
    grade("Matemática", "2.º trimestre", 9),
    grade("Lengua", "1.er trimestre", 6),
    grade("Lengua", "2.º trimestre", 7),
    grade("Historia", "1.er trimestre", 5),
    grade("Biología", "1.er trimestre", null),
];

function render() {
    const subjects = groupGradesBySubject(grades);
    return renderToStaticMarkup(
        <StudentGradesView subjects={subjects} summary={summarizeStudent(subjects)} />,
    );
}

describe("StudentGradesView", () => {
    it("muestra el resumen: promedio general, aprobadas y pendientes", () => {
        const html = render();
        expect(html).toContain("Promedio general");
        expect(html).toContain("6,7");
        expect(html).toContain("Materias aprobadas");
        expect(html).toContain("Materias pendientes");
    });

    it("muestra cada materia con su promedio, con número y texto", () => {
        const html = render();
        expect(html).toContain("Matemática");
        expect(html).toContain("8,5 · Satisfactorio");
        expect(html).toContain("6,5 · Atención");
        expect(html).toContain("5,0 · Bajo");
    });

    it("muestra la nota de cada período", () => {
        const html = render();
        expect(html).toContain("1.er trimestre: 8");
        expect(html).toContain("2.º trimestre: 9");
    });

    it("una materia sin notas dice «Sin nota» y «Sin notas»", () => {
        const html = render();
        expect(html).toContain("1.er trimestre: Sin nota");
        expect(html).toContain("Sin notas");
    });
});

describe("observaciones en el detalle", () => {
    function renderWith(observations: string | null) {
        const subjects = groupGradesBySubject([
            { ...grade("Lengua", "1.er trimestre", 7), observations },
        ]);
        return renderToStaticMarkup(
            <StudentGradesView subjects={subjects} summary={summarizeStudent(subjects)} />,
        );
    }

    it("muestra la observación con el nombre del período", () => {
        const html = renderWith("Participa mucho");
        expect(html).toContain("Observación (1.er trimestre): ");
        expect(html).toContain("Participa mucho");
    });

    it("sin observación no muestra nada", () => {
        expect(renderWith(null)).not.toContain("Observación");
    });

    it("el texto se escapa: nunca se interpreta como HTML", () => {
        const html = renderWith("<b>hola</b>");
        expect(html).toContain("&lt;b&gt;hola&lt;/b&gt;");
        expect(html).not.toContain("<b>hola</b>");
    });
});
