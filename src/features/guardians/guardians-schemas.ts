import { z } from "zod";
import { ADDRESS_TEXT, DNI_TEXT, EMAIL_TEXT, NAME_LENGTH_TEXT, PHONE_TEXT, REQUIRED_TEXT } from "./guardians-texts";
import type { GuardianLink } from "./types";

const name = z.string().trim().min(2, NAME_LENGTH_TEXT).max(60, NAME_LENGTH_TEXT);
const phone = z.string().trim().regex(/^\d{10}$/, PHONE_TEXT);

// Validaciones del SDD (M9)
export const guardianSchema = z.object({
    firstName: name,
    lastName: name,
    dni: z.string().trim().regex(/^\d{7,8}$/, DNI_TEXT),
    relationship: z.enum(["madre", "padre", "tutor-legal", "encargado", "familiar-autorizado", "otro"], { message: REQUIRED_TEXT }),
    email: z.string().trim().refine((value) => z.email().safeParse(value).success, EMAIL_TEXT),
    phone,
    altPhone: z.string().trim().refine((value) => value === "" || /^\d{10}$/.test(value), PHONE_TEXT),
    address: z.string().trim().max(120, ADDRESS_TEXT),
    isEmergencyContact: z.boolean(),
    isFinancialResponsible: z.boolean(),
});

export type GuardianFormValues = z.infer<typeof guardianSchema>;

// Solo el vínculo (tutor existente): no se validan sus datos personales
export const linkOnlySchema = guardianSchema.pick({ relationship: true, isEmergencyContact: true, isFinancialResponsible: true });

export function linkToValues(link: GuardianLink | null): GuardianFormValues {
    const [first, ...rest] = (link?.fullName ?? "").split(" ");
    return {
        firstName: link?.firstName ?? first ?? "",
        lastName: link?.lastName ?? rest.join(" "),
        dni: link?.dni ?? "",
        relationship: link?.relationship ?? ("" as GuardianFormValues["relationship"]),
        email: link?.email ?? "",
        phone: link?.phone?.replace(/\D/g, "") ?? "",
        altPhone: link?.altPhone?.replace(/\D/g, "") ?? "",
        address: link?.address ?? "",
        isEmergencyContact: link?.isEmergencyContact ?? false,
        isFinancialResponsible: link?.isFinancialResponsible ?? false,
    };
}
