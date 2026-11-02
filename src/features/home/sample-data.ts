// Datos de ejemplo (inventados) para la pantalla de Inicio.
// Cuando Back entregue los endpoints reales, se reemplazan por la respuesta de la API.

export type HomeStat = {
  label: string;
  value: string;
  caption: string;
  // Color del número, siempre con los colores de la marca
  tone: "success" | "ink" | "accent" | "blue";
};

export type HomeListItem = {
  id: string;
  title: string;
  when: string;
};

export const sampleStats: HomeStat[] = [
  { label: "Asistencia", value: "94%", caption: "Esta semana", tone: "success" },
  { label: "Promedio", value: "8,2", caption: "Último período", tone: "ink" },
  { label: "Pendientes", value: "4", caption: "Esta semana", tone: "accent" },
  { label: "Mensajes", value: "7", caption: "Sin leer", tone: "blue" },
];

export const sampleAnnouncements: HomeListItem[] = [
  { id: "c1", title: "Reunión de familias 3.° A", when: "Hoy" },
  { id: "c2", title: "Cambio de horario de laboratorio", when: "Ayer" },
  { id: "c3", title: "Entrega de boletines", when: "Lun" },
];

export const sampleEvents: HomeListItem[] = [
  { id: "e1", title: "Examen de Matemática", when: "Mié 29" },
  { id: "e2", title: "Acto institucional", when: "Vie 31" },
];

export const samplePendingTasks: HomeListItem[] = [
  { id: "p1", title: "Cargar notas 2.° B", when: "3 días" },
  { id: "p2", title: "Firmar planificación", when: "5 días" },
];
