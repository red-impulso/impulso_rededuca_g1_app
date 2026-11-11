import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StudentProfileView } from "./student-profile";
import { StudentsList } from "./students-list";
import type { StudentProfile, StudentSummary } from "./types";

const student: StudentSummary = {
    id: "s1",
    firstName: "Tomás",
    lastName: "Díaz",
    dni: "41220118",
    fileNumber: null,
    status: "active",
    course: { id: "c1", name: "", year: 5, division: "A", shift: "morning", schoolYear: 2027 },
    guardian: { id: "g1", fullName: "Laura Díaz", phone: "3884123456", email: null },
    updatedAt: null,
};

const profile: StudentProfile = {
    personal: { id: "s1", firstName: "Tomás", lastName: "Díaz", dni: "41220118", fileNumber: "L-12", birthDate: "2010-05-02", gender: "Masculino", address: null, phone: null, email: null },
    academic: { course: student.course, enrollmentDate: null, status: "active" },
    academicSummary: { averageGrade: 7.5, approvedSubjects: 8, pendingSubjects: 1 },
    attendanceSummary: { percentage: 92.5, justified: 2, unjustified: 1, late: 3 },
    guardians: [student.guardian!],
    observations: { academic: "Refuerzo en Matemática", institutional: null },
};

describe("StudentsList", () => {
    it("tabla y tarjeta con los datos de Back", () => {
        const html = renderToStaticMarkup(<StudentsList students={[student]} page={1} limit={25} total={1} onEdit={() => undefined} onPage={() => undefined} />);
        expect(html).toContain("Díaz, Tomás");
        expect(html).toContain("41.220.118");
        expect(html).toContain("Tutor principal");
        expect(html).toContain("Laura Díaz");
        expect(html).toContain('href="/alumnos/s1"');
        expect(html).toContain('href="tel:3884123456"');
        expect(html).toContain("1-1 de 1");
    });

    it("paginación con más de una página", () => {
        const html = renderToStaticMarkup(<StudentsList students={[student]} page={2} limit={25} total={1248} onEdit={() => undefined} onPage={() => undefined} />);
        expect(html).toContain("26-50 de 1.248");
        expect(html).toContain('aria-current="page"');
    });
});

describe("StudentProfileView", () => {
    it("KPI, asistencia, observaciones y actividad con error", () => {
        const html = renderToStaticMarkup(<StudentProfileView profile={profile} activity={{ status: "error", message: "No disponible", onRetry: () => undefined }} actions={null} />);
        expect(html).toContain("7,5");
        expect(html).toContain("92,5%");
        expect(html).toContain("Refuerzo en Matemática");
        expect(html).toContain("Legajo L-12");
        expect(html).toContain("2/5/2010");
        expect(html).toContain("No disponible");
    });

    it("sin notas muestra el estado vacío del SDD", () => {
        const empty = { ...profile, academicSummary: { averageGrade: null, approvedSubjects: 0, pendingSubjects: 0 } };
        const html = renderToStaticMarkup(<StudentProfileView profile={empty} activity={{ status: "ready", data: [] }} actions={null} />);
        expect(html).toContain("Sin información académica");
        expect(html).toContain("Sin actividad reciente.");
    });
});
