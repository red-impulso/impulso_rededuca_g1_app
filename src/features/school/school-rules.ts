import type { Role } from "../session/types";
import { EMPTY_VALUE, NO_TEACHER_TEXT, SHIFT_LABELS, STATUS_LABELS } from "./school-texts";
import type {
    Course,
    CourseAssignment,
    CourseFilters,
    CourseRef,
    CourseShift,
    CourseSort,
    PersonRef,
    RecordStatus,
    School,
    StudentsPreview,
    Subject,
    SubjectFilters,
} from "./types";

// Reglas de M6 (escuela, cursos y materias). Funciones puras para poder probarlas fácil.

const SHIFTS: readonly CourseShift[] = ["morning", "afternoon", "evening"];
const STATUSES: readonly RecordStatus[] = ["active", "inactive", "draft"];

export function isShift(value: unknown): value is CourseShift {
    return typeof value === "string" && (SHIFTS as readonly string[]).includes(value);
}

export function isRecordStatus(value: unknown): value is RecordStatus {
    return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

// Solo admin y director gestionan la escuela, los cursos y las materias (Back responde 403 al resto)
export function canManageSchool(role: Role): boolean {
    return role === "admin" || role === "director";
}

// { year: 5, division: "A" } → "5° Año A"; sin año o división usa el nombre de Back
export function courseLabel(course: CourseRef): string {
    if (course.year !== null && course.division) return `${course.year}° Año ${course.division}`;
    return course.name;
}

// "5° Año A", "5° A", "5 a" → { year: 5, division: "A" }; si no se entiende → null
export function parseCourseName(text: string): { year: number; division: string } | null {
    const match = /^\s*(\d{1,2})\s*[°º]?\s*(?:a[ñn]o\s+)?([a-z0-9]{1,10})\s*$/i.exec(text);
    if (!match) return null;
    const year = Number(match[1]);
    if (year < 1 || year > 12) return null;
    return { year, division: match[2].toUpperCase() };
}

export function shiftLabel(shift: CourseShift | null): string {
    return shift ? SHIFT_LABELS[shift] : EMPTY_VALUE;
}

export function statusLabel(status: RecordStatus | null): string {
    return status ? STATUS_LABELS[status] : EMPTY_VALUE;
}

// 1 → "1 estudiante"; 32 → "32 estudiantes"; sin dato → "—"
export function studentsText(count: number | null): string {
    if (count === null) return EMPTY_VALUE;
    return count === 1 ? "1 estudiante" : `${count} estudiantes`;
}

// Tarjeta mobile: "Turno Mañana · 32 estudiantes" (sin los datos que falten)
export function courseCardMeta(course: Course): string {
    const parts: string[] = [];
    if (course.shift) parts.push(`Turno ${SHIFT_LABELS[course.shift]}`);
    if (course.studentsCount !== null) parts.push(studentsText(course.studentsCount));
    return parts.join(" · ");
}

function plural(count: number, singular: string, pluralWord: string): string {
    return `${count} ${count === 1 ? singular : pluralWord}`;
}

// "5 cursos · año lectivo 2027"
export function coursesSubtitle(count: number, schoolYear: number | null): string {
    const base = plural(count, "curso", "cursos");
    return schoolYear === null ? base : `${base} · año lectivo ${schoolYear}`;
}

// "4 materias"
export function subjectsCountText(count: number): string {
    return plural(count, "materia", "materias");
}

// "Mostrando 5 de 5 cursos"
export function showingText(shown: number, total: number, pluralWord: string): string {
    return `Mostrando ${shown} de ${total} ${pluralWord}`;
}

// "Prof. Juan Pérez"; sin docente → "Sin docente"
export function teacherLabel(teacher: PersonRef | null): string {
    if (!teacher) return NO_TEACHER_TEXT;
    return teacher.fullName ? `Prof. ${teacher.fullName}` : "Prof. (sin nombre)";
}

// 5 → "5 h"
export function weeklyHoursShort(hours: number | null): string {
    return hours === null ? EMPTY_VALUE : `${hours} h`;
}

// 5 → "5 h semanales"
export function weeklyHoursLong(hours: number | null): string {
    return hours === null ? EMPTY_VALUE : `${hours} h semanales`;
}

// Tarjeta mobile de materia: "5° Año A · 5 h semanales"
export function subjectCardMeta(subject: Subject): string {
    const parts: string[] = [];
    if (subject.course) parts.push(courseLabel(subject.course));
    if (subject.weeklyHours !== null) parts.push(weeklyHoursLong(subject.weeklyHours));
    return parts.join(" · ");
}

// "32 · Aguirre, Benítez, Cabrera…" (puntos suspensivos si hay más de los que se muestran)
export function studentsPreviewText(preview: StudentsPreview): string {
    if (preview.total === 0) return "0";
    const names = preview.lastNames.join(", ");
    if (!names) return String(preview.total);
    const more = preview.total > preview.lastNames.length ? "…" : "";
    return `${preview.total} · ${names}${more}`;
}

// Docentes distintos de las materias de un curso, en orden de aparición
export function uniqueTeachers(assignments: CourseAssignment[]): PersonRef[] {
    const seen = new Map<string, PersonRef>();
    for (const assignment of assignments) {
        if (assignment.teacher && !seen.has(assignment.teacher.id)) {
            seen.set(assignment.teacher.id, assignment.teacher);
        }
    }
    return [...seen.values()];
}

// Lista de nombres para las filas del detalle; vacía → "—"
export function namesText(names: string[]): string {
    return names.length ? names.join(", ") : EMPTY_VALUE;
}

// Logo sin imagen: inicial del nombre ("Escuela Normal" → "E")
export function schoolInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || "?";
}

// "ESC-0142 · Año lectivo 2027" (sin los datos que falten)
// Sin ningún dato además del nombre → estado "sin datos configurados"
export function isSchoolUnconfigured(school: School): boolean {
    const fields = [school.code, school.level, school.address, school.city, school.province, school.phone, school.email, school.website, school.schedule];
    return fields.every((value) => value === null);
}

// Opciones de un select; si el valor guardado no está en la lista, se agrega para no perderlo
export function optionsWith(values: readonly string[], current: string | null): { value: string; label: string }[] {
    const all = current && !values.includes(current) ? [...values, current] : [...values];
    return all.map((value) => ({ value, label: value }));
}

export function schoolSummary(school: Pick<School, "code" | "schoolYear">): string {
    const parts: string[] = [];
    if (school.code) parts.push(school.code);
    if (school.schoolYear !== null) parts.push(`Año lectivo ${school.schoolYear}`);
    return parts.join(" · ");
}

const AR_TIME_ZONE = "America/Argentina/Buenos_Aires";
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: AR_TIME_ZONE });
const timeFormat = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: AR_TIME_ZONE,
});
const dateFormat = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: AR_TIME_ZONE,
});

// "hoy, 10:42" / "ayer, 10:42" / "8 de nov de 2026, 10:42" (hora de Argentina); inválida → "—"
export function formatUpdatedAt(iso: string | null, now: Date = new Date()): string {
    if (!iso) return EMPTY_VALUE;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
    const time = timeFormat.format(date);
    const day = dayKeyFormat.format(date);
    if (day === dayKeyFormat.format(now)) return `hoy, ${time}`;
    if (day === dayKeyFormat.format(new Date(now.getTime() - 86_400_000))) return `ayer, ${time}`;
    return `${dateFormat.format(date)}, ${time}`;
}

// Minúsculas y sin tildes, para buscar y comparar nombres
export function normalizeText(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function matches(query: string, values: (string | null | undefined)[]): boolean {
    const term = normalizeText(query);
    if (!term) return true;
    return values.some((value) => value && normalizeText(value).includes(term));
}

function compareCourses(a: CourseRef, b: CourseRef): number {
    return (
        (b.schoolYear ?? 0) - (a.schoolYear ?? 0) ||
        (a.year ?? 0) - (b.year ?? 0) ||
        courseLabel(a).localeCompare(courseLabel(b), "es")
    );
}

// Búsqueda, filtros y orden de /cursos (Back devuelve todos los cursos de la escuela)
export function filterCourses(courses: Course[], filters: CourseFilters): Course[] {
    const result = courses.filter(
        (course) =>
            matches(filters.q, [courseLabel(course), course.name, course.classroom, course.homeroomTeacher?.fullName]) &&
            (filters.schoolYear === null || course.schoolYear === filters.schoolYear) &&
            (filters.shift === null || course.shift === filters.shift) &&
            (filters.status === null || course.status === filters.status),
    );
    if (filters.sort === "students") {
        return result.sort((a, b) => (b.studentsCount ?? -1) - (a.studentsCount ?? -1) || compareCourses(a, b));
    }
    return result.sort(compareCourses);
}

// Búsqueda y filtros de /materias
export function filterSubjects(subjects: Subject[], filters: SubjectFilters): Subject[] {
    return subjects.filter(
        (subject) =>
            matches(filters.q, [
                subject.name,
                subject.course ? courseLabel(subject.course) : null,
                subject.teacher?.fullName,
                subject.description,
            ]) &&
            (filters.courseId === null || subject.course?.id === filters.courseId) &&
            (filters.teacherId === null || subject.teacher?.id === filters.teacherId) &&
            (filters.status === null || subject.status === filters.status),
    );
}

// Años lectivos de los cursos, del más nuevo al más viejo
export function schoolYearsOf(courses: CourseRef[]): number[] {
    const years = new Set<number>();
    for (const course of courses) if (course.schoolYear !== null) years.add(course.schoolYear);
    return [...years].sort((a, b) => b - a);
}

// Año lectivo activo: el de la escuela, si no el mayor de los cursos, si no el año actual
export function activeSchoolYear(schoolYear: number | null, courses: CourseRef[], now: Date = new Date()): number {
    return schoolYear ?? schoolYearsOf(courses)[0] ?? now.getFullYear();
}

// Opciones del select "Año lectivo": año anterior, actual y siguiente (más el elegido, si es otro)
export function schoolYearOptions(now: Date = new Date(), current: number | null = null): number[] {
    const year = now.getFullYear();
    const options = new Set([year + 1, year, year - 1]);
    if (current !== null) options.add(current);
    return [...options].sort((a, b) => b - a);
}

// Docentes que aparecen en las materias, para el filtro "Docente"
export function teachersOf(subjects: Subject[]): PersonRef[] {
    const seen = new Map<string, PersonRef>();
    for (const subject of subjects) {
        if (subject.teacher && !seen.has(subject.teacher.id)) seen.set(subject.teacher.id, subject.teacher);
    }
    return [...seen.values()].sort((a, b) => (a.fullName ?? "").localeCompare(b.fullName ?? "", "es"));
}

// Cursos que aparecen en las materias, para el filtro "Curso"
export function coursesOf(subjects: Subject[]): CourseRef[] {
    const seen = new Map<string, CourseRef>();
    for (const subject of subjects) {
        if (subject.course && !seen.has(subject.course.id)) seen.set(subject.course.id, subject.course);
    }
    return [...seen.values()].sort(compareCourses);
}

// La materia ya existe en ese curso (sin importar mayúsculas ni tildes)
export function isDuplicateSubjectName(
    subjects: Subject[],
    courseId: string,
    name: string,
    excludeId: string | null = null,
): boolean {
    const target = normalizeText(name);
    return subjects.some(
        (subject) =>
            subject.id !== excludeId && subject.course?.id === courseId && normalizeText(subject.name) === target,
    );
}

// Ya hay un curso con el mismo año, división, turno y ciclo lectivo (misma regla que Back)
export function isDuplicateCourse(
    courses: CourseRef[],
    key: { year: number; division: string; shift: CourseShift | null; schoolYear: number },
    excludeId: string | null = null,
): boolean {
    return courses.some(
        (course) =>
            course.id !== excludeId &&
            course.year === key.year &&
            (course.division ?? "").toUpperCase() === key.division.toUpperCase() &&
            course.shift === key.shift &&
            course.schoolYear === key.schoolYear,
    );
}

// ---- Filtros en la URL (valores en español) ----

const SHIFT_PARAMS: Record<CourseShift, string> = { morning: "manana", afternoon: "tarde", evening: "noche" };
const STATUS_PARAMS: Record<RecordStatus, string> = { active: "activo", inactive: "inactivo", draft: "borrador" };
const SORT_PARAMS: Record<CourseSort, string> = { name: "nombre", students: "estudiantes" };

function fromParam<T extends string>(map: Record<T, string>, value: string | null): T | null {
    const entry = (Object.entries(map) as [T, string][]).find(([, param]) => param === value);
    return entry ? entry[0] : null;
}

type ParamsLike = { get(name: string): string | null };

export const DEFAULT_COURSE_FILTERS: CourseFilters = { q: "", schoolYear: null, shift: null, status: null, sort: "name" };
export const DEFAULT_SUBJECT_FILTERS: SubjectFilters = { q: "", courseId: null, teacherId: null, status: null };

// ?q=&anio=2027&turno=manana&estado=activo&orden=estudiantes → filtros de /cursos
export function readCourseFilters(params: ParamsLike): CourseFilters {
    const year = Number(params.get("anio"));
    return {
        q: params.get("q") ?? "",
        schoolYear: Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : null,
        shift: fromParam(SHIFT_PARAMS, params.get("turno")),
        status: fromParam(STATUS_PARAMS, params.get("estado")),
        sort: fromParam(SORT_PARAMS, params.get("orden")) ?? "name",
    };
}

// Filtros de /cursos → "?q=...&anio=..." (sin los valores por defecto; vacío → "")
export function courseFiltersQuery(filters: CourseFilters): string {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.schoolYear !== null) params.set("anio", String(filters.schoolYear));
    if (filters.shift) params.set("turno", SHIFT_PARAMS[filters.shift]);
    if (filters.status) params.set("estado", STATUS_PARAMS[filters.status]);
    if (filters.sort !== "name") params.set("orden", SORT_PARAMS[filters.sort]);
    const query = params.toString();
    return query ? `?${query}` : "";
}

// ?q=&curso=<id>&docente=<id>&estado=activo → filtros de /materias
export function readSubjectFilters(params: ParamsLike): SubjectFilters {
    return {
        q: params.get("q") ?? "",
        courseId: params.get("curso") || null,
        teacherId: params.get("docente") || null,
        status: fromParam(STATUS_PARAMS, params.get("estado")),
    };
}

export function subjectFiltersQuery(filters: SubjectFilters): string {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.courseId) params.set("curso", filters.courseId);
    if (filters.teacherId) params.set("docente", filters.teacherId);
    if (filters.status) params.set("estado", STATUS_PARAMS[filters.status]);
    const query = params.toString();
    return query ? `?${query}` : "";
}

// Hay algún filtro o búsqueda aplicada (para "Sin resultados" + "Limpiar filtros")
export function hasCourseFilters(filters: CourseFilters): boolean {
    return courseFiltersQuery({ ...filters, sort: "name" }) !== "";
}

export function hasSubjectFilters(filters: SubjectFilters): boolean {
    return subjectFiltersQuery(filters) !== "";
}
