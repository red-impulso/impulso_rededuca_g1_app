export type TeacherStatus = "activo" | "licencia" | "inactivo";
export type EmploymentStatus = "titular" | "interino" | "suplente";
export type TeacherSort = "name" | "file-number" | "hours";

export type TeacherCourse = {
    id: string;
    name: string;
    year: number | null;
    division: string | null;
    shift: "morning" | "afternoon" | "evening" | null;
    schoolYear: number | null;
};

export type TeacherSubject = {
    id: string;
    name: string;
    weeklyHours: number;
    course: TeacherCourse | null;
};

// Fila de GET /teachers (id = membresía docente)
export type TeacherSummary = {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    fileNumber: string | null;
    employmentStatus: EmploymentStatus | null;
    status: TeacherStatus | null;
    coursesCount: number;
    subjects: TeacherSubject[];
    weeklyHours: number;
    maxWeeklyHours: number;
};

export type TeacherPage = { data: TeacherSummary[]; total: number; page: number; limit: number };

export type ScheduleBlock = { day: 1 | 2 | 3 | 4 | 5; start: string; end: string; subject: string; course: string };

// GET /teachers/:id
export type TeacherDetail = {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    fileNumber: string | null;
    employmentStatus: EmploymentStatus | null;
    status: TeacherStatus | null;
    hiredAt: string | null;
    seniority: { years: number; months: number } | null;
    kpis: { weeklyHours: number; maxWeeklyHours: number; subjectsCount: number; coursesCount: number; studentsReached: number };
    subjects: TeacherSubject[];
    schedule: ScheduleBlock[];
};

export type TeacherFilters = {
    q: string;
    status: TeacherStatus | null;
    employmentStatus: EmploymentStatus | null;
    subjectId: string | null;
    courseId: string | null;
    shift: "morning" | "afternoon" | "evening" | null;
    sort: TeacherSort;
    page: number;
};

export type Availability = "available" | "conflict" | "over-limit" | "unavailable";

// Candidato para asignar: GET /teachers/candidates
export type TeacherCandidate = {
    id: string;
    fullName: string;
    status: TeacherStatus | null;
    weeklyHours: number;
    maxWeeklyHours: number;
    conflict: string | null;
};

// Materia del curso en la pantalla de asignación
export type AssignmentRow = {
    subjectId: string;
    subjectName: string;
    weeklyHours: number;
    teacher: { id: string; fullName: string | null } | null;
};
