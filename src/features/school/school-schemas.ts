import { z } from "zod";
import { isDuplicateCourse, isDuplicateSubjectName, isRecordStatus, isShift, parseCourseName, courseLabel } from "./school-rules";
import {
    CODE_FORMAT_TEXT,
    COURSE_DUPLICATE_TEXT,
    COURSE_NAME_FORMAT_TEXT,
    FORMAT_TEXT,
    REQUIRED_TEXT,
    subjectDuplicateText,
} from "./school-texts";
import type { Course, CourseRef, School, Subject } from "./types";

// Validación de los formularios de M6 (React Hook Form + Zod).
// Los valores son textos tal cual los escribe la persona; se convierten al cuerpo de la API en school-api.ts.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s()-]{6,20}$/;
const WEBSITE_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;
const SCHEDULE_RE = /^([01]\d|2[0-3]):[0-5]\d\s*[–-]\s*([01]\d|2[0-3]):[0-5]\d$/;

function maxText(max: number) {
    return z.string().trim().max(max, `Máximo ${max} caracteres.`);
}

function optionalMatching(re: RegExp, message: string, max: number) {
    return maxText(max).refine((value) => value === "" || re.test(value), message);
}

export const schoolSchema = z.object({
    name: maxText(120).min(1, REQUIRED_TEXT),
    code: optionalMatching(/^ESC-\d{4}$/, CODE_FORMAT_TEXT, 8),
    level: z.string(),
    address: maxText(200),
    city: maxText(80),
    province: z.string(),
    phone: optionalMatching(PHONE_RE, FORMAT_TEXT, 20),
    email: optionalMatching(EMAIL_RE, FORMAT_TEXT, 120),
    website: optionalMatching(WEBSITE_RE, FORMAT_TEXT, 200),
    schoolYear: z.string().min(1, REQUIRED_TEXT),
    schedule: optionalMatching(SCHEDULE_RE, "Formato inválido. Usa 07:30 – 17:30.", 20),
    familyCommunications: z.boolean(),
    dailyAttendance: z.boolean(),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;

// Datos de Back → valores del formulario ("Restaurar valores" vuelve a estos)
export function schoolToValues(school: School | null, now: Date = new Date()): SchoolFormValues {
    return {
        name: school?.name ?? "",
        code: school?.code ?? "",
        level: school?.level ?? "",
        address: school?.address ?? "",
        city: school?.city ?? "",
        province: school?.province ?? "",
        phone: school?.phone ?? "",
        email: school?.email ?? "",
        website: school?.website ?? "",
        schoolYear: String(school?.schoolYear ?? now.getFullYear()),
        schedule: school?.schedule ?? "",
        familyCommunications: school?.familyCommunications ?? false,
        dailyAttendance: school?.dailyAttendance ?? false,
    };
}

const courseFields = z.object({
    name: z.string().trim().min(1, REQUIRED_TEXT).refine((value) => value === "" || parseCourseName(value) !== null, COURSE_NAME_FORMAT_TEXT),
    shift: z.string().refine((value): boolean => isShift(value), REQUIRED_TEXT),
    schoolYear: z.string().min(1, REQUIRED_TEXT),
    classroom: maxText(40),
    homeroomTeacherId: z.string(),
    status: z.string().refine((value): boolean => isRecordStatus(value), REQUIRED_TEXT),
});

export type CourseFormValues = z.infer<typeof courseFields>;

// Formulario de curso: además avisa si ya existe (Back también lo rechaza con 409)
export function makeCourseSchema(courses: CourseRef[], excludeId: string | null = null) {
    return courseFields.superRefine((values, ctx) => {
        const key = parseCourseName(values.name);
        if (!key || !isShift(values.shift) || !values.schoolYear) return;
        const duplicated = isDuplicateCourse(
            courses,
            { ...key, shift: values.shift, schoolYear: Number(values.schoolYear) },
            excludeId,
        );
        if (duplicated) ctx.addIssue({ code: "custom", path: ["name"], message: COURSE_DUPLICATE_TEXT });
    });
}

export function courseToValues(course: Course | null, defaultSchoolYear: number): CourseFormValues {
    return {
        name: course ? courseLabel(course) : "",
        shift: course?.shift ?? "",
        schoolYear: String(course?.schoolYear ?? defaultSchoolYear),
        classroom: course?.classroom ?? "",
        homeroomTeacherId: course?.homeroomTeacher?.id ?? "",
        status: course?.status ?? "active",
    };
}

const subjectFields = z.object({
    name: maxText(120).min(1, REQUIRED_TEXT),
    courseId: z.string().min(1, REQUIRED_TEXT),
    weeklyHours: z
        .string()
        .trim()
        .refine((value) => value === "" || (/^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 40), "Ingresa un número entre 1 y 40."),
    description: maxText(500),
    teacherId: z.string(),
    status: z.string().refine((value): boolean => isRecordStatus(value), REQUIRED_TEXT),
});

export type SubjectFormValues = z.infer<typeof subjectFields>;

// Formulario de materia: el nombre es único dentro del curso
export function makeSubjectSchema(subjects: Subject[], courses: CourseRef[], excludeId: string | null = null) {
    return subjectFields.superRefine((values, ctx) => {
        if (!values.name || !values.courseId) return;
        if (isDuplicateSubjectName(subjects, values.courseId, values.name, excludeId)) {
            const course = courses.find((item) => item.id === values.courseId);
            ctx.addIssue({
                code: "custom",
                path: ["name"],
                message: subjectDuplicateText(course ? courseLabel(course) : "este curso"),
            });
        }
    });
}

export function subjectToValues(subject: Subject | null, courseId = ""): SubjectFormValues {
    return {
        name: subject?.name ?? "",
        courseId: subject?.course?.id ?? courseId,
        weeklyHours: subject?.weeklyHours !== null && subject?.weeklyHours !== undefined ? String(subject.weeklyHours) : "",
        description: subject?.description ?? "",
        teacherId: subject?.teacher?.id ?? "",
        status: subject?.status ?? "active",
    };
}
