import { allowedScopes, courseLabel } from "./announcements-rules";
import {
    COURSE_PLACEHOLDER,
    COURSES_ERROR_TEXT,
    COURSES_LOADING_TEXT,
    FORM_BODY_LABEL,
    FORM_CANCEL_LABEL,
    FORM_COURSE_LABEL,
    FORM_SCOPE_LABEL,
    FORM_SUBMIT_LABEL,
    FORM_TITLE_LABEL,
    FORM_TITLE_PLACEHOLDER,
    NEW_BUTTON_LABEL,
    NO_COURSES_TEXT,
    PUBLISHING_LABEL,
    RETRY_LABEL,
    SCOPE_COURSE_LABEL,
    SCOPE_INSTITUTION_LABEL,
    TEACHER_SCOPE_NOTE,
} from "./announcements-ui";
import { fieldId, titleCounter } from "./announcement-form-state";
import type {
    AnnouncementCourse,
    AnnouncementForm,
    AnnouncementFormErrors,
    AnnouncementFormField,
    PublishScope,
} from "./types";
import type { Role } from "../session/types";

export type CoursesStatus = "loading" | "error" | "ready";

type AnnouncementFormFieldsProps = {
    role: Role;
    form: AnnouncementForm;
    // Solo los errores que hay que mostrar ahora
    errors: AnnouncementFormErrors;
    coursesStatus: CoursesStatus;
    courses: AnnouncementCourse[];
    publishing: boolean;
    // Error del último intento de publicar (null si no hay)
    publishError: { kind: "offline" | "error"; message: string } | null;
    onChange: (patch: Partial<AnnouncementForm>) => void;
    onBlur: (field: AnnouncementFormField) => void;
    onSubmit: () => void;
    onCancel: () => void;
    onRetryCourses: () => void;
};

// Estilos de los controles (radio de 10 px, 44 px de alto, foco visible)
const CONTROL_STYLES =
    "w-full rounded-[10px] border bg-surface px-3 text-ink outline-blue/40 focus-visible:outline-3 disabled:opacity-60";
const LABEL_STYLES = "text-sm font-semibold text-ink";
const BUTTON_STYLES =
    "h-11 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:cursor-not-allowed";

const SCOPE_OPTION_LABEL: Record<PublishScope, string> = {
    institution: SCOPE_INSTITUTION_LABEL,
    course: SCOPE_COURSE_LABEL,
};

function borderOf(hasError: boolean): string {
    return hasError ? "border-error" : "border-line";
}

// Mensaje de error debajo de un campo (vinculado con aria-describedby)
function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return (
        <p id={id} role="alert" className="text-sm text-error">
            {message}
        </p>
    );
}

// Campos del formulario "Nuevo comunicado". Solo dibuja: el estado vive en AnnouncementForm.
// Diseño provisorio: pendiente de confirmar con UX (colores y textos en announcements-ui.ts).
export function AnnouncementFormFields({
    role,
    form,
    errors,
    coursesStatus,
    courses,
    publishing,
    publishError,
    onChange,
    onBlur,
    onSubmit,
    onCancel,
    onRetryCourses,
}: AnnouncementFormFieldsProps) {
    const scopes = allowedScopes(role);
    const counter = titleCounter(form.title);
    const titleErrorId = `${fieldId("title")}-error`;
    const scopeErrorId = `${fieldId("scope")}-error`;
    const courseErrorId = `${fieldId("courseId")}-error`;
    const bodyErrorId = `${fieldId("body")}-error`;

    return (
        <form
            noValidate
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            className="flex max-w-3xl flex-col gap-4 rounded-2xl border border-line bg-surface p-4"
        >
            <h2 className="text-lg font-semibold text-ink">{NEW_BUTTON_LABEL}</h2>

            {/* Título con contador */}
            <div className="flex flex-col gap-1">
                <label htmlFor={fieldId("title")} className={LABEL_STYLES}>
                    {FORM_TITLE_LABEL}
                </label>
                <input
                    id={fieldId("title")}
                    type="text"
                    value={form.title}
                    placeholder={FORM_TITLE_PLACEHOLDER}
                    disabled={publishing}
                    aria-invalid={errors.title ? true : undefined}
                    aria-describedby={`${fieldId("title")}-counter${errors.title ? ` ${titleErrorId}` : ""}`}
                    onChange={(event) => onChange({ title: event.target.value })}
                    onBlur={() => onBlur("title")}
                    className={`h-11 ${CONTROL_STYLES} ${borderOf(Boolean(errors.title))}`}
                />
                <p
                    id={`${fieldId("title")}-counter`}
                    className={`text-xs ${counter.over ? "font-semibold text-error" : "text-muted"}`}
                >
                    {counter.text}
                </p>
                <FieldError id={titleErrorId} message={errors.title} />
            </div>

            {/* Alcance: admin y director eligen; el docente publica siempre en un curso */}
            {scopes.length > 1 ? (
                <fieldset
                    disabled={publishing}
                    aria-describedby={errors.scope ? scopeErrorId : undefined}
                    className="flex flex-col gap-2"
                >
                    <legend className={`mb-1 ${LABEL_STYLES}`}>{FORM_SCOPE_LABEL}</legend>
                    <div className="flex flex-wrap gap-2">
                        {scopes.map((scope, index) => (
                            <label
                                key={scope}
                                className={`flex min-h-11 items-center gap-2 rounded-[10px] border px-3 text-ink ${
                                    form.scope === scope ? "border-blue bg-blue/10" : "border-line bg-surface"
                                }`}
                            >
                                <input
                                    id={index === 0 ? fieldId("scope") : `${fieldId("scope")}-${scope}`}
                                    type="radio"
                                    name={fieldId("scope")}
                                    value={scope}
                                    checked={form.scope === scope}
                                    onChange={() => onChange({ scope })}
                                    className="h-5 w-5 accent-blue"
                                />
                                {SCOPE_OPTION_LABEL[scope]}
                            </label>
                        ))}
                    </div>
                    <FieldError id={scopeErrorId} message={errors.scope} />
                </fieldset>
            ) : (
                <p className="text-sm text-muted">{TEACHER_SCOPE_NOTE}</p>
            )}

            {/* Curso: solo si el alcance es "curso" */}
            {form.scope === "course" && (
                <div className="flex flex-col gap-1">
                    <label htmlFor={fieldId("courseId")} className={LABEL_STYLES}>
                        {FORM_COURSE_LABEL}
                    </label>

                    {coursesStatus === "loading" && (
                        <p role="status" className="text-sm text-muted">
                            {COURSES_LOADING_TEXT}
                        </p>
                    )}

                    {coursesStatus === "error" && (
                        <div className="flex flex-col items-start gap-2">
                            <p role="alert" className="w-full rounded-[10px] bg-error-bg px-4 py-3 text-sm text-error">
                                {COURSES_ERROR_TEXT}
                            </p>
                            <button
                                type="button"
                                onClick={onRetryCourses}
                                className={`${BUTTON_STYLES} border border-line bg-surface text-brand`}
                            >
                                {RETRY_LABEL}
                            </button>
                        </div>
                    )}

                    {coursesStatus === "ready" && courses.length === 0 && (
                        <p role="status" className="rounded-[10px] bg-warning-bg px-4 py-3 text-sm text-warning">
                            {NO_COURSES_TEXT}
                        </p>
                    )}

                    {coursesStatus === "ready" && courses.length > 0 && (
                        <select
                            id={fieldId("courseId")}
                            value={form.courseId}
                            disabled={publishing}
                            aria-invalid={errors.courseId ? true : undefined}
                            aria-describedby={errors.courseId ? courseErrorId : undefined}
                            onChange={(event) => onChange({ courseId: event.target.value })}
                            onBlur={() => onBlur("courseId")}
                            className={`h-11 ${CONTROL_STYLES} ${borderOf(Boolean(errors.courseId))}`}
                        >
                            <option value="">{COURSE_PLACEHOLDER}</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.shift ? `${courseLabel(course)} · ${course.shift}` : courseLabel(course)}
                                </option>
                            ))}
                        </select>
                    )}

                    <FieldError id={courseErrorId} message={errors.courseId} />
                </div>
            )}

            {/* Mensaje (texto simple) */}
            <div className="flex flex-col gap-1">
                <label htmlFor={fieldId("body")} className={LABEL_STYLES}>
                    {FORM_BODY_LABEL}
                </label>
                <textarea
                    id={fieldId("body")}
                    rows={6}
                    value={form.body}
                    disabled={publishing}
                    aria-invalid={errors.body ? true : undefined}
                    aria-describedby={errors.body ? bodyErrorId : undefined}
                    onChange={(event) => onChange({ body: event.target.value })}
                    onBlur={() => onBlur("body")}
                    className={`min-h-32 py-2 ${CONTROL_STYLES} ${borderOf(Boolean(errors.body))}`}
                />
                <FieldError id={bodyErrorId} message={errors.body} />
            </div>

            {/* Sin conexión en amarillo; el resto de los errores en rojo */}
            {publishError && (
                <p
                    role="alert"
                    className={`rounded-[10px] px-4 py-3 text-sm ${
                        publishError.kind === "offline" ? "bg-warning-bg text-warning" : "bg-error-bg text-error"
                    }`}
                >
                    {publishError.message}
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={publishing}
                    className={`${BUTTON_STYLES} border border-line bg-surface text-ink disabled:opacity-60`}
                >
                    {FORM_CANCEL_LABEL}
                </button>
                <button
                    type="submit"
                    disabled={publishing}
                    className={`${BUTTON_STYLES} bg-blue text-white hover:bg-blue/90 disabled:bg-line disabled:text-muted`}
                >
                    {publishing ? PUBLISHING_LABEL : FORM_SUBMIT_LABEL}
                </button>
            </div>
        </form>
    );
}
