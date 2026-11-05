import type { AnnouncementScope } from "./types";

// ZONA PROVISORIA DE UX (M3).
// Acá están juntos los textos y las clases de color que todavía no confirmó UX.
// Cuando UX los defina, se cambian SOLO en este archivo.
// Solo usa clases y colores que ya existen en el proyecto (sin hexadecimales).

// ---- Pendiente UX: nombre del ítem y de la pantalla ----
export const SCREEN_TITLE = "Comunicados";
export const NEW_BUTTON_LABEL = "Nuevo comunicado";

// ---- Pendiente UX: nombres de los alcances ----
export const SCOPE_INSTITUTION_LABEL = "Toda la institución";
export const SCOPE_COURSE_LABEL = "Un curso";
export const SCOPE_STUDENT_LABEL = "Un alumno";

// ---- Pendiente UX: texto cuando faltan datos ----
export const NO_AUTHOR_LABEL = "Autoría sin nombre";
export const NO_COURSE_NAME_LABEL = "Curso sin nombre";
export const NO_STUDENT_NAME_LABEL = "Alumno sin nombre";

// ---- Pendiente UX: colores de la etiqueta de alcance ----
export const SCOPE_BADGE_CLASS: Record<AnnouncementScope, string> = {
    institution: "bg-blue/10 text-blue",
    course: "bg-success-bg text-success",
    student: "bg-page text-muted border border-line",
};

// ---- Textos del formulario (de UX: handoff M3, sección 8.1) ----
export const FORM_TITLE_LABEL = "Título";
export const FORM_TITLE_PLACEHOLDER = "Ej.: Reunión de padres de 3.º B";
export const FORM_SCOPE_LABEL = "¿A quién va dirigido?";
export const FORM_COURSE_LABEL = "Curso";
export const FORM_BODY_LABEL = "Mensaje";
export const FORM_SUBMIT_LABEL = "Publicar comunicado";
export const FORM_CANCEL_LABEL = "Cancelar";

export const TITLE_MAX_LENGTH = 120;
export const ERROR_TITLE_EMPTY = "Escribí un título.";
export const ERROR_TITLE_TOO_LONG = `El título no puede superar los ${TITLE_MAX_LENGTH} caracteres.`;
export const ERROR_SCOPE = "Elegí a quién va dirigido.";
// Provisorio: UX dice "Elegí al menos un curso."; acá se elige uno solo
export const ERROR_COURSE = "Elegí un curso.";
export const ERROR_BODY_EMPTY = "El mensaje no puede estar vacío.";

// ---- Textos de estados de la lista (de UX: handoff M3, sección 10) ----
export const LOADING_TEXT = "Cargando comunicados…";
export const EMPTY_TITLE = "Todavía no hay comunicados.";
export const EMPTY_DESCRIPTION = "Cuando la escuela publique uno, lo vas a ver acá.";
export const LOAD_ERROR_TEXT = "No pudimos traer los comunicados.";
export const SERVER_ERROR_TEXT = "Tuvimos un problema de nuestro lado. Probá de nuevo en unos minutos.";
export const OFFLINE_TEXT = "Sin conexión a internet. Revisá tu conexión y volvé a intentar.";

// ---- Pendiente UX: textos de publicar (UX no definió estos; Back no devuelve cantidad de destinatarios) ----
export const PUBLISHED_MESSAGE = "Comunicado publicado.";
// Si no hubo respuesta, por las dudas se pide revisar la lista: Back no deja borrar ni editar
export const PUBLISH_OFFLINE_MESSAGE =
    "Sin conexión. Tu texto no se perdió. Revisá la lista antes de volver a intentar, por si se publicó.";
export const PUBLISH_FORBIDDEN_MESSAGE = "No tenés permiso para publicar en ese alcance.";
export const PUBLISH_NOT_FOUND_MESSAGE = "No encontramos ese curso. Elegí otro e intentá de nuevo.";
export const PUBLISH_INVALID_MESSAGE = "Revisá los datos del comunicado e intentá de nuevo.";
export const PUBLISH_ERROR_MESSAGE = "No pudimos publicar el comunicado. Probá de nuevo en unos minutos.";

// ---- Pendiente UX: textos de la lista de cursos del formulario ----
export const COURSES_LOADING_TEXT = "Cargando cursos…";
export const COURSES_ERROR_TEXT = "No pudimos cargar los cursos.";
export const NO_COURSES_TEXT = "No tenés cursos asignados para publicar.";

// ---- Pendiente UX: formulario "Nuevo comunicado" (M3-2d) ----
export const COURSE_PLACEHOLDER = "Elegí un curso";
export const PUBLISHING_LABEL = "Publicando…";
export const RETRY_LABEL = "Reintentar";
export const TEACHER_SCOPE_NOTE = "Como docente, publicás en uno de tus cursos.";

// Aviso al salir con texto escrito (UX: handoff M3, sección 8.5)
export const LEAVE_TITLE = "Cambios sin guardar";
export const LEAVE_DESCRIPTION = "Escribiste un comunicado que todavía no se publicó. Si salís, se pierde.";
export const LEAVE_CONFIRM_LABEL = "Salir sin guardar";
export const LEAVE_STAY_LABEL = "Seguir editando";

// Confirmación antes de publicar (UX pide modal; Back no devuelve cantidad de destinatarios).
// Back no deja editar ni borrar: por eso se avisa.
export const CONFIRM_PUBLISH_TITLE = "¿Publicar el comunicado?";
export const CONFIRM_PUBLISH_LABEL = "Publicar";
export const CONFIRM_PUBLISH_BACK_LABEL = "Volver a editar";
export const CONFIRM_PUBLISH_INSTITUTION =
    "Lo van a ver todas las personas de la institución. Después no se puede editar ni borrar.";
export function confirmPublishCourseText(courseName: string): string {
    return `Lo van a ver las personas del curso ${courseName}. Después no se puede editar ni borrar.`;
}
