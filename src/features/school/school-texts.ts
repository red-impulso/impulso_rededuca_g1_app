import type { CourseShift, CourseSort, RecordStatus } from "./types";

// Textos literales del SDD de UX para M6 (escuela, cursos y materias).

// ---- Escuela ----
export const SCHOOL_TITLE = "Datos de la escuela";
export const SCHOOL_SUBTITLE = "Información institucional y configuración";
export const SCHOOL_SAVED_TEXT = "Guardado: datos institucionales actualizados.";
export const SCHOOL_EMPTY_TEXT = "La escuela todavía no tiene datos configurados.";
export const SCHOOL_LOAD_ERROR_TEXT = "No pudimos cargar los datos de la escuela.";
export const CODE_HELP_TEXT = "Formato: ESC-0000";
export const SCHOOL_SECTION_INSTITUTIONAL = "Datos institucionales";
export const SCHOOL_SECTION_CONTACT = "Contacto";
export const SCHOOL_SECTION_CONFIG = "Configuración";
export const SCHOOL_PANEL_TITLE = "Institución";
export const SCHOOL_FIELD_LABELS = {
    name: "Nombre de la institución",
    code: "Código institucional",
    level: "Nivel educativo",
    address: "Dirección",
    city: "Ciudad",
    province: "Provincia",
    phone: "Teléfono",
    email: "Correo institucional",
    website: "Sitio web",
    schoolYear: "Año lectivo activo",
    schedule: "Horario institucional",
    familyCommunications: "Comunicaciones a familias",
    dailyAttendance: "Asistencia diaria",
} as const;
export const SCHOOL_PLACEHOLDERS = {
    name: "Ej. Escuela Normal N.° 1",
    code: "ESC-0000",
    schedule: "Ej. 07:30 – 17:30",
} as const;
export const SELECT_PLACEHOLDER = "Selecciona una opción";
export const RESTORE_LABEL = "Restaurar valores";
export const CANCEL_LABEL = "Cancelar";
export const SAVE_LABEL = "Guardar cambios";
export const SAVING_LABEL = "Guardando…";
export const CHANGE_LOGO_LABEL = "Cambiar logo";
export const UPLOADING_LOGO_LABEL = "Subiendo logo…";
export const LOGO_UPDATED_TEXT = "Logo actualizado correctamente";
export const LOGO_ERROR_TEXT = "No se pudo subir el logo. Revisa tu conexión.";
export const LAST_UPDATE_LABEL = "Última actualización:";
export const SWITCH_ON = "Activado";
export const SWITCH_OFF = "Desactivado";
export const LEAVE_TITLE = "¿Salir sin guardar?";
export const LEAVE_TEXT = "Tienes cambios sin guardar. Si sales, se perderán.";
export const LEAVE_CONFIRM_LABEL = "Salir sin guardar";
export const LEAVE_STAY_LABEL = "Seguir editando";

export const PROVINCES = [
    "Buenos Aires",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Ciudad Autónoma de Buenos Aires",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán",
] as const;

export const LEVELS = ["Inicial", "Primario", "Secundario", "Superior"] as const;

// ---- Cursos y materias ----
export const SHIFT_LABELS: Record<CourseShift, string> = {
    morning: "Mañana",
    afternoon: "Tarde",
    evening: "Noche",
};

export const STATUS_LABELS: Record<RecordStatus, string> = {
    active: "Activo",
    inactive: "Inactivo",
    draft: "Borrador",
};

export const COURSE_SORT_LABELS: Record<CourseSort, string> = {
    name: "Nombre",
    students: "Estudiantes",
};

export const COURSES_LOAD_ERROR_TEXT = "No pudimos cargar los cursos.";
export const SUBJECTS_LOAD_ERROR_TEXT = "No pudimos cargar las materias.";
export const COURSE_LOAD_ERROR_TEXT = "No pudimos cargar el curso.";
export const SUBJECT_LOAD_ERROR_TEXT = "No pudimos cargar la materia.";
export const SAVE_ERROR_TEXT = "No se pudo guardar. Revisa tu conexión.";
export const DELETE_ERROR_TEXT = "No se pudo eliminar. Revisa tu conexión.";
export const OFFLINE_TEXT = "Sin conexión. Revisa tu internet y vuelve a intentar.";
export const FORBIDDEN_TEXT = "No tienes permiso para ver o cambiar estos datos.";
export const NOT_FOUND_TEXT = "No encontramos este registro. Puede que se haya eliminado.";
export const SERVER_ERROR_TEXT = "El servidor tuvo un problema. Prueba de nuevo en unos minutos.";

export const COURSES_EMPTY_TITLE = "Aún no hay cursos registrados";
export const COURSES_EMPTY_TEXT = "Crea el primer curso para empezar.";
export const SUBJECTS_EMPTY_TITLE = "Aún no hay materias registradas";
export const SUBJECTS_EMPTY_TEXT = "Crea la primera materia para empezar.";
export const NO_RESULTS_TITLE = "Sin resultados";
export const NO_RESULTS_TEXT = "Prueba con otro término o limpia los filtros.";

export const COURSE_UPDATED_TEXT = "Curso actualizado correctamente";
export const COURSE_CREATED_TEXT = "Curso creado correctamente";
export const COURSE_DELETED_TEXT = "Curso eliminado correctamente";
export const SUBJECT_UPDATED_TEXT = "Materia actualizada correctamente";
export const SUBJECT_CREATED_TEXT = "Materia creada correctamente";
export const SUBJECT_DELETED_TEXT = "Materia eliminada correctamente";
export const SUBJECT_DEACTIVATED_TEXT = "Materia desactivada correctamente";
export const UPDATE_SUCCESS_TEXT = "Actualización exitosa.";

export const NO_TEACHER_TEXT = "Sin docente";
export const EMPTY_VALUE = "—";

// ---- Validación ----
export const REQUIRED_TEXT = "Este campo es obligatorio.";
export const CODE_FORMAT_TEXT = "Formato inválido. Usa ESC-0000.";
export const FORMAT_TEXT = "Formato inválido.";
export const CLASSROOM_HELP_TEXT = "Opcional. Ayuda a ubicar el curso.";
export const COURSE_NAME_FORMAT_TEXT = "Formato inválido. Usa año y división, por ejemplo 5° Año A.";
export const COURSE_DUPLICATE_TEXT = "Ya existe un curso con el mismo año, división, turno y ciclo lectivo.";

export function subjectDuplicateText(courseLabel: string): string {
    return `Ya existe una materia con ese nombre en ${courseLabel}.`;
}

export function deleteCourseTitle(courseLabel: string): string {
    return `¿Eliminar ${courseLabel}?`;
}
export const DELETE_COURSE_TEXT = "Se quitarán sus materias y docentes asignados. No se puede deshacer.";

// ---- Pantallas de cursos ----
export const COURSES_TITLE = "Cursos";
export const NEW_COURSE_LABEL = "Nuevo curso";
export const CREATE_COURSE_LABEL = "Crear curso";
export const EDIT_COURSE_LABEL = "Editar curso";
export const ASSIGN_TEACHER_LABEL = "Asignar docente";
export const SEE_STUDENTS_LABEL = "Ver estudiantes";
export const SEE_DETAIL_LABEL = "Ver detalle";
export const SEE_LABEL = "Ver";
export const EDIT_LABEL = "Editar";
export const ASSIGN_LABEL = "Asignar";
export const DELETE_LABEL = "Eliminar";
export const BACK_TO_COURSES_LABEL = "Volver a cursos";
export const COURSE_DETAIL_TITLE = "Detalle de curso";
export const SEARCH_LABEL = "Buscar";
export const FILTERS_LABEL = "Filtros";
export const CLEAR_FILTERS_LABEL = "Limpiar filtros";
export const ALL_YEARS_LABEL = "Todos los años";
export const ALL_SHIFTS_LABEL = "Todos";
export const ALL_STATUSES_LABEL = "Todos";
export const SORT_LABEL = "Ordenar";
export const LOADING_TEXT = "Cargando…";
export const SECTION_ERROR_TEXT = "No pudimos cargar este dato.";
export const RETRY_LABEL = "Reintentar";
export const COURSE_COLUMNS = {
    course: "Curso",
    shift: "Turno",
    students: "Estudiantes",
    homeroom: "Tutor responsable",
    status: "Estado",
    actions: "Acciones",
} as const;
export const COURSE_DETAIL_LABELS = {
    division: "División",
    shift: "Turno",
    classroom: "Aula",
    teachers: "Docentes asignados",
    subjects: "Materias asociadas",
    students: "Estudiantes",
} as const;
export const COURSE_FIELD_LABELS = {
    name: "Nombre del curso",
    shift: "Turno",
    schoolYear: "Año lectivo",
    classroom: "Aula",
    homeroomTeacherId: "Tutor responsable",
    status: "Estado",
} as const;
export const COURSE_NAME_PLACEHOLDER = "Ej. 5° Año A";
export const NO_HOMEROOM_OPTION = "Sin tutor responsable";
export const TEACHERS_LOAD_ERROR_TEXT = "No pudimos cargar los docentes.";
export const YEAR_OPTION_PREFIX = "Año";

// ---- Asignar docente (desde cursos y materias) ----
export const ASSIGN_SUBJECT_LABEL = "Materia";
export const ASSIGN_TEACHER_FIELD_LABEL = "Docente";
export const NO_TEACHER_OPTION = "Sin docente";
export const ASSIGN_SAVE_LABEL = "Guardar asignación";
export const TEACHER_ASSIGNED_TEXT = "Docente asignado correctamente";
export const COURSE_WITHOUT_SUBJECTS_TEXT = "Este curso todavía no tiene materias. Crea una materia para asignarle un docente.";

// ---- Pantallas de materias ----
export const SUBJECTS_TITLE = "Materias";
export const NEW_SUBJECT_LABEL = "Nueva materia";
export const CREATE_SUBJECT_LABEL = "Crear materia";
export const EDIT_SUBJECT_LABEL = "Editar materia";
export const CHANGE_TEACHER_LABEL = "Cambiar docente";
export const DEACTIVATE_LABEL = "Desactivar";
export const BACK_TO_SUBJECTS_LABEL = "Volver a materias";
export const SUBJECT_DETAIL_TITLE = "Detalle de materia";
export const ALL_COURSES_LABEL = "Todos los cursos";
export const ALL_TEACHERS_LABEL = "Todos los docentes";
export const SUBJECT_COLUMNS = {
    subject: "Materia",
    course: "Curso",
    teacher: "Docente",
    hours: "Carga horaria",
    status: "Estado",
    actions: "Acciones",
} as const;
export const SUBJECT_DETAIL_LABELS = {
    description: "Descripción",
    course: "Curso",
    teacher: "Docente responsable",
    hours: "Carga horaria semanal",
    students: "Estudiantes",
    updatedAt: "Última actualización",
} as const;
export const SUBJECT_FIELD_LABELS = {
    name: "Nombre de la materia",
    courseId: "Curso",
    weeklyHours: "Carga horaria semanal",
    description: "Descripción",
    teacherId: "Docente",
    status: "Estado",
} as const;
export const SUBJECT_NAME_PLACEHOLDER = "Ej. Matemática";
export const WEEKLY_HOURS_HELP_TEXT = "Horas por semana, entre 1 y 40.";
export function deactivateSubjectTitle(name: string): string {
    return `¿Desactivar ${name}?`;
}
export const DEACTIVATE_SUBJECT_TEXT = "La materia dejará de aparecer en las planillas. Puedes volver a activarla editándola.";
export function deleteSubjectTitle(name: string): string {
    return `¿Eliminar ${name}?`;
}
export const DELETE_SUBJECT_TEXT = "Se quitarán sus notas y su docente asignado. No se puede deshacer.";
