import { z } from "zod";
import {
    FUTURE_DATE_TEXT,
    INVALID_DATE_TEXT,
    INVALID_DNI_TEXT,
    INVALID_EMAIL_TEXT,
    REQUIRED_FIELD_TEXT,
    maxLengthText,
} from "./students-texts";
import type { StudentProfile } from "./types";

const optionalText = (max: number) => z.string().trim().max(max, maxLengthText(max));
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function pastDate(value: string): boolean {
    return value === "" || (isoDate.test(value) && !Number.isNaN(new Date(value).getTime()));
}

export const studentSchema = z.object({
    firstName: z.string().trim().min(1, REQUIRED_FIELD_TEXT).max(80, maxLengthText(80)),
    lastName: z.string().trim().min(1, REQUIRED_FIELD_TEXT).max(80, maxLengthText(80)),
    dni: z.string().trim().refine((value) => value === "" || /^\d{7,8}$/.test(value), INVALID_DNI_TEXT),
    fileNumber: optionalText(40),
    courseId: z.string().min(1, REQUIRED_FIELD_TEXT),
    birthDate: z
        .string()
        .refine(pastDate, INVALID_DATE_TEXT)
        .refine((value) => value === "" || new Date(value) <= new Date(), FUTURE_DATE_TEXT),
    gender: z.string().refine((value) => value === "" || ["Femenino", "Masculino", "Otro"].includes(value), REQUIRED_FIELD_TEXT),
    address: optionalText(200),
    phone: optionalText(40),
    email: z.string().trim().max(120, maxLengthText(120)).refine((value) => value === "" || z.email().safeParse(value).success, INVALID_EMAIL_TEXT),
    status: z.enum(["active", "inactive", "draft"]),
    enrollmentDate: z.string().refine(pastDate, INVALID_DATE_TEXT),
    observationAcademic: optionalText(2000),
    observationInstitutional: optionalText(2000),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export function profileToValues(profile: StudentProfile | null, courseId = ""): StudentFormValues {
    const p = profile?.personal;
    return {
        firstName: p?.firstName ?? "",
        lastName: p?.lastName ?? "",
        dni: p?.dni ?? "",
        fileNumber: p?.fileNumber ?? "",
        courseId: profile?.academic.course?.id ?? courseId,
        birthDate: p?.birthDate?.slice(0, 10) ?? "",
        gender: p?.gender ?? "",
        address: p?.address ?? "",
        phone: p?.phone ?? "",
        email: p?.email ?? "",
        status: profile?.academic.status ?? "active",
        enrollmentDate: profile?.academic.enrollmentDate?.slice(0, 10) ?? "",
        observationAcademic: profile?.observations.academic ?? "",
        observationInstitutional: profile?.observations.institutional ?? "",
    };
}
