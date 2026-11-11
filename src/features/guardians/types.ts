export type GuardianRelationship = "madre" | "padre" | "tutor-legal" | "encargado" | "familiar-autorizado" | "otro";
export type GuardianLinkStatus = "active" | "inactive" | "pending";

// Vínculo de GET /students/:id/guardians
export type GuardianLink = {
    guardianMembershipId: string;
    relationship: GuardianRelationship | null;
    isPrimary: boolean;
    isEmergencyContact: boolean;
    isFinancialResponsible: boolean;
    status: GuardianLinkStatus | null;
    updatedAt: string | null;
    fullName: string;
    firstName: string | null;
    lastName: string | null;
    dni: string | null;
    phone: string | null;
    // Pedido a Back
    altPhone: string | null;
    address: string | null;
    email: string | null;
    otherStudentsCount: number;
};

// Tutor existente de GET /guardians?q=
export type GuardianCandidate = {
    membershipId: string;
    fullName: string;
    dni: string | null;
    email: string | null;
};

export type GuardianGroups = {
    primary: GuardianLink[];
    secondary: GuardianLink[];
    others: GuardianLink[];
};
