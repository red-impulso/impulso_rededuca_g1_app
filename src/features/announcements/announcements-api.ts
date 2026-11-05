import {
    LOAD_ERROR_TEXT,
    OFFLINE_TEXT,
    PUBLISH_ERROR_MESSAGE,
    PUBLISH_FORBIDDEN_MESSAGE,
    PUBLISH_INVALID_MESSAGE,
    PUBLISH_NOT_FOUND_MESSAGE,
    PUBLISH_OFFLINE_MESSAGE,
    SERVER_ERROR_TEXT,
} from "./announcements-ui";
import type { Announcement, AnnouncementCourse, AnnouncementScope } from "./types";

// Ruta y textos de la API de comunicados.
// Son funciones puras (sin React ni fetch) para poder probarlas fácil.

// GET /announcements (lista) y POST /announcements (publicar)
export const ANNOUNCEMENTS_PATH = "/announcements";

export type ErrorKind = "offline" | "error";

// Texto del error al cargar la lista. status = código de la API (0 si no hubo respuesta).
// Los mensajes de Back son técnicos: no se muestran, se usan los de UX.
export function describeLoadError(status: number | null): { kind: ErrorKind; message: string } {
    if (status === 0) return { kind: "offline", message: OFFLINE_TEXT };
    if (status !== null && status >= 500) return { kind: "error", message: SERVER_ERROR_TEXT };
    return { kind: "error", message: LOAD_ERROR_TEXT };
}

// Texto del error al publicar. Tampoco se muestra el mensaje técnico de Back.
export function describePublishError(status: number | null): { kind: ErrorKind; message: string } {
    if (status === 0) return { kind: "offline", message: PUBLISH_OFFLINE_MESSAGE };
    if (status === 403) return { kind: "error", message: PUBLISH_FORBIDDEN_MESSAGE };
    if (status === 404) return { kind: "error", message: PUBLISH_NOT_FOUND_MESSAGE };
    if (status === 400) return { kind: "error", message: PUBLISH_INVALID_MESSAGE };
    return { kind: "error", message: PUBLISH_ERROR_MESSAGE };
}

const SCOPES: AnnouncementScope[] = ["institution", "course", "student"];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
    return typeof value === "string" ? value : null;
}

// Convierte un elemento de GET /announcements en un Announcement, o null si le faltan
// los datos básicos. Lo que puede venir null (autoría, curso, alumno) se completa.
function parseAnnouncement(value: unknown): Announcement | null {
    if (!isRecord(value)) return null;
    const { id, scope, title, body, createdAt, author, course, student } = value;
    if (typeof id !== "string" || !id) return null;
    if (typeof title !== "string" || typeof body !== "string" || typeof createdAt !== "string") return null;
    if (typeof scope !== "string" || !SCOPES.includes(scope as AnnouncementScope)) return null;

    return {
        id,
        scope: scope as AnnouncementScope,
        title,
        body,
        createdAt,
        author: isRecord(author)
            ? { id: stringOrNull(author.id) ?? "", fullName: stringOrNull(author.fullName) }
            : { id: "", fullName: null },
        course:
            isRecord(course) && typeof course.id === "string"
                ? { id: course.id, name: stringOrNull(course.name) }
                : null,
        student:
            isRecord(student) && typeof student.id === "string"
                ? {
                      id: student.id,
                      firstName: stringOrNull(student.firstName) ?? "",
                      lastName: stringOrNull(student.lastName) ?? "",
                  }
                : null,
    };
}

// Respuesta de GET /announcements → lista. Devuelve null si no es una lista
// (la pantalla lo trata como error). Los elementos rotos se saltean.
export function parseAnnouncements(data: unknown): Announcement[] | null {
    if (!Array.isArray(data)) return null;
    const items: Announcement[] = [];
    for (const entry of data) {
        const parsed = parseAnnouncement(entry);
        if (parsed) items.push(parsed);
    }
    return items;
}

// Respuesta de GET /me/courses o GET /courses → cursos para elegir.
// Devuelve null si no es una lista. Los elementos sin id o sin año se saltean.
export function parseCourses(data: unknown): AnnouncementCourse[] | null {
    if (!Array.isArray(data)) return null;
    const courses: AnnouncementCourse[] = [];
    for (const entry of data) {
        if (!isRecord(entry)) continue;
        if (typeof entry.id !== "string" || !entry.id) continue;
        if (typeof entry.year !== "number") continue;
        const name = typeof entry.name === "string" && entry.name ? entry.name : undefined;
        courses.push({
            id: entry.id,
            ...(name ? { name } : {}),
            year: entry.year,
            division: stringOrNull(entry.division),
            shift: stringOrNull(entry.shift),
        });
    }
    return courses;
}
