import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getRowState } from "./grade-drafts";
import { GradeStudentCard } from "./grade-student-card";
import { GradeStudentRow } from "./grade-student-row";
import { GradesSaveBar } from "./grades-save-bar";
import type { GradeRow } from "./types";

const row: GradeRow = {
    student: { id: "1", firstName: "Sofía", lastName: "Aguirre" },
    value: 8.5,
};

const noop = () => {};

// Un valor fuera de 1–10 marca el casillero en rojo y deshabilita "Guardar"
describe("casillero con un valor fuera de 1–10", () => {
    const invalidState = getRowState(row, { "1": "11" });

    it("en la tarjeta (celular) lleva borde rojo y mensaje", () => {
        const html = renderToStaticMarkup(
            <ul>
                <GradeStudentCard row={row} state={invalidState} onChange={noop} />
            </ul>,
        );
        expect(html).toContain("border-error");
        expect(html).toContain('aria-invalid="true"');
        expect(html).toContain("Valor inválido");
        expect(html).toContain("La nota debe estar entre 1 y 10.");
        // Con un valor inválido no se muestra el cartelito de nota
        expect(html).not.toContain("Satisfactorio");
    });

    it("en la fila (escritorio) lleva borde rojo y mensaje", () => {
        const html = renderToStaticMarkup(
            <table>
                <tbody>
                    <GradeStudentRow row={row} state={invalidState} onChange={noop} />
                </tbody>
            </table>,
        );
        expect(html).toContain("border-error");
        expect(html).toContain('aria-invalid="true"');
        expect(html).toContain("La nota debe estar entre 1 y 10.");
    });

    it("deshabilita «Guardar cambios» y explica por qué", () => {
        const html = renderToStaticMarkup(
            <GradesSaveBar
                changedCount={1}
                hasErrors
                saveState={{ status: "idle" }}
                onCancel={noop}
                onSave={noop}
            />,
        );
        expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Guardar cambios<\/button>/);
        expect(html).toContain("Corrige las notas marcadas en rojo");
    });
});

describe("casillero con una nota válida", () => {
    it("muestra la nota con su cartelito y sin errores", () => {
        const html = renderToStaticMarkup(
            <ul>
                <GradeStudentCard row={row} state={getRowState(row, {})} onChange={noop} />
            </ul>,
        );
        expect(html).toContain("Aguirre, Sofía");
        expect(html).toContain("8,5 · Satisfactorio");
        expect(html).toContain('aria-invalid="false"');
        expect(html).not.toContain("border-error");
        expect(html).not.toContain("Valor inválido");
    });
});

describe("barra de guardado", () => {
    it("con cambios válidos habilita «Guardar cambios» y cuenta los cambios", () => {
        const html = renderToStaticMarkup(
            <GradesSaveBar
                changedCount={2}
                hasErrors={false}
                saveState={{ status: "idle" }}
                onCancel={noop}
                onSave={noop}
            />,
        );
        expect(html).toContain("2 cambios sin guardar");
        expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Guardar cambios<\/button>/);
    });

    it("sin cambios deshabilita «Guardar cambios»", () => {
        const html = renderToStaticMarkup(
            <GradesSaveBar
                changedCount={0}
                hasErrors={false}
                saveState={{ status: "idle" }}
                onCancel={noop}
                onSave={noop}
            />,
        );
        expect(html).toContain("No hay cambios sin guardar");
        expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Guardar cambios<\/button>/);
    });

    it("mientras guarda muestra «Guardando…» y bloquea el botón", () => {
        const html = renderToStaticMarkup(
            <GradesSaveBar
                changedCount={2}
                hasErrors={false}
                saveState={{ status: "saving" }}
                onCancel={noop}
                onSave={noop}
            />,
        );
        expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Guardando…<\/button>/);
    });

    it("sin conexión muestra el aviso en amarillo", () => {
        const html = renderToStaticMarkup(
            <GradesSaveBar
                changedCount={2}
                hasErrors={false}
                saveState={{
                    status: "error",
                    kind: "offline",
                    message: "Sin conexión. Tus cambios no se perdieron.",
                }}
                onCancel={noop}
                onSave={noop}
            />,
        );
        expect(html).toContain('role="alert"');
        expect(html).toContain("bg-warning-bg");
        expect(html).toContain("Sin conexión. Tus cambios no se perdieron.");
    });

    it("un error de la API muestra su mensaje en rojo", () => {
        const html = renderToStaticMarkup(
            <GradesSaveBar
                changedCount={2}
                hasErrors={false}
                saveState={{ status: "error", kind: "error", message: "Período no encontrado" }}
                onCancel={noop}
                onSave={noop}
            />,
        );
        expect(html).toContain('role="alert"');
        expect(html).toContain("bg-error-bg");
        expect(html).toContain("Período no encontrado");
    });
});