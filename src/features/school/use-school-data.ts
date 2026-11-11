"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/session/use-session";
import { ApiError, apiFetch } from "@/lib/api";
import {
    COURSES_PATH,
    INSTITUTION_LOGO_PATH,
    INSTITUTION_PATH,
    TEACHER_OPTIONS_PATH,
    courseAssignmentsPath,
    coursePath,
    courseStudentsPath,
    describeApiError,
    parseCourse,
    parseCourseAssignments,
    parseCourses,
    parseSchool,
    parseStudentsPreview,
    parseSubject,
    parseSubjects,
    parseTeacherOptions,
    subjectPath,
    subjectsPath,
    subjectTeacherPath,
    toCourseBody,
    toSchoolBody,
    toSubjectBody,
} from "./school-api";
import type { ErrorInfo } from "./school-api";
import type { CourseFormValues, SchoolFormValues, SubjectFormValues } from "./school-schemas";

// Datos de M6 con TanStack Query. Las claves llevan la escuela activa:
// al cambiar de escuela no se mezclan los datos.

export const schoolKeys = {
    all: (institutionId: string) => ["school", institutionId] as const,
    institution: (institutionId: string) => ["school", institutionId, "institution"] as const,
    courses: (institutionId: string) => ["school", institutionId, "courses"] as const,
    assignments: (institutionId: string, courseId: string) =>
        ["school", institutionId, "courses", courseId, "assignments"] as const,
    studentsPreview: (institutionId: string, courseId: string) =>
        ["school", institutionId, "courses", courseId, "students-preview"] as const,
    subjects: (institutionId: string) => ["school", institutionId, "subjects"] as const,
    teacherOptions: (institutionId: string) => ["school", institutionId, "teacher-options"] as const,
};

// La respuesta llegó con un formato que no se entiende
class ParseError extends Error {}

export function parsed<T>(value: T | null): T {
    if (value === null) throw new ParseError("Respuesta inesperada de la API");
    return value;
}

// Error de una consulta o acción → texto para la pantalla
export function errorInfo(error: unknown, fallback: string): ErrorInfo {
    if (error instanceof ApiError) return describeApiError(error.status, error.message, fallback);
    return describeApiError(null, "", fallback);
}

export function json(method: string, body: unknown): RequestInit {
    return { method, body: JSON.stringify(body) };
}

export function useInstitutionId(): string {
    return useSession().active.id;
}

// GET /institution
export function useSchool() {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: schoolKeys.institution(institutionId),
        queryFn: async () => parsed(parseSchool(await apiFetch<unknown>(INSTITUTION_PATH))),
    });
}

// GET /courses
export function useCourses() {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: schoolKeys.courses(institutionId),
        queryFn: async () => parsed(parseCourses(await apiFetch<unknown>(COURSES_PATH))),
    });
}

// GET /subjects (todas las materias de la escuela)
export function useSubjects() {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: schoolKeys.subjects(institutionId),
        queryFn: async () => parsed(parseSubjects(await apiFetch<unknown>(subjectsPath()))),
    });
}

// GET /courses/:id/assignments → materias del curso con su docente
export function useCourseAssignments(courseId: string) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: schoolKeys.assignments(institutionId, courseId),
        queryFn: async () => parsed(parseCourseAssignments(await apiFetch<unknown>(courseAssignmentsPath(courseId)))),
    });
}

// GET /students?courseId=&limit=3 → cantidad y primeros apellidos
export function useCourseStudentsPreview(courseId: string) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: schoolKeys.studentsPreview(institutionId, courseId),
        queryFn: async () => parsed(parseStudentsPreview(await apiFetch<unknown>(courseStudentsPath(courseId)))),
    });
}

// GET /teachers activos, para elegir tutor responsable o docente
export function useTeacherOptions(enabled = true) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: schoolKeys.teacherOptions(institutionId),
        queryFn: async () => parsed(parseTeacherOptions(await apiFetch<unknown>(TEACHER_OPTIONS_PATH))),
        enabled,
    });
}

// PATCH /institution → vuelve a pedir los datos guardados
export function useSaveSchool() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (values: SchoolFormValues) =>
            apiFetch<unknown>(INSTITUTION_PATH, json("PATCH", toSchoolBody(values))),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: schoolKeys.institution(institutionId) }),
    });
}

// PUT /institution/logo con el archivo
export function useUploadLogo() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => {
            const body = new FormData();
            body.append("file", file);
            return apiFetch<unknown>(INSTITUTION_LOGO_PATH, { method: "PUT", body });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: schoolKeys.institution(institutionId) }),
    });
}

// POST /courses (id null) o PATCH /courses/:id → el curso guardado
export function useSaveCourse() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, values }: { id: string | null; values: CourseFormValues }) => {
            const data = await apiFetch<unknown>(
                id ? coursePath(id) : COURSES_PATH,
                json(id ? "PATCH" : "POST", toCourseBody(values)),
            );
            return parsed(parseCourse(data));
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: schoolKeys.all(institutionId) }),
    });
}

// DELETE /courses/:id (Back responde 409 si tiene alumnos)
export function useDeleteCourse() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiFetch<void>(coursePath(id), { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: schoolKeys.all(institutionId) }),
    });
}

// POST /subjects (id null) o PATCH /subjects/:id → la materia guardada
export function useSaveSubject() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, values }: { id: string | null; values: SubjectFormValues }) => {
            const data = await apiFetch<unknown>(
                id ? subjectPath(id) : subjectsPath(),
                json(id ? "PATCH" : "POST", toSubjectBody(values)),
            );
            return parsed(parseSubject(data));
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: schoolKeys.all(institutionId) }),
    });
}

// PUT /subjects/:id/teacher (null = quitar docente)
export function useSetSubjectTeacher() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ subjectId, teacherId }: { subjectId: string; teacherId: string | null }) =>
            apiFetch<unknown>(subjectTeacherPath(subjectId), json("PUT", { teacherMembershipId: teacherId })),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: schoolKeys.all(institutionId) }),
    });
}

// PATCH /subjects/:id { status: "inactive" }
export function useDeactivateSubject() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiFetch<unknown>(subjectPath(id), json("PATCH", { status: "inactive" })),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: schoolKeys.all(institutionId) }),
    });
}

// DELETE /subjects/:id
export function useDeleteSubject() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiFetch<void>(subjectPath(id), { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: schoolKeys.all(institutionId) }),
    });
}
