"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { json, parsed, useInstitutionId } from "../school/use-school-data";
import { studentKeys } from "../students/use-students-data";
import {
    GUARDIANS_PATH,
    guardianCandidatesPath,
    guardianLinkPath,
    guardianPersonPath,
    guardiansPath,
    makePrimaryPath,
    parseGuardianCandidates,
    parseGuardianLinks,
    toGuardianPersonBody,
    toLinkBody,
} from "./guardians-api";
import type { GuardianFormValues } from "./guardians-schemas";

const guardianKeys = {
    links: (institutionId: string, studentId: string) => ["students", institutionId, "guardians", studentId] as const,
    candidates: (institutionId: string, q: string) => ["guardian-candidates", institutionId, q] as const,
};

// Siempre se piden también los inactivos: la pantalla decide si mostrarlos
export function useGuardianLinks(studentId: string) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: guardianKeys.links(institutionId, studentId),
        queryFn: async () => parsed(parseGuardianLinks(await apiFetch<unknown>(guardiansPath(studentId, true)))),
    });
}

export function useGuardianCandidates(q: string, enabled: boolean) {
    const institutionId = useInstitutionId();
    return useQuery({
        queryKey: guardianKeys.candidates(institutionId, q),
        queryFn: async () => parsed(parseGuardianCandidates(await apiFetch<unknown>(guardianCandidatesPath(q)))),
        enabled,
    });
}

function useRefresh(studentId: string) {
    const institutionId = useInstitutionId();
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({ queryKey: guardianKeys.links(institutionId, studentId) });
        void queryClient.invalidateQueries({ queryKey: studentKeys.profile(institutionId, studentId) });
        void queryClient.invalidateQueries({ queryKey: ["students", institutionId, "list"] });
    };
}

type SaveInput =
    | { mode: "new"; values: GuardianFormValues; isPrimary: boolean }
    | { mode: "existing"; guardianMembershipId: string; values: GuardianFormValues; isPrimary: boolean }
    | { mode: "edit"; guardianMembershipId: string; values: GuardianFormValues; personChanged: boolean };

// Alta: nuevo tutor → POST /guardians y luego el vínculo. Edición: vínculo y, si cambiaron, sus datos.
export function useSaveGuardian(studentId: string) {
    const refresh = useRefresh(studentId);
    return useMutation({
        mutationFn: async (input: SaveInput) => {
            if (input.mode === "edit") {
                if (input.personChanged) await apiFetch<unknown>(guardianPersonPath(input.guardianMembershipId), json("PATCH", toGuardianPersonBody(input.values)));
                await apiFetch<unknown>(guardianLinkPath(studentId, input.guardianMembershipId), json("PATCH", toLinkBody(input.values)));
                return;
            }
            let guardianMembershipId = input.mode === "existing" ? input.guardianMembershipId : "";
            if (input.mode === "new") {
                const created = await apiFetch<{ membershipId?: unknown }>(GUARDIANS_PATH, json("POST", toGuardianPersonBody(input.values)));
                guardianMembershipId = parsed(typeof created?.membershipId === "string" ? created.membershipId : null);
            }
            await apiFetch<unknown>(guardiansPath(studentId), json("POST", { guardianMembershipId, ...toLinkBody(input.values), isPrimary: input.isPrimary }));
        },
        onSuccess: refresh,
    });
}

export function useMakePrimary(studentId: string) {
    const refresh = useRefresh(studentId);
    return useMutation({
        mutationFn: (guardianMembershipId: string) => apiFetch<unknown>(makePrimaryPath(studentId, guardianMembershipId), { method: "POST" }),
        onSuccess: refresh,
    });
}

// Si se desvincula al principal, antes se marca al nuevo principal
export function useUnlinkGuardian(studentId: string) {
    const refresh = useRefresh(studentId);
    return useMutation({
        mutationFn: async ({ guardianMembershipId, newPrimaryId }: { guardianMembershipId: string; newPrimaryId: string | null }) => {
            if (newPrimaryId) await apiFetch<unknown>(makePrimaryPath(studentId, newPrimaryId), { method: "POST" });
            await apiFetch<void>(guardianLinkPath(studentId, guardianMembershipId), { method: "DELETE" });
        },
        onSuccess: refresh,
    });
}
