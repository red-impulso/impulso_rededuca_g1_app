import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SaveBar } from "./save-bar";

const noop = () => {};

describe("barra de guardado compartida", () => {
    it("con errores y sin texto propio muestra el mensaje general y deshabilita «Guardar cambios»", () => {
        const html = renderToStaticMarkup(
            <SaveBar changedCount={1} hasErrors saveState={{ status: "idle" }} onCancel={noop} onSave={noop} />,
        );
        expect(html).toContain("Corrige los datos marcados en rojo");
        expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Guardar cambios<\/button>/);
    });

    it("sin errores cuenta los cambios y deja guardar", () => {
        const html = renderToStaticMarkup(
            <SaveBar changedCount={3} hasErrors={false} saveState={{ status: "idle" }} onCancel={noop} onSave={noop} />,
        );
        expect(html).toContain("3 cambios sin guardar");
        expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Guardar cambios<\/button>/);
    });
});
