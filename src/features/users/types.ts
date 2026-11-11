import type { Role } from "../session/types";

export type UserStatus = "active" | "inactive" | "pending" | "blocked";

// Fila de GET /users (por membresía en la escuela activa)
export type UserRow = {
    membershipId: string;
    userId: string;
    role: Role;
    status: UserStatus | null;
    fullName: string;
    firstName: string | null;
    lastName: string | null;
    dni: string | null;
    phone: string | null;
    email: string | null;
    lastAccess: string | null;
    blockedReason: string | null;
    createdAt: string | null;
};

export type UserPage = { data: UserRow[]; total: number; page: number; limit: number };

export type LastAccessFilter = "today" | "7d" | "30d" | "90d+" | "never";

export type UserFilters = {
    q: string;
    role: Role | null;
    status: UserStatus | null;
    lastAccess: LastAccessFilter | null;
    page: number;
};
