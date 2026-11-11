import type { Role } from "../session/types";
import type { LastAccessFilter, UserStatus } from "./types";

// Textos literales del SDD (M10, voseo)
export const USERS_TITLE = "Usuarios";
export const INVITE_USER_LABEL = "Invitar usuario";
export const EXPORT_USERS_LABEL = "Exportar";
export const SEARCH_USERS_PLACEHOLDER = "Buscar por nombre, apellido, email o documento";
export const SEARCH_USERS_HELP = "Buscá por nombre, apellido, correo electrónico o documento.";
export const USERS_LOADING_TEXT = "Cargando usuarios…";
export const USERS_EMPTY_TITLE = "No hay usuarios registrados.";
export const USERS_EMPTY_TEXT = "Invitá a las primeras personas para que accedan a RedEduca.";
export function usersNoResultsTitle(q: string): string {
    return q.trim() ? `No encontramos usuarios para “${q.trim()}”.` : "No encontramos usuarios con esos filtros.";
}
export const USERS_NO_RESULTS_TEXT = "Revisá el nombre, el correo o el documento, o quitá los filtros.";
export const USERS_ERROR_TITLE = "No pudimos cargar los usuarios.";
export const USERS_ERROR_TEXT = "Probá de nuevo en unos minutos.";
export const USERS_OFFLINE_TEXT = "Sin conexión. Mostrando los últimos datos guardados.";
export const USER_CREATED_TEXT = "Usuario creado correctamente.";
export const USER_UPDATED_TEXT = "Usuario actualizado correctamente.";
export const ROLE_CHANGED_TEXT = "Permisos modificados correctamente.";
export function invitationSentText(email: string): string {
    return `Invitación enviada a ${email}.`;
}
export const SAVE_ERROR_TEXT = "No pudimos guardar los cambios.";
export const USER_TABS = { all: "Todos", active: "Activos", pending: "Pendientes", blocked: "Bloqueados", inactive: "Inactivos" } as const;
export const USER_STATUS_LABELS: Record<UserStatus, string> = { active: "Activo", inactive: "Inactivo", pending: "Pendiente de activación", blocked: "Bloqueado" };
// Roles de Back (admin, director, teacher, guardian) con los nombres del SDD
export const USER_ROLE_LABELS: Record<Role, string> = { admin: "Administrativo", director: "Directivo", teacher: "Docente", guardian: "Tutor" };
export const LAST_ACCESS_LABELS: Record<LastAccessFilter, string> = { today: "Hoy", "7d": "Últimos 7 días", "30d": "Últimos 30 días", "90d+": "Más de 90 días", never: "Nunca" };
export const USER_FILTER_LABELS = { role: "Rol", status: "Estado", lastAccess: "Último acceso" } as const;
export const USER_COLUMNS = { user: "Usuario", role: "Rol", school: "Escuela asociada", status: "Estado", lastAccess: "Último acceso", actions: "Acciones" } as const;
export const USER_MENU = {
    view: ["Ver detalle", "Datos generales, acceso y permisos"],
    edit: ["Editar usuario", "Cambiar nombre, correo o teléfono"],
    role: ["Cambiar rol", "Modifica los permisos del usuario"],
    reset: ["Restablecer contraseña", "Envía un enlace al correo del usuario"],
    deactivate: ["Desactivar", "Pierde el acceso hasta que se reactive"],
    activate: ["Activar", "Recupera el acceso a RedEduca"],
} as const;
export function usersSelectedText(count: number): string {
    return count === 1 ? "1 usuario seleccionado" : `${count} usuarios seleccionados`;
}
export function usersTotalText(total: number): string {
    return total === 1 ? "1 usuario" : `${total.toLocaleString("es-AR")} usuarios`;
}
export function resultsText(total: number): string {
    return total === 1 ? "1 resultado" : `${total.toLocaleString("es-AR")} resultados`;
}
export function showingText(page: number, limit: number, total: number): string {
    if (total === 0) return "Mostrando 0 usuarios";
    const from = (page - 1) * limit + 1;
    return `Mostrando ${from} a ${Math.min(total, page * limit)} de ${total.toLocaleString("es-AR")} usuarios`;
}
export function deactivateTitle(name: string): string {
    return `¿Desactivar a ${name}?`;
}
export const DEACTIVATE_TEXT = "Perderá el acceso a RedEduca hasta que lo reactives. No se borra ninguno de sus datos.";
export function resetTitle(name: string): string {
    return `¿Restablecer la contraseña de ${name}?`;
}
export function resetText(email: string | null): string {
    return `Le enviaremos un enlace a ${email ?? "su correo"}. Su contraseña actual dejará de funcionar.`;
}
export const SEND_LINK_LABEL = "Enviar enlace";
export function changeRoleTitle(name: string, role: string): string {
    return `¿Cambiar a ${name} a ${role}?`;
}
export function changeRoleText(role: string, school: string): string {
    return `Tendrá acceso a datos y acciones de ${role.toLocaleLowerCase("es")} en ${school}.`;
}
export const LAST_ADMIN_TITLE = "No podés desactivar al último administrador";
export const LAST_ADMIN_TEXT = "Asigná a otra persona como administrador de la escuela y después volvé a intentar.";
export const DETAIL_TITLE = "Detalle de usuario";
export const DETAIL_SECTIONS = { general: "Datos generales", access: "Datos de acceso", permissions: "Permisos" } as const;
export const DETAIL_FIELDS = { firstName: "Nombre", lastName: "Apellido", dni: "Documento", phone: "Teléfono", email: "Correo electrónico", user: "Usuario", lastAccess: "Último acceso", status: "Estado", role: "Rol asignado", schools: "Escuelas asociadas", level: "Nivel de acceso" } as const;
export const ACCESS_LEVELS = ["Lectura", "Edición", "Administración", "Total"] as const;
export const NEVER_TEXT = "Nunca";
export const FORM_LABELS = { firstName: "Nombre", lastName: "Apellido", email: "Correo electrónico", dni: "Documento", phone: "Teléfono", role: "Rol", password: "Contraseña temporal (opcional)" } as const;
export const PASSWORD_HELP = "Si la dejás vacía, la persona recibe un correo para crear su contraseña.";
export const EDIT_USER_TITLE = "Editar usuario";
