// Textos literales del SDD (M8, voseo)
export const TEACHERS_TITLE = "Docentes";
export const NEW_TEACHER_LABEL = "Nuevo docente";
export const EDIT_TEACHER_LABEL = "Editar docente";
export const ASSIGN_SUBJECTS_LABEL = "Asignar materias";
export const EXPORT_LABEL = "Exportar";
export const IMPORT_LABEL = "Importar";
export const CHANGE_STATUS_LABEL = "Cambiar estado";
export const SEARCH_TEACHERS_PLACEHOLDER = "Buscar por nombre, legajo o materia";
export const TEACHERS_LOADING_TEXT = "Cargando docentes…";
export const TEACHERS_EMPTY_TITLE = "Todavía no hay docentes cargados.";
export function teachersNoResultsTitle(q: string): string {
    return q.trim() ? `No encontramos docentes para "${q.trim()}".` : "No encontramos docentes con esos filtros.";
}
export const TEACHERS_ERROR_TEXT = "Tuvimos un problema de nuestro lado.";
export const TEACHERS_OFFLINE_TEXT = "Sin conexión. Te mostramos los últimos datos.";
export const NO_SUBJECTS_TEXT = "Este docente todavía no tiene materias asignadas.";
export const TABS = { all: "Todos", activo: "Activos", licencia: "En licencia", inactivo: "Inactivos" } as const;
export const TEACHER_STATUS_LABELS = { activo: "Activo", licencia: "Licencia", inactivo: "Inactivo" } as const;
export const EMPLOYMENT_LABELS = { titular: "Titular", interino: "Interino", suplente: "Suplente" } as const;
export const TEACHER_SORT_LABELS = { name: "Apellido", "file-number": "Legajo", hours: "Carga horaria" } as const;
export const TEACHER_FILTER_LABELS = { employment: "Revista", subject: "Materia", course: "Curso", shift: "Turno", sort: "Orden" } as const;
export const TEACHER_COLUMNS = {
    teacher: "Docente",
    fileNumber: "Legajo",
    subjects: "Materias",
    courses: "Cursos",
    load: "Carga horaria",
    employment: "Revista",
    status: "Estado",
    actions: "Acciones",
} as const;
export function selectedText(count: number): string {
    return count === 1 ? "1 docente seleccionado" : `${count} docentes seleccionados`;
}
export function teachersTotalText(total: number): string {
    return total === 1 ? "1 docente" : `${total.toLocaleString("es-AR")} docentes`;
}
export function loadText(hours: number, max: number): string {
    return `${hours} de ${max} hs`;
}
export const NEAR_LIMIT_TEXT = "Cerca del límite";
export const OVER_LIMIT_TEXT = "Supera el límite";
export const KPI_LABELS = { load: "Carga horaria", subjects: "Materias distintas", courses: "Cursos a cargo", students: "Estudiantes" } as const;
export const DETAIL_SECTIONS = {
    subjects: "Materias asignadas",
    schedule: "Horario semanal",
    contact: "Contacto",
    employment: "Situación laboral",
    activity: "Actividad reciente",
} as const;
export const DETAIL_LABELS = { email: "Email", phone: "Teléfono", fileNumber: "Legajo", employment: "Revista", status: "Estado", hiredAt: "Fecha de alta", seniority: "Antigüedad", maxHours: "Carga máxima" } as const;
export const NO_SCHEDULE_TEXT = "Todavía no hay horarios cargados.";
export const ACTIVITY_ERROR_TEXT = "No pudimos cargar la actividad.";
export const NO_ACTIVITY_TEXT = "Sin actividad reciente.";
export const BACK_TO_TEACHERS_LABEL = "Volver a docentes";
export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;
export const TEACHER_SAVED_TEXT = "Docente actualizado";
export const TEACHER_CREATED_TEXT = "Docente creado correctamente";
export const TEACHER_SAVE_ERROR_TEXT = "No pudimos guardar el docente. Tus cambios siguen en pantalla.";
export const STATUS_CHANGED_TEXT = "Estado actualizado";
export const EXPORT_ERROR_TEXT = "No pudimos exportar los docentes.";
export const IMPORT_ERROR_TEXT = "No pudimos importar el archivo.";
export const IMPORT_HELP_TEXT = "Archivo CSV con columnas: legajo, nombre, apellido, email, teléfono, revista. Se valida antes de guardar.";
export const NEW_TEACHER_HELP_TEXT = "El docente recibe un correo para entrar a RedEduca con su cuenta.";
export const TEACHER_FIELD_LABELS = {
    fullName: "Nombre y apellido",
    email: "Email",
    phone: "Teléfono",
    fileNumber: "Legajo",
    employmentStatus: "Revista",
    status: "Estado",
    maxWeeklyHours: "Carga máxima semanal (hs)",
    hiredAt: "Fecha de alta",
} as const;
// Asignación
export const ASSIGNMENT_TITLE = "Asignación de materias";
export const ASSIGNMENT_SELECTORS = { schoolYear: "Ciclo lectivo", shift: "Nivel/turno", course: "Curso" } as const;
export const ASSIGNMENT_SUMMARY = { subjects: "Materias", assigned: "Asignadas", unassigned: "Sin docente", conflicts: "Conflictos" } as const;
export const ASSIGNMENT_COLUMNS = { subject: "Materia", hours: "Carga horaria", teacher: "Docente asignado", status: "Estado", actions: "Acciones" } as const;
export const CHOOSE_COURSE_TEXT = "Elegí un curso para ver sus materias.";
export const NO_COURSE_SUBJECTS_TEXT = "Este curso no tiene materias configuradas.";
export const CONFIGURE_PLAN_LABEL = "Configurar plan de estudios";
export const SEARCHING_CANDIDATES_TEXT = "Buscando docentes disponibles…";
export const ASSIGN_TEACHER_LABEL = "Asignar docente";
export const CHANGE_TEACHER_LABEL = "Cambiar docente";
export const REMOVE_TEACHER_LABEL = "Quitar docente";
export const SAVE_ASSIGNMENTS_LABEL = "Guardar asignaciones";
export const DISCARD_LABEL = "Descartar";
export const RETRY_LABEL = "Reintentar";
export const ASSIGNMENTS_SAVED_TEXT = "Asignaciones guardadas";
export const ASSIGNMENTS_ERROR_TEXT = "No pudimos guardar las asignaciones. Tus cambios siguen en pantalla.";
export function pendingChangesText(count: number): string {
    return count === 1 ? "1 cambio sin guardar" : `${count} cambios sin guardar`;
}
export function overLimitText(hours: number, max: number): string {
    return `Con esta asignación pasaría a ${hours} hs semanales. El límite es de ${max} hs.`;
}
export function removeTeacherTitle(teacher: string, subject: string, course: string): string {
    return `¿Quitar a ${teacher} de ${subject} en ${course}?`;
}
export const AVAILABILITY_LABELS = { available: "Disponible", conflict: "Conflicto de horario", "over-limit": "Supera el límite", unavailable: "No disponible" } as const;
export const LICENSE_WARNING_TEXT = "Está de licencia. Podés asignarlo, pero te recomendamos un suplente.";
export const ROW_STATUS = { assigned: "Asignada", unassigned: "Sin docente", changed: "Cambio sin guardar" } as const;
export const CHOOSE_OTHER_LABEL = "Elegir otro docente";
