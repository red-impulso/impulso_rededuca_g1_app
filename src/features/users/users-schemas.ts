import { z } from "zod";
import type { Role } from "../session/types";
import type { UserRow } from "./types";

const name = z.string().trim().min(2, "Entre 2 y 60 caracteres.").max(60, "Entre 2 y 60 caracteres.");

export const userSchema = z.object({
    firstName: name,
    lastName: name,
    email: z.string().trim().refine((value) => z.email().safeParse(value).success, "Ingresá un correo válido, por ejemplo nombre@dominio.com."),
    dni: z.string().trim().refine((value) => value === "" || /^\d{7,8}$/.test(value.replace(/[.\s]/g, "")), "El documento debe tener 7 u 8 dígitos."),
    phone: z.string().trim().refine((value) => value === "" || /^\+?[\d\s-]{8,20}$/.test(value), "Ingresá un teléfono válido."),
    role: z.enum(["admin", "director", "teacher", "guardian"], { message: "Elegí un rol." }),
    temporaryPassword: z.string().refine((value) => value === "" || value.length >= 8, "Mínimo 8 caracteres."),
});

export type UserFormValues = z.infer<typeof userSchema>;

export function userToValues(user: UserRow | null): UserFormValues {
    return {
        firstName: user?.firstName ?? user?.fullName.split(" ")[0] ?? "",
        lastName: user?.lastName ?? user?.fullName.split(" ").slice(1).join(" ") ?? "",
        email: user?.email ?? "",
        dni: user?.dni ?? "",
        phone: user?.phone ?? "",
        role: (user?.role ?? "teacher") as Role,
        temporaryPassword: "",
    };
}

// POST /users
export function toCreateUserBody(values: UserFormValues) {
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    return {
        email: values.email.trim(),
        fullName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role: values.role,
        dni: values.dni.replace(/[.\s]/g, "") || undefined,
        phone: values.phone.trim() || undefined,
        temporaryPassword: values.temporaryPassword || undefined,
    };
}

// PATCH /users/:id: datos personales
export function toUpdateUserBody(values: UserFormValues) {
    const body = toCreateUserBody(values);
    return { fullName: body.fullName, firstName: body.firstName, lastName: body.lastName, email: body.email, dni: body.dni ?? null, phone: body.phone ?? null };
}
