import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AttendanceStudentRow } from "./attendance-student-row";
import type { AttendanceRow } from "./types";

const row: AttendanceRow = {
    student: { id: "1", firstName: "Camila", lastName: "Díaz" },
    status: null,
};

const noop = () => {};

function render(props: Partial<Parameters<typeof AttendanceStudentRow>[0]> = {}) {
    return renderToStaticMarkup(
        <ul>
            <AttendanceStudentRow row={row} status={null} changed={false} onChange={noop} {...props} />
        </ul>,
    );
}

function countOf(html: string, text: string): number {
    return html.split(text).length - 1;
}

describe("fila de un alumno sin marcar", () => {
    const html = render();

    it("muestra el nombre y «Sin marcar»", () => {
        expect(html).toContain("Díaz, Camila");
        expect(html).toContain("Sin marcar");
    });

    it("tiene los cuatro botones P / A / T / J con su nombre completo", () => {
        for (const label of ["Presente", "Ausente", "Tarde", "Justificada"]) {
            expect(html).toContain(`aria-label="${label}"`);
        }
        for (const letter of ["P", "A", "T", "J"]) {
            expect(html).toContain(`>${letter}</button>`);
        }
        expect(html).toContain('aria-label="Asistencia de Díaz, Camila"');
    });

    it("no tiene ningún botón elegido ni cambios", () => {
        expect(countOf(html, 'aria-pressed="true"')).toBe(0);
        expect(html).not.toContain("border-blue");
    });
});

describe("fila de un alumno con estado", () => {
    it("un ausente marca solo el botón A, en rojo, y lo dice en texto", () => {
        const html = render({ status: "absent" });
        expect(countOf(html, 'aria-pressed="true"')).toBe(1);
        expect(html).toContain("border-error");
        expect(html).toContain("Ausente");
        expect(html).not.toContain("Sin marcar");
    });

    it("presente y tarde usan sus colores", () => {
        expect(render({ status: "present" })).toContain("border-success");
        expect(render({ status: "late" })).toContain("border-warning");
    });

    it("un cambio sin guardar resalta la tarjeta en azul", () => {
        expect(render({ status: "present", changed: true })).toContain("border-blue");
    });
});

describe("mientras se guarda", () => {
    it("deshabilita los cuatro botones", () => {
        const html = render({ disabled: true });
        expect(countOf(html, 'disabled=""')).toBe(4);
    });
});
