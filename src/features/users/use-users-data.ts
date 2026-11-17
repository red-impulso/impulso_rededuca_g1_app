"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Role } from "../session/types";
import { json, parsed, useInstitutionId } from "../school/use-school-data";
import { USERS_PATH, USER_COUNTS_PATH, membershipPath, parseUserCounts, parseUserPage, reactivatePath, resetPasswordPath, userPath, usersExportPath, usersListPath } from "./users-api";
import { toCreateUserBody, toUpdateUserBody } from "./users-schemas";
import type { UserFormValues } from "./users-schemas";
import { DEFAULT_USER_FILTERS } from "./users-rules";
import type { UserFilters, UserRow } from "./types";

// Una acción en lote que salió bien solo para una parte: el mensaje dice cuántos
export class PartialBatchError extends Error {
    constructor(done: number, total: number) {
        super(`Se aplicó a ${done} de ${total}. No pudimos con ${total - done}: revisá la lista y probá de nuevo.`);
        this.name = "PartialBatchError";
    }
}

// Aplica la acción a cada id. Si fallan todos, lanza el primer error (con su status);
// si falla una parte, lanza PartialBatchError. Así nunca se informa un éxito falso.
async function runForEach(ids: string[], action: (id: string) => Promise<unknown>): Promise<void> {
    const results = await Promise.allSettled(ids.map(action));
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
    if (failures.length === 0) return;
    if (failures.length === results.length) throw failures[0].reason;
    throw new PartialBatchError(results.length - failures.length, results.length);
}

export const userKeys = {
    all: (institutionId: string) => ["users", institutionId] as const,
    list: (institutionId: string, filters: UserFilters) => ["users", institutionId, "list", filters] as const,
    counts: (institutionId: string) => ["users", institutionId, "counts"] as const,
    activeAdmins: (institutionId: string) => ["users", institutionId, "active-admins"] as const,
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

// Cantidad real de administradores activos de la escuela (no solo los de la página visible):
// GET /users?role=admin&status=active → total. null mientras carga o si falla.
export function useActiveAdminCount() {
    const institutionId = useInstitutionId();
    const query = useQuery({
        queryKey: userKeys.activeAdmins(institutionId),
        queryFn: async () =>
            parsed(parseUserPage(await apiFetch<unknown>(usersListPath({ ...DEFAULT_USER_FILTERS, role: "admin", status: "active" })))).total,
    });
    return query.data ?? null;
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
        // También si falla el cambio de rol: los datos personales ya se guardaron
        onSettled: invalidate,
    });
}

// PATCH /memberships/:id { role }
export function useChangeRole() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: ({ ids, role }: { ids: string[]; role: Role }) =>
            runForEach(ids, (id) => apiFetch<unknown>(membershipPath(id), json("PATCH", { role }))),
        // También si falla: una parte pudo haberse aplicado
        onSettled: invalidate,
    });
}

// Desactivar: DELETE /memberships/:id (baja lógica, existe). Activar: POST /memberships/:id/reactivate (pedido)
export function useSetActive() {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: ({ ids, active }: { ids: string[]; active: boolean }) =>
            runForEach(ids, (id) => apiFetch<unknown>(active ? reactivatePath(id) : membershipPath(id), { method: active ? "POST" : "DELETE" })),
        // También si falla: una parte pudo haberse aplicado
        onSettled: invalidate,
    });
}

// Pedido a Back: POST /users/:id/reset-password
export function useResetPassword() {
    return useMutation({
        mutationFn: (userIds: string[]) =>
            runForEach(userIds, (id) => apiFetch<unknown>(resetPasswordPath(id), { method: "POST" })),
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
