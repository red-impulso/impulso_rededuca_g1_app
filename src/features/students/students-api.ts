import { isRecord, num, orNull, parseCourseRef, parseList, text } from "../school/school-api";
import type { StudentFormValues } from "./students-schemas";
import type {
    ActivityKind,
    GuardianContact,
    StudentActivity,
    StudentFilters,
    StudentPage,
    StudentProfile,
    StudentStatus,
    StudentSummary,
} from "./types";

// Rutas, conversión de respuestas y cuerpos de la API de M7. Funciones puras.

export const STUDENTS_PATH = "/students";
export const STUDENTS_PAGE_SIZE = 25;
const SORT_PARAM = { "last-asc": "lastName", "last-desc": "-lastName", course: "course", enrollment: "enrollmentDate" } as const;

// GET /students. Filtros: courseId, q, status, shift, schoolYear y sort (la división sale del curso).
export function studentsListPath(filters: StudentFilters): string {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.courseId) params.set("courseId", filters.courseId);
    if (filters.status) params.set("status", filters.status);
    if (filters.shift) params.set("shift", filters.shift);
    if (filters.schoolYear !== null) params.set("schoolYear", String(filters.schoolYear));
    if (filters.sort !== "last-asc") params.set("sort", SORT_PARAM[filters.sort]);
    params.set("page", String(filters.page));
    params.set("limit", String(STUDENTS_PAGE_SIZE));
    return `${STUDENTS_PATH}?${params.toString()}`;
}

export function studentPath(id: string): string {
    return `${STUDENTS_PATH}/${encodeURIComponent(id)}`;
}

export function studentProfilePath(id: string): string {
    return `${studentPath(id)}/profile`;
}

// Pedidos a Back
export function studentActivityPath(id: string): string {
    return `${studentPath(id)}/activity?limit=10`;
}

export function studentReportPath(id: string): string {
    return `${studentPath(id)}/report`;
}

export function isStudentStatus(value: unknown): value is StudentStatus {
    return value === "active" || value === "inactive" || value === "draft";
}

function parseGuardian(value: unknown): GuardianContact | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
    return { id: value.id, fullName: text(value.fullName) ?? "", phone: text(value.phone), email: text(value.email) };
}

export function parseStudentSummary(value: unknown): StudentSummary | null {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
    const course = isRecord(value.course) ? parseCourseRef({ name: "", ...value.course }) : null;
    return {
        id: value.id,
        firstName: text(value.firstName) ?? "",
        lastName: text(value.lastName) ?? "",
        dni: text(value.dni),
        fileNumber: text(value.fileNumber),
        status: isStudentStatus(value.status) ? value.status : null,
        course,
        guardian: parseGuardian(value.guardian),
        updatedAt: text(value.updatedAt),
    };
}

export function parseStudentPage(data: unknown): StudentPage | null {
    if (!isRecord(data)) return null;
    const list = parseList(data.data, parseStudentSummary);
    if (!list) return null;
    return {
        data: list,
        total: num(data.total) ?? list.length,
        page: num(data.page) ?? 1,
        limit: num(data.limit) ?? STUDENTS_PAGE_SIZE,
    };
}

export function parseStudentProfile(data: unknown): StudentProfile | null {
    if (!isRecord(data) || !isRecord(data.personal) || typeof data.personal.id !== "string") return null;
    const p = data.personal;
    const academic = isRecord(data.academic) ? data.academic : {};
    const grades = isRecord(data.academicSummary) ? data.academicSummary : {};
    const attendance = isRecord(data.attendanceSummary) ? data.attendanceSummary : {};
    const observations = isRecord(data.observations) ? data.observations : {};
    return {
        personal: {
            id: p.id as string,
            firstName: text(p.firstName) ?? "",
            lastName: text(p.lastName) ?? "",
            dni: text(p.dni),
            fileNumber: text(p.fileNumber),
            birthDate: text(p.birthDate),
            gender: text(p.gender),
            address: text(p.address),
            phone: text(p.phone),
            email: text(p.email),
        },
        academic: {
            course: isRecord(academic.course) ? parseCourseRef({ name: "", ...academic.course }) : null,
            enrollmentDate: text(academic.enrollmentDate),
            status: isStudentStatus(academic.status) ? academic.status : null,
        },
        academicSummary: {
            averageGrade: num(grades.averageGrade),
            approvedSubjects: num(grades.approvedSubjects),
            pendingSubjects: num(grades.pendingSubjects),
        },
        attendanceSummary: {
            percentage: num(attendance.percentage),
            justified: num(attendance.justified),
            unjustified: num(attendance.unjustified),
            late: num(attendance.late),
        },
        guardians: parseList(data.guardians, parseGuardian) ?? [],
        observations: { academic: text(observations.academic), institutional: text(observations.institutional) },
    };
}

const ACTIVITY_KINDS: ActivityKind[] = ["grade", "attendance", "announcement", "event"];

function parseActivity(value: unknown): StudentActivity | null {
    if (!isRecord(value) || typeof value.id !== "string" || !text(value.title) || !text(value.occurredAt)) return null;
    // Back usa "kind"; se acepta también "type" por si llega con el nombre viejo
    const kind = ACTIVITY_KINDS.find((item) => item === (value.kind ?? value.type)) ?? "event";
    return { id: value.id, kind, title: value.title as string, occurredAt: value.occurredAt as string };
}

export function parseStudentActivity(data: unknown): StudentActivity[] | null {
    if (isRecord(data)) return parseList(data.data, parseActivity);
    return parseList(data, parseActivity);
}

// POST /students y PATCH /students/:id. En el alta no se mandan los vacíos ni las observaciones.
export function toStudentBody(values: StudentFormValues, editing: boolean) {
    const optional = {
        dni: orNull(values.dni),
        fileNumber: orNull(values.fileNumber),
        birthDate: orNull(values.birthDate),
        gender: orNull(values.gender),
        address: orNull(values.address),
        phone: orNull(values.phone),
        email: orNull(values.email),
        enrollmentDate: orNull(values.enrollmentDate),
    };
    const base = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        courseId: values.courseId,
        status: values.status,
    };
    if (!editing) {
        const filled = Object.fromEntries(Object.entries(optional).filter(([, value]) => value !== null));
        return { ...base, ...filled };
    }
    // Back no acepta null en PATCH: los vacíos se mandan como "" solo en textos libres
    const patch = Object.fromEntries(Object.entries(optional).filter(([, value]) => value !== null));
    return {
        ...base,
        ...patch,
        observationAcademic: values.observationAcademic.trim(),
        observationInstitutional: values.observationInstitutional.trim(),
    };
}
