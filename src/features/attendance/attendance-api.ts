import type { Role } from "../session/types";

// Rutas y textos de la API de asistencia.
// Son funciones puras (sin React ni fetch) para poder probarlas fácil.

// Textos provisorios: pendiente de confirmar con UX
export const SAVED_MESSAGE = "Lista guardada correctamente";
export const NOTHING_TO_SAVE_MESSAGE = "No había cambios para guardar.";
export const OFFLINE_MESSAGE = "Sin conexión. Tus cambios no se perdieron.";
export const SAVE_ERROR_MESSAGE = "No pudimos guardar la lista. Inténtalo de nuevo.";

// De dónde sale la lista de cursos según el rol:
// - docente: GET /me/courses (sus cursos)
// - admin y director: GET /courses (todos los de la institución)
// - otros roles: no toman lista (null)
export function coursesPathFor(role: Role): string | null {
    if (role === "teacher") return "/me/courses";
    if (role === "admin" || role === "director") return "/courses";
    return null;
}

// GET /attendance?courseId=...&date=YYYY-MM-DD
export function sheetPath(courseId: string, date: string): string {
    return `/attendance?courseId=${encodeURIComponent(courseId)}&date=${encodeURIComponent(date)}`;
}

// Convierte el error de guardado en el texto que ve quien toma lista.
// status = código de la API (0 si no hubo respuesta); null si el error no vino de la API.
export function describeSaveError(
    status: number | null,
    message: string,
): { kind: "offline" | "error"; message: string } {
    // Sin respuesta del servidor: no hay conexión
    if (status === 0) return { kind: "offline", message: OFFLINE_MESSAGE };
    // Rechazos de la API (por ejemplo, una fecha futura): se muestra su mensaje
    if (status !== null && status >= 400 && status < 500 && message) {
        return { kind: "error", message };
    }
    return { kind: "error", message: SAVE_ERROR_MESSAGE };
}
