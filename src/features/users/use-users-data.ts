"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Role } from "../session/types";
import { json, parsed, useInstitutionId } from "../school/use-school-data";
import { USERS_PATH, USER_COUNTS_PATH, membershipPath, parseUserCounts, parseUserPage, reactivatePath, resetPasswordPath, userPath, usersExportPath, usersListPath } from "./users-api";
import { toCreateUserBody, toUpdateUserBody } from "./users-schemas";
import type { UserFormValues } from "./users-schemas";
import type { UserFilters, UserRow } from "./types";

export const userKeys = {
    all: (institutionId: string) => ["users", institutionId] as const,
    list: (institutionId: string, filters: UserFilters) => ["users", institutionId, "list", filters] as const,
    counts: (institutionId: string) => ["users", institutionId, "counts"] as const,
};

function useInvalidate() {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return () => void queryClient.invalidateQueries({ queryKey: userKeys.all(institutionId) });
}

export function useUsers(filters: UserFilters) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: userKeys.list(institutionId, filters),
        queryFn: async () => parsed(parseUserPage(await apiFetch<unknown>(usersListPath(filters)))),
        placeholderData: keepPreviousData,
    });
}

// Pedido a Back: contadores de las pestañas
export function useUserCounts() {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: userKeys.counts(institutionId),
        queryFn: async () => parsed(parseUserCounts(await apiFetch<unknown>(USER_COUNTS_PATH))),
        retry: false,
    });
}

// Alta: POST /users. Edición de datos: PATCH /users/:id
export function useSaveUser() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async ({ user, values }: { user: UserRow | null; values: UserFormValues }) => {
            if (!user) return apiFetch<unknown>(USERS_PATH, json("POST", toCreateUserBody(values)));
            await apiFetch<unknown>(userPath(user.userId), json("PATCH", toUpdateUserBody(values)));
            if (values.role !== user.role) await apiFetch<unknown>(membershipPath(user.membershipId), json("PATCH", { role: values.role }));
        },
        onSuccess: invalidate,
    });
}

// PATCH /memberships/:id { role }
export function useChangeRole() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async ({ ids, role }: { ids: string[]; role: Role }) => {
            for (const id of ids) await apiFetch<unknown>(membershipPath(id), json("PATCH", { role }));
        },
        onSuccess: invalidate,
    });
}

// Desactivar: DELETE /memberships/:id (baja lógica, existe). Activar: POST /memberships/:id/reactivate (pedido)
export function useSetActive() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async ({ ids, active }: { ids: string[]; active: boolean }) => {
            for (const id of ids) await apiFetch<unknown>(active ? reactivatePath(id) : membershipPath(id), { method: active ? "POST" : "DELETE" });
        },
        onSuccess: invalidate,
    });
}

// Pedido a Back: POST /users/:id/reset-password
export function useResetPassword() {
    return useMutation({
        mutationFn: async (userIds: string[]) => {
            for (const id of userIds) await apiFetch<unknown>(resetPasswordPath(id), { method: "POST" });
        },
    });
}

// Pedido a Back: GET /users/export → { url }
export function useExportUsers() {
    return useMutation({
        mutationFn: async (ids: string[]) => {
            const data = await apiFetch<{ url?: unknown }>(usersExportPath(ids));
            return parsed(typeof data?.url === "string" ? data.url : null);
        },
    });
}
