// ZONA PROVISORIA DE UX (M4).
// Acá están juntos los textos, las clases de color y los destinos que todavía no confirmó UX.
// Cuando UX (o Back) los defina, se cambian SOLO en este archivo.
// Solo usa clases y colores que ya existen en el proyecto (sin hexadecimales).

// ---- Pendiente UX: nombre de la pantalla y de la campanita ----
export const SCREEN_TITLE = "Notificaciones";
export const NOTIFICATIONS_HREF = "/notificaciones";

// Nombre accesible de la campanita: "Notificaciones, 3 sin leer"
export function bellAriaLabel(count: number): string {
    if (count <= 0) return SCREEN_TITLE;
    return `${SCREEN_TITLE}, ${count} sin leer`;
}

// ---- Pendiente UX: contador de la campanita ----
// A partir de este número se muestra "99+"
export const BADGE_MAX = 99;
// UX pide rojo #DC2626; se usa el rojo que ya existe (bg-error)
export const BADGE_CLASS = "bg-error text-white";

// ---- Pendiente UX: campanita en el header (posición, tamaño y estados) ----
// Ícono propio en SVG (sin librería de íconos). 44 × 44 px de área táctil.
export const BELL_CLASS = "text-ink hover:bg-page";
// Cuando se está en la bandeja
export const BELL_ACTIVE_CLASS = "bg-page text-ink";

// ---- Pendiente UX: marca de "No leído" (siempre con texto, no solo color) ----
export const UNREAD_LABEL = "No leído";
export const UNREAD_TEXT_CLASS = "text-blue";
export const UNREAD_DOT_CLASS = "bg-blue";
export const UNREAD_CARD_CLASS = "bg-blue/10";
export const READ_CARD_CLASS = "bg-surface";

// ---- Pendiente UX: grupos por día y tiempo transcurrido ----
export const TODAY_LABEL = "Hoy";
export const YESTERDAY_LABEL = "Ayer";
export const JUST_NOW_LABEL = "Recién";

export function minutesAgoText(minutes: number): string {
    return minutes === 1 ? "Hace 1 minuto" : `Hace ${minutes} minutos`;
}

export function hoursAgoText(hours: number): string {
    return hours === 1 ? "Hace 1 hora" : `Hace ${hours} horas`;
}

// ---- Pendiente UX: botones ----
export const MARK_ONE_LABEL = "Marcar leída";
export const MARK_ALL_LABEL = "Marcar todas como leídas";
export const MARKING_LABEL = "Marcando…";
export const RETRY_LABEL = "Reintentar";

// ---- Pendiente UX: eliminar una notificación ----
export const DELETE_LABEL = "Eliminar";
export const DELETING_LABEL = "Eliminando…";
export const DELETE_DIALOG_TITLE = "¿Eliminar la notificación?";
export const DELETE_DIALOG_DESCRIPTION = "Se borra de tu bandeja y no se puede recuperar.";
export const DELETE_CANCEL_LABEL = "Cancelar";
export const DELETED_MESSAGE = "Notificación eliminada.";
export const DELETE_OFFLINE_MESSAGE = "Sin conexión. No pudimos eliminar la notificación.";
export const DELETE_NOT_FOUND_MESSAGE = "Esa notificación ya no está disponible.";
export const DELETE_ERROR_MESSAGE = "No pudimos eliminar la notificación. Probá de nuevo en unos minutos.";
// Borde y letra del botón: rojo del proyecto (no es solo color: lleva el texto "Eliminar")
export const DELETE_BUTTON_CLASS = "text-error";

// ---- Pendiente UX: estados de la bandeja ----
export const LOADING_TEXT = "Cargando notificaciones…";
export const EMPTY_TITLE = "No tenés notificaciones pendientes";
export const EMPTY_DESCRIPTION = "Estás al día.";
export const LOAD_ERROR_TEXT = "No pudimos traer las notificaciones.";
export const SERVER_ERROR_TEXT = "Tuvimos un problema de nuestro lado. Probá de nuevo en unos minutos.";
export const OFFLINE_TEXT = "Sin conexión a internet. Revisá tu conexión y volvé a intentar.";

// ---- Pendiente UX: resultado de marcar como leídas ----
export const ALL_READ_MESSAGE = "Listo, marcaste todas como leídas.";
export const MARK_OFFLINE_MESSAGE = "Sin conexión. No pudimos marcarla como leída.";
export const MARK_NOT_FOUND_MESSAGE = "Esa notificación ya no está disponible.";
export const MARK_ERROR_MESSAGE = "No pudimos marcarla como leída. Probá de nuevo en unos minutos.";
export const MARK_ALL_OFFLINE_MESSAGE = "Sin conexión. No pudimos marcar las notificaciones como leídas.";
export const MARK_ALL_ERROR_MESSAGE =
    "No pudimos marcar las notificaciones como leídas. Probá de nuevo en unos minutos.";

// ---- Destino al tocar una notificación ----
// Back ya manda "type" y "studentId": el destino se arma con eso (notifications-rules.ts).
// Esta tabla queda solo para las notificaciones viejas, que Back dejó como "general":
// se deduce del título que arma Back (notifications.service.ts).
export const DESTINATION_BY_TITLE: Record<string, string> = {
    "Nuevo comunicado": "/comunicados",
    "Nueva nota": "/hijos",
    "Inasistencia registrada": "/hijos",
};
