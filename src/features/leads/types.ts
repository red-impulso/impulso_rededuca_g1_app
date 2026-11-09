// Tipos de las postulaciones de la landing (BONUS-4).
// Respuesta de GET /leads y PATCH /leads/:id (solo admin).

export type LeadStatus = "new" | "contacted" | "discarded";

// Filtro de la pantalla: un estado o todas
export type LeadFilter = LeadStatus | "all";

export type Lead = {
    id: string;
    institutionName: string;
    contactName: string;
    city: string;
    contactRole: string;
    level: string;
    // Email o teléfono, como lo escribió la institución
    contactChannel: string;
    studentCount: number;
    comment: string | null;
    status: LeadStatus;
    createdAt: string;
};

// Link para escribirle al contacto
export type ContactLink = { kind: "whatsapp" | "email"; href: string };
