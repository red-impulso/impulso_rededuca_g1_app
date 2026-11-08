// Tipos de las respuestas de Back para M4 (notificaciones).
// Copian la forma exacta que entrega la API; si Back la cambia, se cambia acá.

// Categoría que clasifica Back. Las notificaciones anteriores a la migración
// de Back vienen como "general", aunque su título sea de nota o inasistencia.
export type NotificationType = "grade" | "attendance" | "announcement" | "general";

// GET /notifications: últimas 50, de la más nueva a la más vieja.
// readAt es null mientras no se leyó. studentId solo viene en notas e inasistencias.
// Back también manda "link" (/calificaciones, /asistencia): no se usa porque son
// pantallas del docente; el destino del tutor se arma con type + studentId.
export type NotificationItem = {
    id: string;
    title: string;
    body: string;
    type: NotificationType;
    studentId: string | null;
    readAt: string | null;
    createdAt: string;
};

// Grupo de la bandeja: "Hoy", "Ayer" o una fecha (día con hora de Argentina)
export type NotificationGroup = {
    // Día en formato YYYY-MM-DD (sirve de key en React)
    day: string;
    label: string;
    items: NotificationItem[];
};
