import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { courseHasStudentsText } from "../../features/school/school-texts";
import { ConfirmDialog } from "./confirm-dialog";

const noop = () => {};

describe("ConfirmDialog", () => {
    it("mientras carga deshabilita los botones y muestra el texto de carga", () => {
        const html = renderToStaticMarkup(
            <ConfirmDialog
                open
                title="¿Publicar?"
                confirmLabel="Publicar"
                loading
                loadingLabel="Publicando…"
                onConfirm={noop}
                onCancel={noop}
            />,
        );
        expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-busy="true"[^>]*>Publicando…<\/button>/);
        expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Cancelar<\/button>/);
        expect(html).not.toContain(">Publicar<");
    });

    it("sin cargar muestra el texto normal y habilita los botones", () => {
        const html = renderToStaticMarkup(
            <ConfirmDialog open title="¿Publicar?" confirmLabel="Publicar" loadingLabel="Publicando…" onConfirm={noop} onCancel={noop} />,
        );
        expect(html).toContain(">Publicar</button>");
        expect(html).not.toContain('disabled=""');
    });

    it("con aviso y confirmDisabled muestra la alerta y deshabilita solo confirmar", () => {
        const html = renderToStaticMarkup(
            <ConfirmDialog
                open
                title="¿Eliminar 1° Año A?"
                confirmLabel="Eliminar"
                warning={courseHasStudentsText(10)}
                confirmDisabled
                destructive
                onConfirm={noop}
                onCancel={noop}
            />,
        );
        expect(html).toContain('role="alert"');
        expect(html).toContain("Este curso tiene 10 estudiantes vinculados.");
        expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Eliminar<\/button>/);
        expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Cancelar<\/button>/);
    });

    it("el aviso de curso con estudiantes usa singular con 1", () => {
        expect(courseHasStudentsText(1)).toContain("1 estudiante vinculado.");
    });
});
