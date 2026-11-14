import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
});
