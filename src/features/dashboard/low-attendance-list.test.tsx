import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LOW_ATTENDANCE_EMPTY, LOW_ATTENDANCE_HINT, LOW_ATTENDANCE_TITLE, NO_STUDENT_NAME_LABEL } from "./dashboard-ui";
import { LowAttendanceList } from "./low-attendance-list";
import type { LowAttendanceRow } from "./types";

const rows: LowAttendanceRow[] = [
    {
        student: { id: "s1", firstName: "Ana", lastName: "Pérez" },
        course: { id: "c1", name: "3° A" },
        percentage: 62.5,
    },
    {
        student: { id: "s2", firstName: "", lastName: "" },
        course: { id: "c2", name: "1° B" },
        percentage: 80,
    },
];

describe("lista de baja asistencia", () => {
    const html = renderToStaticMarkup(<LowAttendanceList rows={rows} />);

    it("muestra título, cantidad y la regla de Back", () => {
        expect(html).toContain(LOW_ATTENDANCE_TITLE);
        expect(html).toContain("(2)");
        expect(html).toContain(LOW_ATTENDANCE_HINT);
    });

    it("muestra alumno, curso y porcentaje en orden", () => {
        expect(html).toContain("Pérez, Ana");
        expect(html).toContain("3° A");
        expect(html).toContain("62,5%");
        expect(html).toContain("80%");
        expect(html.indexOf("Pérez, Ana")).toBeLessThan(html.indexOf("1° B"));
    });

    it("alumno sin nombre", () => {
        expect(html).toContain(NO_STUDENT_NAME_LABEL);
    });

    it("sin alumnos muestra el texto de vacío", () => {
        const empty = renderToStaticMarkup(<LowAttendanceList rows={[]} />);
        expect(empty).toContain(LOW_ATTENDANCE_EMPTY);
        expect(empty).not.toContain("<li");
    });
});
