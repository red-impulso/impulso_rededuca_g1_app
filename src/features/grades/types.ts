// Tipos de las respuestas de Back para M1 (calificaciones).
// Copian la forma exacta que entrega la API; si Back la cambia, se cambia acá.

// Curso al que pertenece una materia
export type CourseRef = {
    id: string;
    year: number;
    // Pueden venir null si el curso no tiene división o turno cargado
    division: string | null;
    shift: string | null;
};

// GET /me/subjects: materias del docente
export type TeacherSubject = {
    id: string;
    name: string;
    course: CourseRef;
};

// GET /grading-periods: períodos de calificación
export type GradingPeriod = {
    id: string;
    name: string;
    schoolYear: number;
};

export type StudentRef = {
    id: string;
    firstName: string;
    lastName: string;
};

// GET /grades?subjectId=...&periodId=...: una fila por alumno del curso.
// value es null cuando todavía no tiene nota.
export type GradeRow = {
    student: StudentRef;
    value: number | null;
};

// PUT /grades: lo que se envía. Solo se mandan las notas con valor:
// Back ignora los null (no borra notas).
export type SaveGradesEntry = {
    studentId: string;
    value: number;
};

export type SaveGradesBody = {
    subjectId: string;
    periodId: string;
    entries: SaveGradesEntry[];
};

// PUT /grades: lo que responde. saved cuenta las notas que cambiaron
// (0 si no había ningún cambio real).
export type SaveGradesResponse = {
    saved: number;
};

// GET /me/students: hijos del tutor (solo rol guardian)
export type LinkedStudent = {
    id: string;
    firstName: string;
    lastName: string;
    course: { id: string; year: number; division: string | null } | null;
};

// GET /students/:studentId/grades: notas de un alumno (portal del tutor).
// OJO: este endpoint todavía no existe en el repo de Back (M1-2).
export type StudentGrade = {
    subject: { id: string; name: string };
    period: { id: string; name: string };
    value: number | null;
};