// Tipos del tablero de dirección (M5).
// Respuesta de GET /dashboard (solo admin y director).

export type DashboardStudent = {
    id: string;
    firstName: string;
    lastName: string;
};

export type DashboardCourse = {
    id: string;
    name: string;
};

// Alumno con menos de 85 % de asistencia en los últimos 30 días
export type LowAttendanceRow = {
    student: DashboardStudent;
    course: DashboardCourse;
    // 0 a 100, con 1 decimal
    percentage: number;
};

// Promedio de notas de una materia en un curso
export type GradeAverageRow = {
    subject: { id: string; name: string };
    course: DashboardCourse;
    // null si la materia todavía no tiene notas
    average: number | null;
};

export type DashboardSummary = {
    students: number;
    courses: number;
    teachers: number;
    // Asistencia de todo el historial; null si no hay registros que cuenten
    attendanceAverage: number | null;
    // Ordenada de menor a mayor porcentaje (lo hace Back)
    lowAttendance: LowAttendanceRow[];
    // Ordenada por materia y curso (lo hace Back)
    gradeAverages: GradeAverageRow[];
};

// Rangos de calificaciones del diseño (M5-UX, supuesto a definir con Dirección)
export type PerformanceBand = "outstanding" | "satisfactory" | "atRisk" | "critical";
