// Tipos del contrato de sesión (los consume todo el Front)
export type Role = "admin" | "director" | "teacher" | "guardian";

export type Profile = {
    id: string;
    fullName: string;
    phone: string | null;
};

export type Membership = {
    id: string;
    institutionId: string;
    institutionName: string;
    role: Role;
};

// Respuesta de GET /me
export type MeResponse = {
    profile: Profile;
    memberships: Membership[];
};

export type Session = {
    profile: Profile;
    memberships: Membership[];
    active: Membership;
};

// Nombres de rol visibles en pantalla
export const ROLE_LABELS: Record<Role, string> = {
    admin: "Administración",
    director: "Directiva",
    teacher: "Docente",
    guardian: "Tutor/a",
};
