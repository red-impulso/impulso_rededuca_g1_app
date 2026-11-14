"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useSession } from "@/features/session/use-session";
import { canSeeDashboard, isInstitutionEmpty } from "./dashboard-rules";
import {
    EMPTY_INSTITUTION_TITLE,
    LOADING_TEXT,
    NOT_ALLOWED_ACTION_HREF,
    NOT_ALLOWED_ACTION_LABEL,
    NOT_ALLOWED_DESCRIPTION,
    NOT_ALLOWED_TITLE,
    SCREEN_SUBTITLE,
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

// Docentes y tutores (o un 403 de Back): el mismo mensaje institucional, con salida al inicio
export function DashboardNotAllowed() {
    return (
        <EmptyState
            title={NOT_ALLOWED_TITLE}
            description={NOT_ALLOWED_DESCRIPTION}
            action={
                <Link href={NOT_ALLOWED_ACTION_HREF} className="font-semibold text-blue">
                    {NOT_ALLOWED_ACTION_LABEL}
                </Link>
            }
        />
    );
}

// Pide el tablero y muestra cargando, error, institución vacía o los datos
function DashboardContent() {
    const { state, reload } = useDashboard();

    let content: ReactNode;
    if (state.status === "loading") {
        content = <LoadingCard />;
    } else if (state.status === "error") {
        // Reintentar no cambia un 403: se muestra lo mismo que al entrar con otro rol
        content =
            state.kind === "forbidden" ? (
                <DashboardNotAllowed />
            ) : (
                <ErrorState message={state.message} onRetry={reload} />
            );
    } else if (isInstitutionEmpty(state.summary)) {
        content = <EmptyState title={EMPTY_INSTITUTION_TITLE} />;
    } else {
        content = <DashboardView summary={state.summary} refreshing={state.refreshing} />;
    }
    return content;
}

// Tablero de dirección: solo admin y director (el menú ya lo oculta al resto).
// Sin permiso no se pide GET /dashboard.
export function DashboardScreen() {
    const { active } = useSession();

    // El subtítulo ("Resumen de la institución") solo acompaña al tablero, no al aviso
    if (!canSeeDashboard(active.role)) {
        return (
            <div className="mt-5">
                <DashboardNotAllowed />
            </div>
        );
    }

    return (
        <>
            <p className="mb-6 text-sm text-muted">{SCREEN_SUBTITLE}</p>
            <DashboardContent />
        </>
    );
}
