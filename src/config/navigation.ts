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
    { label: "Tablero", href: "/tablero", roles: ["admin", "director"] },
    { label: "Escuela", href: "/escuela", roles: ["admin", "director"] },
    { label: "Alumnos", href: "/alumnos", roles: ["admin", "director"] },
    { label: "Docentes", href: "/docentes", roles: ["admin", "director"] },
    { label: "Cursos", href: "/cursos", roles: ["admin", "director"] },
    { label: "Materias", href: "/materias", roles: ["admin", "director"] },
    { label: "Usuarios", href: "/usuarios", roles: ["admin"] },
    { label: "Interesados", href: "/interesados", roles: ["admin"] },
    // Sección en construcción: muestra "Próximamente"
    { label: "Mis cursos", href: "/mis-cursos", roles: ["teacher"] },
    { label: "Mis hijos", href: "/hijos", roles: ["guardian"] },
    // Solo el docente carga notas (Back responde /me/subjects únicamente a ese rol)
    { label: "Calificaciones", href: "/calificaciones", roles: ["teacher"] },
    { label: "Asistencia", href: "/asistencia", roles: ["admin", "director", "teacher"] },
    { label: "Avisos", href: "/comunicados", roles: ["admin", "director", "teacher", "guardian"] },
];

// Devuelve solo los ítems que puede ver el rol indicado
export function getNavItems(role: Role): NavItem[] {
    return navItems.filter((item) => item.roles.includes(role));
}
