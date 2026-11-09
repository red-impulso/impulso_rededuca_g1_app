"use client";

import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { LeadsList } from "./leads-list";
import { canSeeLeads } from "./leads-rules";
import {
    EMPTY_FILTER_DESCRIPTION,
    EMPTY_TITLE,
    FILTER_LABEL,
    FILTER_OPTIONS,
    LOADING_TEXT,
    NOT_ALLOWED_DESCRIPTION,
    NOT_ALLOWED_TITLE,
    UPDATED_MESSAGE,
} from "./leads-ui";
import type { Lead, LeadFilter, LeadStatus } from "./types";
import { useLeads, useUpdateLeadStatus } from "./use-leads";

// Mientras carga la lista
function LoadingCard() {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <SkeletonLines lines={4} />
            <p className="mt-3 text-xs font-semibold text-muted">{LOADING_TEXT}</p>
        </div>
    );
}

// Filtro, lista y cambio de estado
function LeadsContent() {
    const [filter, setFilter] = useState<LeadFilter>("new");
    const { state, reload, replace } = useLeads(filter);
    const { changeStatus, pendingIds } = useUpdateLeadStatus(replace);
    const { showToast } = useToast();

    const handleChangeStatus = useCallback(
        async (lead: Lead, status: LeadStatus) => {
            const result = await changeStatus(lead, status);
            if (result?.ok) showToast(UPDATED_MESSAGE[result.status]);
            else if (result) showToast(result.message);
        },
        [changeStatus, showToast],
    );

    let content: ReactNode;
    if (state.status === "loading") {
        content = <LoadingCard />;
    } else if (state.status === "error") {
        content = <ErrorState message={state.message} onRetry={reload} />;
    } else if (state.leads.length === 0) {
        content = (
            <EmptyState title={EMPTY_TITLE} description={filter === "all" ? undefined : EMPTY_FILTER_DESCRIPTION} />
        );
    } else {
        content = <LeadsList leads={state.leads} pendingIds={pendingIds} onChangeStatus={handleChangeStatus} />;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 sm:max-w-xs">
                <label htmlFor="interesados-filtro" className="text-sm font-semibold text-ink">
                    {FILTER_LABEL}
                </label>
                <select
                    id="interesados-filtro"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value as LeadFilter)}
                    className="h-11 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink outline-blue/40 focus-visible:outline-3"
                >
                    {FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {content}
        </div>
    );
}

// Postulaciones de la landing: solo admin (el menú ya lo oculta al resto)
export function LeadsScreen() {
    const { active } = useSession();

    if (!canSeeLeads(active.role)) {
        return <EmptyState title={NOT_ALLOWED_TITLE} description={NOT_ALLOWED_DESCRIPTION} />;
    }

    return <LeadsContent />;
}
