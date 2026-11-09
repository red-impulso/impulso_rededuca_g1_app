import type { LeadFilter, LeadStatus } from "./types";

// ZONA PROVISORIA DE UX (BONUS-4).
// Textos y clases de color de la pantalla "Interesados", todavía sin diseño de UX.
// Cuando UX los defina, se cambian SOLO en este archivo.
// Solo usa clases y colores que ya existen en el proyecto (sin hexadecimales).

export const SCREEN_TITLE = "Interesados";
export const SCREEN_SUBTITLE = "Instituciones que se postularon desde la landing";

// ---- Filtro por estado (arranca en Nuevos) ----
export const FILTER_LABEL = "Filtrar por estado";
export const FILTER_OPTIONS: { value: LeadFilter; label: string }[] = [
    { value: "new", label: "Nuevos" },
    { value: "contacted", label: "Contactados" },
    { value: "discarded", label: "Descartados" },
    { value: "all", label: "Todos" },
];

// ---- Estado de cada postulación (siempre con texto, nunca solo color) ----
export const STATUS_LABELS: Record<LeadStatus, string> = {
    new: "Nuevo",
    contacted: "Contactado",
    discarded: "Descartado",
};

export const STATUS_CLASS: Record<LeadStatus, string> = {
    new: "bg-blue/10 text-blue",
    contacted: "bg-success-bg text-success",
    discarded: "bg-page text-muted",
};

// Botones para cambiar el estado
export const STATUS_ACTIONS: Record<LeadStatus, string> = {
    new: "Volver a nuevo",
    contacted: "Marcar contactado",
    discarded: "Descartar",
};

export const UPDATING_TEXT = "Guardando…";

// ---- Columnas y etiquetas ----
export const INSTITUTION_COLUMN = "Institución";
export const LEVEL_COLUMN = "Nivel";
export const STUDENTS_COLUMN = "Alumnos";
export const CONTACT_COLUMN = "Contacto";
export const DATE_COLUMN = "Fecha";
export const STATUS_COLUMN = "Estado";
export const ACTIONS_COLUMN = "Acciones";
export const COMMENT_LABEL = "Comentario";
export const STUDENTS_SUFFIX = "alumnos";
export const WHATSAPP_LABEL = "WhatsApp";
export const EMAIL_LABEL = "Email";

// ---- Estados de la pantalla ----
export const LOADING_TEXT = "Cargando postulaciones…";
export const EMPTY_TITLE = "Todavía no hay postulaciones";
export const EMPTY_FILTER_DESCRIPTION = "No hay postulaciones con este estado.";

// ---- Avisos al cambiar el estado ----
export const UPDATED_MESSAGE: Record<LeadStatus, string> = {
    new: "La postulación volvió a Nuevos.",
    contacted: "Postulación marcada como contactada.",
    discarded: "Postulación descartada.",
};

// ---- Textos de error (no se muestran los mensajes técnicos de Back) ----
export const LOAD_ERROR_TEXT = "No pudimos traer las postulaciones.";
export const UPDATE_ERROR_TEXT = "No pudimos cambiar el estado. Probá de nuevo.";
export const NOT_FOUND_TEXT = "Esa postulación ya no existe.";
export const SERVER_ERROR_TEXT = "Tuvimos un problema de nuestro lado. Probá de nuevo en unos minutos.";
export const OFFLINE_TEXT = "Sin conexión a internet. Revisá tu conexión y volvé a intentar.";
export const FORBIDDEN_TEXT = "Solo la administración puede ver las postulaciones.";

// ---- Pantalla para otros roles (Back responde 403 a quien no es admin) ----
export const NOT_ALLOWED_TITLE = "Esta pantalla es para la administración";
export const NOT_ALLOWED_DESCRIPTION = "Con tu perfil no podés ver las postulaciones de la landing.";
