import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DashboardKpis } from "./dashboard-kpis";
import {
    ATTENDANCE_HINT,
    ATTENDANCE_LABEL,
    COURSES_LABEL,
    NO_RECORDS_TEXT,
    STUDENTS_LABEL,
    TEACHERS_LABEL,
} from "./dashboard-ui";

describe("los 4 números de arriba", () => {
    const html = renderToStaticMarkup(
        <DashboardKpis students={1847} courses={24} teachers={96} attendanceAverage={92.5} />,
    );

    it("muestra los 4 títulos", () => {
        expect(html).toContain(STUDENTS_LABEL);
        expect(html).toContain(COURSES_LABEL);
        expect(html).toContain(TEACHERS_LABEL);
        expect(html).toContain(ATTENDANCE_LABEL);
    });

    it("usa formato es-AR", () => {
        expect(html).toContain("1.847");
        expect(html).toContain("24");
        expect(html).toContain("96");
        expect(html).toContain("92,5%");
    });

    it("aclara de qué período es la asistencia", () => {
        expect(html).toContain(ATTENDANCE_HINT);
    });

    it("2 columnas en celular y 4 en computadora", () => {
        expect(html).toContain("grid-cols-2");
        expect(html).toContain("lg:grid-cols-4");
    });

    it("sin asistencia registrada dice «Sin registros»", () => {
        const empty = renderToStaticMarkup(
            <DashboardKpis students={0} courses={0} teachers={0} attendanceAverage={null} />,
        );
        expect(empty).toContain(NO_RECORDS_TEXT);
    });
});
