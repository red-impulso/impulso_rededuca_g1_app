import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SchoolForm } from "./school-form";
import { PENDING_ENDPOINT_TEXT } from "./school-api";
import { OFFLINE_TEXT, SCHOOL_EMPTY_TEXT, SCHOOL_SAVED_TEXT } from "./school-texts";
import type { School } from "./types";

const NOW = new Date("2027-03-10T13:42:00Z");

const school: School = {
    id: "i1",
    name: "Escuela Normal N.° 1",
    code: "ESC-0142",
    level: "Secundario",
    address: "Belgrano 120",
    city: "Perico",
    province: "Jujuy",
    phone: "388 400-0000",
    email: "info@normal1.edu.ar",
    website: "normal1.edu.ar",
    schoolYear: 2027,
    schedule: "07:30 – 17:30",
    familyCommunications: true,
    dailyAttendance: false,
    logoUrl: null,
    updatedAt: "2027-03-10T13:42:00Z",
};

const empty: School = {
    ...school,
    code: null,
    level: null,
    address: null,
    city: null,
    province: null,
    phone: null,
    email: null,
    website: null,
    schedule: null,
    schoolYear: null,
    familyCommunications: false,
    dailyAttendance: false,
    updatedAt: null,
};

function render(props: Partial<Parameters<typeof SchoolForm>[0]> = {}) {
    return renderToStaticMarkup(
        <SchoolForm
            school={school}
            now={NOW}
            saving={false}
            saveError={null}
            saved={false}
            onSave={async () => true}
            onCancel={() => {}}
            logoUploading={false}
            logoError={null}
            onLogoChange={() => {}}
            {...props}
        />,
    );
}

describe("SchoolForm", () => {
    it("muestra título, las 3 secciones y el panel", () => {
        const html = render();
        expect(html).toContain("Datos de la escuela");
        expect(html).toContain("Información institucional y configuración");
        expect(html).toContain("Datos institucionales");
        expect(html).toContain("Contacto");
        expect(html).toContain("Configuración");
        expect(html).toContain("Institución");
        expect(html).toContain("ESC-0142 · Año lectivo 2027");
        expect(html).toContain("Última actualización: hoy, 10:42");
    });

    // Los valores los carga React Hook Form en el navegador (schoolToValues tiene sus tests)
    it("tiene todos los campos del SDD con su etiqueta", () => {
        const html = render();
        for (const id of ["name", "code", "level", "address", "city", "province", "phone", "email", "website", "schoolYear", "schedule"]) {
            expect(html).toContain(`for="escuela-${id}"`);
        }
        expect(html).toContain("Formato: ESC-0000");
        expect(html).toContain('type="email"');
        expect(html).toContain('type="tel"');
        expect(html).toContain('<option value="2027">2027</option>');
    });

    it("los switches dicen su estado con texto", () => {
        const html = render();
        expect(html).toMatch(/role="switch" aria-checked="true"/);
        expect(html).toContain("Activado");
        expect(html).toContain("Desactivado");
    });

    it("muestra la inicial si no hay logo", () => {
        expect(render()).toContain(">E</span>");
    });

    it("sin datos configurados avisa", () => {
        const html = render({ school: empty });
        expect(html).toContain(SCHOOL_EMPTY_TEXT);
        expect(html).toContain("Última actualización: —");
        expect(render()).not.toContain(SCHOOL_EMPTY_TEXT);
    });

    it("error de guardado: sin conexión en amarillo, el resto en rojo", () => {
        expect(render({ saveError: { kind: "offline", message: OFFLINE_TEXT } })).toContain("bg-warning-bg text-warning");
        const html = render({ saveError: { kind: "error", message: PENDING_ENDPOINT_TEXT } });
        expect(html).toContain(PENDING_ENDPOINT_TEXT);
        expect(html).toContain("bg-error-bg text-error");
    });

    it("guardado exitoso: banner verde", () => {
        expect(render({ saved: true })).toContain(SCHOOL_SAVED_TEXT);
        expect(render()).not.toContain(SCHOOL_SAVED_TEXT);
    });

    it("guardando: botón deshabilitado con texto", () => {
        expect(render({ saving: true })).toContain("Guardando…");
    });

    it("error al subir el logo", () => {
        expect(render({ logoError: "No se pudo subir el logo." })).toContain("No se pudo subir el logo.");
    });
});
