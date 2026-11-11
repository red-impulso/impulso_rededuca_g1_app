import type { CourseRef } from "../school/types";

export type StudentStatus = "active" | "inactive" | "draft";
export type StudentGender = "Femenino" | "Masculino" | "Otro";
export type StudentSort = "last-asc" | "last-desc" | "course" | "enrollment";

export type GuardianContact = {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
};

// Fila de GET /students
export type StudentSummary = {
    id: string;
    firstName: string;
    lastName: string;
    dni: string | null;
    fileNumber: string | null;
    status: StudentStatus | null;
    course: CourseRef | null;
    guardian: GuardianContact | null;
    updatedAt: string | null;
};

export type StudentPage = {
    data: StudentSummary[];
    total: number;
    page: number;
    limit: number;
};

// GET /students/:id/profile
export type StudentProfile = {
    personal: {
        id: string;
        firstName: string;
        lastName: string;
        dni: string | null;
        fileNumber: string | null;
        birthDate: string | null;
        gender: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
    };
    academic: {
        course: CourseRef | null;
        enrollmentDate: string | null;
        status: StudentStatus | null;
    };
    academicSummary: {
        averageGrade: number | null;
        approvedSubjects: number | null;
        pendingSubjects: number | null;
    };
    attendanceSummary: {
        percentage: number | null;
        justified: number | null;
        unjustified: number | null;
        late: number | null;
    };
    guardians: GuardianContact[];
    observations: { academic: string | null; institutional: string | null };
};

// GET /students/:id/activity (pedido a Back)
export type ActivityKind = "grade" | "attendance" | "announcement" | "event";
export type StudentActivity = {
    id: string;
    kind: ActivityKind;
    title: string;
    occurredAt: string;
};

export type StudentFilters = {
    q: string;
    courseId: string | null;
    shift: "morning" | "afternoon" | "evening" | null;
    status: StudentStatus | null;
    schoolYear: number | null;
    sort: StudentSort;
    page: number;
};
