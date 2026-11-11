"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { json, parsed, useInstitutionId } from "../school/use-school-data";
import { parseStudentActivity } from "../students/students-api";
import { courseAssignmentsPath, subjectTeacherPath } from "../school/school-api";
import {
    TEACHER_COUNTS_PATH,
    TEACHERS_IMPORT_PATH,
    candidatesPath,
    courseAssignmentsSavePath,
    parseAssignmentRows,
    parseCandidates,
    parseTeacherCounts,
    parseTeacherDetail,
    parseTeacherPage,
    teacherActivityPath,
    teacherPath,
    TEACHERS_PATH,
    teachersExportPath,
    teachersListPath,
} from "./teachers-api";
import type { PendingChanges } from "./teachers-rules";
import { toTeacherCreate, toTeacherPatch } from "./teachers-schemas";
import type { TeacherFormValues } from "./teachers-schemas";
import type { TeacherFilters, TeacherStatus } from "./types";

export const teacherKeys = {
    all: (institutionId: string) => ["teachers", institutionId] as const,
    list: (institutionId: string, filters: TeacherFilters) => ["teachers", institutionId, "list", filters] as const,
    counts: (institutionId: string) => ["teachers", institutionId, "counts"] as const,
    detail: (institutionId: string, id: string) => ["teachers", institutionId, "detail", id] as const,
    activity: (institutionId: string, id: string) => ["teachers", institutionId, "activity", id] as const,
    assignments: (institutionId: string, courseId: string) => ["teachers", institutionId, "assignments", courseId] as const,
    candidates: (institutionId: string, courseId: string, subjectId: string) => ["teachers", institutionId, "candidates", courseId, subjectId] as const,
};

function useInvalidate() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({ queryKey: teacherKeys.all(institutionId) });
        void queryClient.invalidateQueries({ queryKey: ["school", institutionId] });
    };
}

export function useTeachers(filters: TeacherFilters) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: teacherKeys.list(institutionId, filters),
        queryFn: async () => parsed(parseTeacherPage(await apiFetch<unknown>(teachersListPath(filters)))),
        placeholderData: keepPreviousData,
    });
}

// Pedido a Back: contadores de las pestañas
export function useTeacherCounts() {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: teacherKeys.counts(institutionId),
        queryFn: async () => parsed(parseTeacherCounts(await apiFetch<unknown>(TEACHER_COUNTS_PATH))),
        retry: false,
    });
}

export function useTeacher(id: string) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: teacherKeys.detail(institutionId, id),
        queryFn: async () => parsed(parseTeacherDetail(await apiFetch<unknown>(teacherPath(id)))),
    });
}

// Pedido a Back
export function useTeacherActivity(id: string) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: teacherKeys.activity(institutionId, id),
        queryFn: async () => parsed(parseStudentActivity(await apiFetch<unknown>(teacherActivityPath(id)))),
    });
}

export function useCourseAssignmentRows(courseId: string | null) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: teacherKeys.assignments(institutionId, courseId ?? ""),
        queryFn: async () => parsed(parseAssignmentRows(await apiFetch<unknown>(courseAssignmentsPath(courseId ?? "")))),
        enabled: Boolean(courseId),
    });
}

// Pedido a Back (GET /teachers/candidates). Mientras no exista, el selector muestra el error.
export function useCandidates(courseId: string, subjectId: string | null) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: teacherKeys.candidates(institutionId, courseId, subjectId ?? ""),
        queryFn: async () => parsed(parseCandidates(await apiFetch<unknown>(candidatesPath(courseId, subjectId ?? "")))),
        enabled: Boolean(subjectId),
        retry: false,
    });
}

// Alta: POST /teachers. Edición: PATCH /teachers/:id (también nombre, correo y teléfono).
export function useSaveTeacher() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async ({ id, values }: { id: string | null; values: TeacherFormValues }) => {
            if (id) {
                await apiFetch<unknown>(teacherPath(id), json("PATCH", { ...toTeacherPatch(values), fullName: values.fullName.trim(), email: values.email.trim(), phone: values.phone.trim() || null }));
                return id;
            }
            const created = await apiFetch<{ id?: unknown; membershipId?: unknown }>(TEACHERS_PATH, json("POST", toTeacherCreate(values)));
            return parsed(typeof created?.id === "string" ? created.id : typeof created?.membershipId === "string" ? created.membershipId : null);
        },
        onSuccess: invalidate,
    });
}

export function useChangeTeacherStatus() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async ({ ids, status }: { ids: string[]; status: TeacherStatus }) => {
            for (const id of ids) await apiFetch<unknown>(teacherPath(id), json("PATCH", { status }));
        },
        onSuccess: invalidate,
    });
}

// Pedido a Back: GET /teachers/export → { url } del CSV
export function useExportTeachers() {
    return useMutation({
        mutationFn: async (ids: string[]) => {
            const data = await apiFetch<{ url?: unknown }>(teachersExportPath(ids));
            return parsed(typeof data?.url === "string" ? data.url : null);
        },
    });
}

// Pedido a Back: POST /teachers/import (multipart "file")
export function useImportTeachers() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async (file: File) => {
            const body = new FormData();
            body.append("file", file);
            return apiFetch<unknown>(TEACHERS_IMPORT_PATH, { method: "POST", body });
        },
        onSuccess: invalidate,
    });
}

// Guarda todo junto: PUT /courses/:id/assignments. Si responde 404, usa PUT /subjects/:id/teacher por materia.
export function useSaveAssignments(courseId: string) {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async (changes: PendingChanges) => {
            const assignments = Object.entries(changes).map(([subjectId, teacher]) => ({ subjectId, teacherMembershipId: teacher?.id ?? null }));
            try {
                await apiFetch<unknown>(courseAssignmentsSavePath(courseId), json("PUT", { assignments }));
            } catch (error) {
                if (!(error instanceof Error && "status" in error && (error as { status: number }).status === 404)) throw error;
                for (const item of assignments) await apiFetch<unknown>(subjectTeacherPath(item.subjectId), json("PUT", { teacherMembershipId: item.teacherMembershipId }));
            }
        },
        onSuccess: invalidate,
    });
}
