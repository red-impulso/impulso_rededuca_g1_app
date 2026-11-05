import { courseLabel } from "./announcements-rules";
import {
    CONFIRM_PUBLISH_INSTITUTION,
    SCOPE_COURSE_LABEL,
    TITLE_MAX_LENGTH,
    confirmPublishCourseText,
} from "./announcements-ui";
import type {
    AnnouncementCourse,
    AnnouncementForm,
    AnnouncementFormErrors,
    AnnouncementFormField,
} from "./types";

// Ayudas puras del formulario "Nuevo comunicado" (sin React, para probarlas fácil).

// Orden en que aparecen los campos (UX: título, destinatarios, curso, mensaje)
export const FIELD_ORDER: AnnouncementFormField[] = ["title", "scope", "courseId", "body"];

// Campos que la persona ya tocó y salió de ellos
export type TouchedFields = Partial<Record<AnnouncementFormField, boolean>>;

const FIELD_IDS: Record<AnnouncementFormField, string> = {
    title: "announcement-title",
    scope: "announcement-scope",
    courseId: "announcement-course",
    body: "announcement-body",
};

// id del elemento de cada campo (sirve para llevar el foco al primer error)
export function fieldId(field: AnnouncementFormField): string {
    return FIELD_IDS[field];
}

// UX: la validación corre al salir de cada campo y de nuevo al enviar.
// Se muestran solo los errores de campos tocados (o todos, si ya se intentó enviar).
export function pickVisibleErrors(
    errors: AnnouncementFormErrors,
    touched: TouchedFields,
    submitted: boolean,
): AnnouncementFormErrors {
    const visible: AnnouncementFormErrors = {};
    for (const field of FIELD_ORDER) {
        const message = errors[field];
        if (message && (submitted || touched[field])) visible[field] = message;
    }
    return visible;
}

// Primer campo con error, en el orden de la pantalla (null si no hay errores)
export function firstInvalidField(errors: AnnouncementFormErrors): AnnouncementFormField | null {
    return FIELD_ORDER.find((field) => Boolean(errors[field])) ?? null;
}

// Contador del título: "12/120". over = se pasó del máximo (se marca en rojo y con texto)
export function titleCounter(title: string): { text: string; over: boolean } {
    const length = title.trim().length;
    return { text: `${length}/${TITLE_MAX_LENGTH}`, over: length > TITLE_MAX_LENGTH };
}

// Texto del modal de confirmación: dice quién va a ver el comunicado
export function confirmDescription(form: AnnouncementForm, courses: AnnouncementCourse[]): string {
    if (form.scope === "institution") return CONFIRM_PUBLISH_INSTITUTION;
    const course = courses.find((item) => item.id === form.courseId);
    return confirmPublishCourseText(course ? courseLabel(course) : SCOPE_COURSE_LABEL);
}
