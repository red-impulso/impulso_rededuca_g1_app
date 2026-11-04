import { describe, expect, it } from "vitest";
import {
    applySaved,
    buildEntries,
    countChanges,
    courseLabel,
    getStatus,
    isAttendanceStatus,
    isFutureDate,
    markAllPresent,
    setStatus,
    studentFullName,
    summarizeAttendance,
    todayInArgentina,
} from "./attendance-rules";
import type { AttendanceRow, AttendanceStatus } from "./types";

function makeRow(id: string, status: AttendanceStatus | null): AttendanceRow {
    return { student: { id, firstName: "Nombre", lastName: "Apellido" }, status };
}

const rows = [makeRow("1", null), makeRow("2", "absent"), makeRow("3", "present")];

describe("todayInArgentina", () => {
    it("a las 22:30 de Argentina sigue siendo el mismo día (en UTC ya es el siguiente)", () => {
        expect(todayInArgentina(new Date("2026-11-04T01:30:00Z"))).toBe("2026-11-03");
    });

    it("a las 00:00 de Argentina cambia el día", () => {
        expect(todayInArgentina(new Date("2026-11-03T03:00:00Z"))).toBe("2026-11-03");
        expect(todayInArgentina(new Date("2026-11-03T02:59:59Z"))).toBe("2026-11-02");
    });
});

describe("isFutureDate", () => {
    it("solo es futura una fecha posterior a hoy", () => {
        expect(isFutureDate("2026-11-04", "2026-11-03")).toBe(true);
        expect(isFutureDate("2026-11-03", "2026-11-03")).toBe(false);
        expect(isFutureDate("2026-11-02", "2026-11-03")).toBe(false);
    });
});

describe("courseLabel", () => {
    it("usa el name de Back si viene", () => {
        expect(courseLabel({ id: "c", name: "1.º A", year: 1, division: "A", shift: null })).toBe("1.º A");
    });

    it("sin name arma año y división", () => {
        expect(courseLabel({ id: "c", year: 2, division: "B", shift: "tarde" })).toBe("2.º B");
    });

    it("sin división muestra solo el año", () => {
        expect(courseLabel({ id: "c", year: 3, division: null, shift: null })).toBe("3.º");
    });
});

describe("studentFullName", () => {
    it("muestra apellido y nombre", () => {
        expect(studentFullName({ id: "1", firstName: "Camila", lastName: "Díaz" })).toBe("Díaz, Camila");
    });
});

describe("getStatus y setStatus", () => {
    it("sin edición muestra el estado de Back", () => {
        expect(getStatus(rows[1], {})).toBe("absent");
        expect(getStatus(rows[0], {})).toBeNull();
    });

    it("marcar un alumno sin estado cuenta como cambio", () => {
        const drafts = setStatus({}, rows[0], "present");
        expect(getStatus(rows[0], drafts)).toBe("present");
        expect(countChanges(rows, drafts)).toBe(1);
    });

    it("volver al estado guardado deja de contar como cambio", () => {
        const changed = setStatus({}, rows[1], "late");
        expect(countChanges(rows, changed)).toBe(1);
        const back = setStatus(changed, rows[1], "absent");
        expect(back).toEqual({});
        expect(countChanges(rows, back)).toBe(0);
    });

    it("no modifica los borradores anteriores", () => {
        const before = {};
        setStatus(before, rows[0], "late");
        expect(before).toEqual({});
    });
});

describe("markAllPresent", () => {
    it("completa solo a los que no tienen estado", () => {
        const drafts = markAllPresent(rows, {});
        expect(getStatus(rows[0], drafts)).toBe("present");
        // ya estaba ausente: no se pisa
        expect(getStatus(rows[1], drafts)).toBe("absent");
        expect(getStatus(rows[2], drafts)).toBe("present");
        expect(drafts).toEqual({ "1": "present" });
    });

    it("respeta lo que el docente ya marcó en esta sesión", () => {
        const start = setStatus({}, rows[0], "late");
        expect(markAllPresent(rows, start)).toEqual({ "1": "late" });
    });
});

describe("buildEntries", () => {
    it("envía solo los alumnos marcados o cambiados", () => {
        const drafts = setStatus(setStatus({}, rows[0], "present"), rows[1], "justified");
        expect(buildEntries(rows, drafts)).toEqual([
            { studentId: "1", status: "present" },
            { studentId: "2", status: "justified" },
        ]);
    });

    it("sin cambios no envía nada", () => {
        expect(buildEntries(rows, {})).toEqual([]);
    });
});

describe("summarizeAttendance", () => {
    it("cuenta cada estado y los alumnos sin marcar", () => {
        expect(summarizeAttendance(rows, {})).toEqual({
            present: 1,
            absent: 1,
            late: 0,
            justified: 0,
            unmarked: 1,
        });
    });

    it("incluye lo que se editó y todavía no se guardó", () => {
        const drafts = markAllPresent(rows, {});
        expect(summarizeAttendance(rows, drafts).unmarked).toBe(0);
        expect(summarizeAttendance(rows, drafts).present).toBe(2);
    });
});

describe("applySaved", () => {
    it("lo enviado pasa a ser lo vigente", () => {
        const drafts = setStatus({}, rows[0], "late");
        const saved = applySaved(rows, drafts);
        expect(saved.map((row) => row.status)).toEqual(["late", "absent", "present"]);
        // ya no quedan cambios pendientes contra lo nuevo
        expect(countChanges(saved, {})).toBe(0);
    });
});

describe("isAttendanceStatus", () => {
    it("acepta solo los cuatro estados", () => {
        expect(isAttendanceStatus("present")).toBe(true);
        expect(isAttendanceStatus("justified")).toBe(true);
        expect(isAttendanceStatus("faltó")).toBe(false);
        expect(isAttendanceStatus(null)).toBe(false);
    });
});
