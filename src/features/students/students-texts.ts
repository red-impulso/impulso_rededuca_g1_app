// Textos literales del SDD (M7). Voseo/tuteo tal cual el SDD.
export const STUDENTS_TITLE = "Alumnos";
export const NEW_STUDENT_LABEL = "Nuevo alumno";
export const EDIT_STUDENT_LABEL = "Editar alumno";
export const SEARCH_PLACEHOLDER = "Nombre, apellido, DNI o legajo";
export const STUDENTS_EMPTY_TITLE = "Aún no hay alumnos registrados";
export const STUDENTS_EMPTY_TEXT = "Crea el primer alumno para comenzar.";
export const STUDENTS_NO_RESULTS_TITLE = "Sin resultados";
export const STUDENTS_NO_RESULTS_TEXT = "Prueba otro nombre, DNI o legajo.";
export const STUDENTS_LOAD_ERROR_TEXT = "No pudimos cargar los alumnos.";
export const STUDENTS_OFFLINE_TEXT = "Sin conexión. Revisa tu red.";
export const PROFILE_LOAD_ERROR_TEXT = "No pudimos recuperar la ficha.";
export const NO_ACADEMIC_TITLE = "Sin información académica";
export const NO_ACADEMIC_TEXT = "Aún no se cargaron notas.";
export const SEE_COURSES_LABEL = "Ver cursos";
export const STUDENT_CREATED_TEXT = "Nuevo alumno creado";
export const STUDENT_UPDATED_TEXT = "Alumno actualizado";
export const STUDENT_SAVE_ERROR_TEXT = "No se pudo guardar. Revisa tu conexión.";
export const STUDENT_DELETED_TEXT = "Alumno eliminado";
export const STUDENT_DELETE_ERROR_TEXT = "No se pudo eliminar el alumno.";
export function deleteStudentTitle(name: string): string {
    return `¿Eliminar a ${name}?`;
}
export const DELETE_STUDENT_TEXT = "Se perderá su ficha y su historial. No se puede deshacer.";
export const SEE_PROFILE_LABEL = "Ver ficha";
export const MORE_LABEL = "Más";
export const SEE_ATTENDANCE_LABEL = "Ver asistencia";
export const SEE_GRADES_LABEL = "Ver calificaciones";
export const CALL_GUARDIAN_LABEL = "Llamar tutor";
export const ATTENDANCE_LABEL = "Asistencia";
export const GENERATE_REPORT_LABEL = "Generar informe";
export const GENERATING_REPORT_LABEL = "Generando…";
export const REPORT_ERROR_TEXT = "No pudimos generar el informe.";
export const CONTACT_GUARDIAN_LABEL = "Contactar tutor";
export const NO_GUARDIAN_CONTACT_TEXT = "El alumno no tiene un tutor con teléfono o correo.";
export const BACK_TO_STUDENTS_LABEL = "Volver a alumnos";
export const ALL_COURSES_OPTION = "Todos los cursos";
export const ALL_OPTION = "Todos";
export const ALL_YEARS_OPTION = "Todos los años";
export const FILTER_LABELS = { course: "Curso", shift: "Turno", status: "Estado", schoolYear: "Año lectivo", sort: "Orden" } as const;
export const SORT_LABELS = {
    "last-asc": "Apellido A-Z",
    "last-desc": "Apellido Z-A",
    course: "Curso",
    enrollment: "Fecha de ingreso",
} as const;
export const STUDENT_STATUS_LABELS = { active: "Activo", inactive: "Inactivo", draft: "Borrador" } as const;
export const STUDENT_COLUMNS = {
    student: "Alumno",
    dni: "DNI",
    course: "Curso",
    division: "División",
    status: "Estado",
    guardian: "Tutor principal",
    updated: "Actualizado",
    actions: "Acciones",
} as const;
export const KPI_LABELS = {
    average: "Promedio general",
    approved: "Materias aprobadas",
    pending: "Materias pendientes",
    attendance: "Asistencia",
} as const;
export const SECTION_TITLES = {
    personal: "Datos personales",
    academic: "Datos académicos",
    attendance: "Asistencia",
    guardians: "Tutores y familia",
    observations: "Observaciones",
    activity: "Actividad reciente",
} as const;
export const PERSONAL_LABELS = {
    firstName: "Nombre",
    lastName: "Apellido",
    dni: "DNI",
    fileNumber: "Legajo",
    birthDate: "Fecha de nacimiento",
    gender: "Género",
    address: "Dirección",
    phone: "Teléfono",
    email: "Email",
} as const;
export const ACADEMIC_LABELS = {
    course: "Curso actual",
    division: "División",
    shift: "Turno",
    schoolYear: "Año lectivo",
    enrollmentDate: "Fecha de ingreso",
    status: "Estado académico",
} as const;
export const ATTENDANCE_BARS = {
    attendance: "Asistencia",
    justified: "Justificadas",
    unjustified: "Injustificadas",
    late: "Llegadas tarde",
} as const;
export const OBSERVATION_LABELS = { academic: "Alerta académica", institutional: "Observación institucional" } as const;
export const NO_OBSERVATIONS_TEXT = "Sin observaciones.";
export const NO_ACTIVITY_TEXT = "Sin actividad reciente.";
export const ACTIVITY_LOAD_ERROR_TEXT = "No pudimos cargar la actividad.";
export const GUARDIAN_PRIMARY_LABEL = "Tutor principal";
export const GUARDIAN_SECONDARY_LABEL = "Tutor secundario";
export const SEND_ANNOUNCEMENT_LABEL = "Enviar comunicado";
export const CONTACT_LABEL = "Contactar";
export const PROFILE_TABS = { summary: "Ficha", guardians: "Tutores" } as const;
export const GENDER_OPTIONS = ["Femenino", "Masculino", "Otro"] as const;
export const STUDENT_FIELD_LABELS = {
    ...PERSONAL_LABELS,
    courseId: "Curso",
    status: "Estado",
    enrollmentDate: "Fecha de ingreso",
    observationAcademic: "Alerta académica",
    observationInstitutional: "Observación institucional",
} as const;
export const OPTIONAL_SECTION_LABEL = "Datos opcionales";
export const REQUIRED_FIELD_TEXT = "Este campo es obligatorio.";
export const INVALID_EMAIL_TEXT = "Ingresa un correo válido, por ejemplo nombre@dominio.com.";
export const INVALID_DNI_TEXT = "El DNI debe tener 7 u 8 dígitos.";
export const INVALID_DATE_TEXT = "Ingresa una fecha válida.";
export const FUTURE_DATE_TEXT = "La fecha no puede ser futura.";
export function maxLengthText(max: number): string {
    return `Máximo ${max} caracteres.`;
}
export function studentsTotalText(total: number): string {
    const formatted = total.toLocaleString("es-AR");
    return total === 1 ? "1 alumno" : `${formatted} alumnos`;
}
export function pageRangeText(page: number, limit: number, total: number): string {
    if (total === 0) return "0 de 0";
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    return `${from}-${to} de ${total.toLocaleString("es-AR")}`;
}
