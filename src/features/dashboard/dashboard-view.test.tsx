import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GRADE_AVERAGES_TITLE, LOW_ATTENDANCE_TITLE, STUDENTS_LABEL } from "./dashboard-ui";
import { DashboardView } from "./dashboard-view";
import type { DashboardSummary } from "./types";

const summary: DashboardSummary = {
    students: 1847,
    courses: 24,
    teachers: 96,
    attendanceAverage: 92.5,
    lowAttendance: [
        {
            student: { id: "s1", firstName: "Ana", lastName: "Pérez" },
            course: { id: "c1", name: "3° A" },
            percentage: 70,
        },
    ],
    gradeAverages: [{ subject: { id: "m1", name: "Matemática" }, course: { id: "c1", name: "3° A" }, average: 7 }],
};

describe("tablero con datos", () => {
    const html = renderToStaticMarkup(<DashboardView summary={summary} refreshing={false} />);

    it("muestra los números, la baja asistencia y los promedios", () => {
        expect(html).toContain(STUDENTS_LABEL);
        expect(html).toContain("1.847");
        expect(html).toContain(LOW_ATTENDANCE_TITLE);
        expect(html).toContain("Pérez, Ana");
        expect(html).toContain(GRADE_AVERAGES_TITLE);
        expect(html).toContain("Matemática");
    });

    it("en celular la baja asistencia va antes que los promedios", () => {
        expect(html.indexOf(LOW_ATTENDANCE_TITLE)).toBeLessThan(html.indexOf(GRADE_AVERAGES_TITLE));
    });

    it("en computadora usa la columna lateral de 440 px", () => {
        expect(html).toContain("lg:grid-cols-[minmax(0,1fr)_440px]");
    });

    it("avisa cuando se está actualizando", () => {
        expect(html).toContain('aria-busy="false"');
        const refreshing = renderToStaticMarkup(<DashboardView summary={summary} refreshing />);
        expect(refreshing).toContain('aria-busy="true"');
    });
});
