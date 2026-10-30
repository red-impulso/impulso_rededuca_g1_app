import type { Role } from "@/features/session/types";

export type NavItem = {
    label: string;
    href: string;
    roles: Role[];
};

// Una línea por ítem: cada módulo agrega las suyas acá.
// Menú por rol: propuesta de Diseño, pendiente de confirmar con el grupo.
export const navItems: NavItem[] = [
    { label: "Inicio", href: "/inicio", roles: ["admin", "director", "teacher", "guardian"] },
    { label: "Usuarios", href: "/usuarios", roles: ["admin"] },
    { label: "Cursos", href: "/cursos", roles: ["director"] },
    { label: "Mis cursos", href: "/mis-cursos", roles: ["teacher"] },
    { label: "Mis hijos", href: "/hijos", roles: ["guardian"] },
    { label: "Calificaciones", href: "/calificaciones", roles: ["admin", "director", "teacher"] },
    { label: "Asistencia", href: "/asistencia", roles: ["admin", "director", "teacher"] },
    { label: "Avisos", href: "/avisos", roles: ["admin", "director", "teacher", "guardian"] },
];

// Devuelve solo los ítems que puede ver el rol indicado
export function getNavItems(role: Role): NavItem[] {
    return navItems.filter((item) => item.roles.includes(role));
}
