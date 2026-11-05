// Tipos de las respuestas de Back para M3 (comunicados).
// Copian la forma exacta que entrega la API; si Back la cambia, se cambia acá.

// Alcances que acepta Back
export type AnnouncementScope = "institution" | "course" | "student";

// GET /announcements: lista del más nuevo al más viejo.
// author.fullName y course.name pueden venir null.
export type Announcement = {
    id: string;
    scope: AnnouncementScope;
    title: string;
    body: string;
    createdAt: string;
    author: { id: string; fullName: string | null };
    course: { id: string; name: string | null } | null;
    student: { id: string; firstName: string; lastName: string } | null;
};

// Alcances que se pueden elegir al crear (el de "student" queda fuera de esta entrega:
// Back lo soporta, pero el Front todavía no tiene lista de alumnos).
export type PublishScope = "institution" | "course";

// POST /announcements: lo que se envía.
// OJO: la respuesta de Back es el registro crudo de la base (snake_case), NO tiene la forma
// de la lista. Después de publicar hay que volver a pedir GET /announcements.
export type CreateAnnouncementPayload = {
    scope: PublishScope;
    courseId?: string;
    title: string;
    body: string;
};

// Curso que se puede elegir al publicar.
// GET /me/courses (docente) trae { id, year, division, shift }.
// GET /courses (admin y director) trae además "name" (por ejemplo "1.º A").
export type AnnouncementCourse = {
    id: string;
    name?: string;
    year: number;
    // Pueden venir null si el curso no tiene división o turno cargado
    division: string | null;
    shift: string | null;
};

// Lo que escribe la persona en el formulario "Nuevo comunicado"
export type AnnouncementForm = {
    scope: PublishScope;
    courseId: string;
    title: string;
    body: string;
};

// Campos del formulario que pueden tener un error
export type AnnouncementFormField = "scope" | "courseId" | "title" | "body";
export type AnnouncementFormErrors = Partial<Record<AnnouncementFormField, string>>;
