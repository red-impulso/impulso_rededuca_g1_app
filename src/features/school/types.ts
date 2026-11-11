// Tipos de M6: datos de la escuela, cursos y materias.
// Los campos que Back todavía no envía llegan como null (no se inventan).

export type CourseShift = "morning" | "afternoon" | "evening";

// Estado de cursos y materias (badge Activo / Inactivo / Borrador)
export type RecordStatus = "active" | "inactive" | "draft";

// GET /institution (pedido a Back) y PATCH /institution
export type School = {
    id: string;
    name: string;
    code: string | null;
    level: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    schoolYear: number | null;
    schedule: string | null;
    familyCommunications: boolean;
    dailyAttendance: boolean;
    logoUrl: string | null;
    updatedAt: string | null;
};

export type PersonRef = { id: string; fullName: string | null };

// Curso resumido, como viene dentro de una materia
export type CourseRef = {
    id: string;
    name: string;
    year: number | null;
    division: string | null;
    shift: CourseShift | null;
    schoolYear: number | null;
};

// GET /courses. classroom, status, studentsCount y homeroomTeacher: pedidos a Back
export type Course = CourseRef & {
    classroom: string | null;
    status: RecordStatus | null;
    studentsCount: number | null;
    homeroomTeacher: PersonRef | null;
};

// GET /subjects. weeklyHours, description, status, studentsCount y updatedAt: pedidos a Back
export type Subject = {
    id: string;
    name: string;
    course: CourseRef | null;
    teacher: PersonRef | null;
    weeklyHours: number | null;
    description: string | null;
    status: RecordStatus | null;
    studentsCount: number | null;
    updatedAt: string | null;
};

// GET /courses/:id/assignments → materias del curso con su docente
export type CourseAssignment = {
    id: string;
    name: string;
    weeklyHours: number | null;
    teacher: PersonRef | null;
};

// GET /students?courseId=&limit= → total y primeros apellidos
export type StudentsPreview = { total: number; lastNames: string[] };

// Filtros de /cursos (en la URL: ?q=&anio=&turno=&estado=&orden=)
export type CourseSort = "name" | "students";
export type CourseFilters = {
    q: string;
    schoolYear: number | null;
    shift: CourseShift | null;
    status: RecordStatus | null;
    sort: CourseSort;
};

// Filtros de /materias (en la URL: ?q=&curso=&docente=&estado=)
export type SubjectFilters = {
    q: string;
    courseId: string | null;
    teacherId: string | null;
    status: RecordStatus | null;
};
