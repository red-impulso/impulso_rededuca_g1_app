import { z } from "zod";
import type { TeacherDetail } from "./types";

const REQUIRED = "Este campo es obligatorio.";

// Alta/edición (el SDD lo deja pendiente: sigue los campos de Back)
export const teacherSchema = z.object({
    fullName: z.string().trim().min(2, "Ingresá nombre y apellido.").max(120, "Máximo 120 caracteres."),
    email: z.string().trim().refine((value) => z.email().safeParse(value).success, "Ingresá un correo válido, por ejemplo nombre@dominio.com."),
    phone: z.string().trim().max(40, "Máximo 40 caracteres."),
    fileNumber: z.string().trim().max(40, "Máximo 40 caracteres."),
    employmentStatus: z.enum(["titular", "interino", "suplente"], { message: REQUIRED }),
    status: z.enum(["activo", "licencia", "inactivo"], { message: REQUIRED }),
    maxWeeklyHours: z.string().refine((value) => /^\d+$/.test(value) && Number(value) <= 80, "Entre 0 y 80 horas."),
    hiredAt: z.string().refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Ingresá una fecha válida."),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

export function teacherToValues(teacher: TeacherDetail | null): TeacherFormValues {
    return {
        fullName: teacher?.fullName ?? "",
        email: teacher?.email ?? "",
        phone: teacher?.phone ?? "",
        fileNumber: teacher?.fileNumber ?? "",
        employmentStatus: teacher?.employmentStatus ?? "titular",
        status: teacher?.status ?? "activo",
        maxWeeklyHours: String(teacher?.kpis.maxWeeklyHours ?? 30),
        hiredAt: teacher?.hiredAt?.slice(0, 10) ?? "",
    };
}

// PATCH /teachers/:id: solo lo que Back acepta
export function toTeacherPatch(values: TeacherFormValues) {
    return {
        fileNumber: values.fileNumber.trim() || undefined,
        employmentStatus: values.employmentStatus,
        status: values.status,
        maxWeeklyHours: Number(values.maxWeeklyHours),
        hiredAt: values.hiredAt || undefined,
    };
}

// Alta: POST /users con rol docente (existe) y luego PATCH /teachers/:id con los datos laborales
export function toTeacherUser(values: TeacherFormValues) {
    return { email: values.email.trim(), fullName: values.fullName.trim(), role: "teacher" as const, phone: values.phone.trim() || undefined };
}
