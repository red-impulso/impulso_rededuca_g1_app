// Tipos de las respuestas de Back para M4 (notificaciones).
// Copian la forma exacta que entrega la API; si Back la cambia, se cambia acá.

// GET /notifications: últimas 50, de la más nueva a la más vieja.
// readAt es null mientras no se leyó.
export type NotificationItem = {
    id: string;
    title: string;
    body: string;
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
