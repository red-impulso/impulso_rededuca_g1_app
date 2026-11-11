"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { json, parsed, useInstitutionId } from "../school/use-school-data";
import {
    parseStudentActivity,
    parseStudentPage,
    parseStudentProfile,
    studentActivityPath,
    studentPath,
    studentProfilePath,
    studentReportPath,
    studentsListPath,
    STUDENTS_PATH,
    toStudentBody,
} from "./students-api";
import type { StudentFormValues } from "./students-schemas";
import type { StudentFilters } from "./types";

export const studentKeys = {
    all: (institutionId: string) => ["students", institutionId] as const,
    list: (institutionId: string, filters: StudentFilters) => ["students", institutionId, "list", filters] as const,
    profile: (institutionId: string, id: string) => ["students", institutionId, "profile", id] as const,
    activity: (institutionId: string, id: string) => ["students", institutionId, "activity", id] as const,
};

export function useStudents(filters: StudentFilters) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: studentKeys.list(institutionId, filters),
        queryFn: async () => parsed(parseStudentPage(await apiFetch<unknown>(studentsListPath(filters)))),
        placeholderData: keepPreviousData,
    });
}

export function useStudentProfile(id: string) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: studentKeys.profile(institutionId, id),
        queryFn: async () => parsed(parseStudentProfile(await apiFetch<unknown>(studentProfilePath(id)))),
    });
}

// Pedido a Back: hasta que exista, la sección muestra el error
export function useStudentActivity(id: string) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: studentKeys.activity(institutionId, id),
        queryFn: async () => parsed(parseStudentActivity(await apiFetch<unknown>(studentActivityPath(id)))),
    });
}

export function useSaveStudent() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, values }: { id: string | null; values: StudentFormValues }) => {
            const data = await apiFetch<unknown>(id ? studentPath(id) : STUDENTS_PATH, json(id ? "PATCH" : "POST", toStudentBody(values, id !== null)));
            const record = data as { id?: unknown } | null;
            return { id: typeof record?.id === "string" ? record.id : (id ?? "") };
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: studentKeys.all(institutionId) });
            void queryClient.invalidateQueries({ queryKey: ["school", institutionId] });
        },
    });
}

export function useDeleteStudent() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiFetch<void>(studentPath(id), { method: "DELETE" }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: studentKeys.all(institutionId) });
            void queryClient.invalidateQueries({ queryKey: ["school", institutionId] });
        },
    });
}

// GET /students/:id/report (pedido a Back) → { url } firmada del PDF del informe
export function useStudentReport() {
    return useMutation({
        mutationFn: async (id: string) => {
            const data = await apiFetch<unknown>(studentReportPath(id));
            const url = (data as { url?: unknown } | null)?.url;
            return parsed(typeof url === "string" && url ? url : null);
        },
    });
}
