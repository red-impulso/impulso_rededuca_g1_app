import type { Role } from "../session/types";
import {
    ERROR_BODY_EMPTY,
    ERROR_COURSE,
    ERROR_SCOPE,
    ERROR_TITLE_EMPTY,
    ERROR_TITLE_TOO_LONG,
    NO_AUTHOR_LABEL,
    NO_COURSE_NAME_LABEL,
    NO_STUDENT_NAME_LABEL,
    SCOPE_COURSE_LABEL,
    SCOPE_INSTITUTION_LABEL,
    SCOPE_STUDENT_LABEL,
    TITLE_MAX_LENGTH,
} from "./announcements-ui";
import type {
    Announcement,
    AnnouncementCourse,
    AnnouncementForm,
    AnnouncementFormErrors,
    CreateAnnouncementPayload,
    PublishScope,
} from "./types";

// Reglas y lógica de comunicados.
// No usa React ni la API, para poder probarla fácil.

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Alcances en los que cada rol puede publicar (igual que Back):
// - admin y director: institución y curso (cualquier curso)
// - docente: solo curso (y solo en un curso donde dicta materias)
// - tutor: nunca
export function allowedScopes(role: Role): PublishScope[] {
    if (role === "admin" || role === "director") return ["institution", "course"];
    if (role === "teacher") return ["course"];
    return [];
}

// true si el rol ve el botón "Nuevo comunicado"
export function canPublish(role: Role): boolean {
    return allowedScopes(role).length > 0;
}

// De dónde sale la lista de cursos para elegir según el rol:
// docente /me/courses; admin y director /courses; tutor no publica (null)
export function coursesPathFor(role: Role): string | null {
    if (role === "teacher") return "/me/courses";
    if (role === "admin" || role === "director") return "/courses";
    return null;
}

// Nombre del curso: el "name" de Back si viene; si no, "1.º A" (o "1.º" sin división)
export function courseLabel(course: AnnouncementCourse): string {
    if (course.name) return course.name;
    return course.division ? `${course.year}.º ${course.division}` : `${course.year}.º`;
}

// A quién va dirigido un comunicado, en texto (para la etiqueta de la tarjeta)
export function scopeLabel(announcement: Announcement): string {
    if (announcement.scope === "institution") return SCOPE_INSTITUTION_LABEL;
    if (announcement.scope === "course") {
        return announcement.course?.name || SCOPE_COURSE_LABEL;
    }
    // Alumno: "Apellido, Nombre". Si Back no lo encontró vienen vacíos y queda el texto genérico.
    const student = announcement.student;
    if (student && student.firstName.trim() && student.lastName.trim()) {
        return `${student.lastName}, ${student.firstName}`;
    }
    return SCOPE_STUDENT_LABEL;
}

// Autoría: el nombre si vino; si no, un texto provisorio
export function authorLabel(announcement: Announcement): string {
    return announcement.author.fullName?.trim() || NO_AUTHOR_LABEL;
}

// Nombre del curso para mostrar dentro de la tarjeta (provisorio si Back no lo trae)
export function announcementCourseName(announcement: Announcement): string | null {
    if (!announcement.course) return null;
    return announcement.course.name?.trim() || NO_COURSE_NAME_LABEL;
}

// Nombre del alumno para mostrar dentro de la tarjeta
export function announcementStudentName(announcement: Announcement): string | null {
    if (!announcement.student) return null;
    const { firstName, lastName } = announcement.student;
    const name = `${lastName}, ${firstName}`;
    return firstName.trim() && lastName.trim() ? name : NO_STUDENT_NAME_LABEL;
}

// Fecha para mostrar, con la hora de Argentina: "4 nov 2026, 14:30".
// Se arma a mano (no con el formato del navegador) para que se vea igual en todos lados.
// Si la fecha no es válida devuelve "" y la pantalla no muestra nada.
export function formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: ARGENTINA_TIME_ZONE,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    const month = MONTHS[Number(get("month")) - 1] ?? "";
    return `${Number(get("day"))} ${month} ${get("year")}, ${get("hour")}:${get("minute")}`;
}

// Formulario vacío. Arranca en "curso" para todos: es el alcance más chico,
// así nadie publica a toda la institución sin elegirlo a propósito.
export function emptyForm(role: Role): AnnouncementForm {
    const scopes = allowedScopes(role);
    const scope: PublishScope = scopes.includes("course") ? "course" : (scopes[0] ?? "course");
    return { scope, courseId: "", title: "", body: "" };
}

// true si la persona ya escribió o eligió algo (para avisar antes de perder el borrador)
export function isFormDirty(form: AnnouncementForm, role: Role): boolean {
    const empty = emptyForm(role);
    return (
        form.title.trim() !== "" ||
        form.body.trim() !== "" ||
        form.courseId !== empty.courseId ||
        form.scope !== empty.scope
    );
}

// Valida el formulario con los textos de UX. Devuelve un error por campo; {} si está todo bien.
// Back no limita el largo, pero UX pide 120 caracteres para el título: se valida acá.
export function validateForm(
    form: AnnouncementForm,
    role: Role,
    courses: AnnouncementCourse[],
): AnnouncementFormErrors {
    const errors: AnnouncementFormErrors = {};
    const title = form.title.trim();

    if (!title) errors.title = ERROR_TITLE_EMPTY;
    else if (title.length > TITLE_MAX_LENGTH) errors.title = ERROR_TITLE_TOO_LONG;

    if (!allowedScopes(role).includes(form.scope)) errors.scope = ERROR_SCOPE;

    // El curso solo cuenta si el alcance es "curso", y tiene que estar en la lista que Back dejó elegir
    if (form.scope === "course" && !courses.some((course) => course.id === form.courseId)) {
        errors.courseId = ERROR_COURSE;
    }

    if (!form.body.trim()) errors.body = ERROR_BODY_EMPTY;

    return errors;
}

// Lo que se manda a POST /announcements. Devuelve null si el formulario no es válido
// (así nunca se manda algo que Back va a rechazar con un texto técnico).
export function buildPayload(
    form: AnnouncementForm,
    role: Role,
    courses: AnnouncementCourse[],
): CreateAnnouncementPayload | null {
    if (Object.keys(validateForm(form, role, courses)).length > 0) return null;
    const base = { scope: form.scope, title: form.title.trim(), body: form.body.trim() };
    // En "institution" no se manda courseId
    return form.scope === "course" ? { ...base, courseId: form.courseId } : base;
}
