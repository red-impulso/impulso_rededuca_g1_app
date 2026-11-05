"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useSession } from "@/features/session/use-session";
import { canSeeDashboard, isInstitutionEmpty } from "./dashboard-rules";
import {
    EMPTY_INSTITUTION_TITLE,
    LOADING_TEXT,
    NOT_ALLOWED_DESCRIPTION,
    NOT_ALLOWED_TITLE,
} from "./dashboard-ui";
import { DashboardView } from "./dashboard-view";
import { useDashboard } from "./use-dashboard";

// Mientras carga el tablero
function LoadingCard() {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <SkeletonLines lines={4} />
            <p className="mt-3 text-xs font-semibold text-muted">{LOADING_TEXT}</p>
        </div>
    );
}

// Pide el tablero y muestra cargando, error, institución vacía o los datos
function DashboardContent() {
    const { state, reload } = useDashboard();

    let content: ReactNode;
    if (state.status === "loading") {
        content = <LoadingCard />;
    } else if (state.status === "error") {
        content = <ErrorState message={state.message} onRetry={reload} />;
    } else if (isInstitutionEmpty(state.summary)) {
        content = <EmptyState title={EMPTY_INSTITUTION_TITLE} />;
    } else {
        content = <DashboardView summary={state.summary} refreshing={state.refreshing} />;
    }
    return content;
}

// Tablero de dirección: solo admin y director (el menú ya lo oculta al resto)
export function DashboardScreen() {
    const { active } = useSession();

    if (!canSeeDashboard(active.role)) {
        return <EmptyState title={NOT_ALLOWED_TITLE} description={NOT_ALLOWED_DESCRIPTION} />;
    }

    return <DashboardContent />;
}
