"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { useUnsavedChangesGuard } from "@/lib/use-unsaved-changes-guard";
import { SchoolForm, SchoolHeader } from "./school-form";
import { canManageSchool, logoFileError } from "./school-rules";
import type { SchoolFormValues } from "./school-schemas";
import {
    FORBIDDEN_TEXT,
    LEAVE_CONFIRM_LABEL,
    LEAVE_STAY_LABEL,
    LEAVE_TEXT,
    LEAVE_TITLE,
    LOGO_ERROR_TEXT,
    LOGO_UPDATED_TEXT,
    SAVE_ERROR_TEXT,
    SCHOOL_LOAD_ERROR_TEXT,
    SCHOOL_SAVED_TEXT,
} from "./school-texts";
import type { School } from "./types";
import { errorInfo, schoolKeys, useInstitutionId, useSaveSchool, useSchool, useUploadLogo } from "./use-school-data";

const EXIT_HREF = "/inicio";

function LoadingSchool() {
    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
            <div className="flex flex-col gap-4">
                {[0, 1, 2].map((index) => (
                    <div key={index} className="rounded-2xl border border-line bg-surface p-4">
                        <SkeletonLines lines={4} />
                    </div>
                ))}
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4">
                <SkeletonLines lines={5} />
            </div>
        </div>
    );
}

// GET /institution + PATCH /institution + logo
function SchoolContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const institutionId = useInstitutionId();
    const { showToast } = useToast();
    const school = useSchool();
    const save = useSaveSchool();
    const logo = useUploadLogo();
    const [saved, setSaved] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    // Cambios sin guardar: frena enlaces de la app y avisa al cerrar o recargar la pestaña
    const [dirty, setDirty] = useState(false);
    const guard = useUnsavedChangesGuard(dirty);
    // Error del archivo elegido (tipo o tamaño), antes de llamar a Back
    const [logoFileProblem, setLogoFileProblem] = useState<string | null>(null);

    if (school.isPending) {
        return (
            <>
                <SchoolHeader />
                <LoadingSchool />
            </>
        );
    }

    if (school.isError) {
        const info = errorInfo(school.error, SCHOOL_LOAD_ERROR_TEXT);
        const message = info.message === SCHOOL_LOAD_ERROR_TEXT ? info.message : `${SCHOOL_LOAD_ERROR_TEXT} ${info.message}`;
        return (
            <>
                <SchoolHeader />
                <ErrorState message={message} onRetry={() => void school.refetch()} />
            </>
        );
    }

    // Devuelve la escuela que respondió Back después de guardar (null si falló),
    // para que el formulario se rehidrate con lo que quedó guardado
    async function handleSave(values: SchoolFormValues): Promise<School | null> {
        setSaved(false);
        try {
            // mutateAsync termina después de volver a pedir GET /institution (onSuccess)
            await save.mutateAsync(values);
            setSaved(true);
            showToast(SCHOOL_SAVED_TEXT);
            return queryClient.getQueryData<School>(schoolKeys.institution(institutionId)) ?? null;
        } catch (error) {
            showToast(errorInfo(error, SAVE_ERROR_TEXT).message);
            return null;
        }
    }

    return (
        <>
            <SchoolForm
                school={school.data}
                saving={save.isPending}
                saveError={save.isError ? errorInfo(save.error, SAVE_ERROR_TEXT) : null}
                saved={saved}
                onSave={handleSave}
                onCancel={(dirty) => {
                    if (dirty) setLeaveOpen(true);
                    else router.push(EXIT_HREF);
                }}
                onDirtyChange={setDirty}
                logoUploading={logo.isPending}
                logoError={logoFileProblem ?? (logo.isError ? errorInfo(logo.error, LOGO_ERROR_TEXT).message : null)}
                onLogoChange={(file) => {
                    const problem = logoFileError(file);
                    setLogoFileProblem(problem);
                    if (problem) return;
                    logo.mutate(file, { onSuccess: () => showToast(LOGO_UPDATED_TEXT) });
                }}
            />
            <ConfirmDialog
                open={leaveOpen || guard.pendingHref !== null}
                title={LEAVE_TITLE}
                description={LEAVE_TEXT}
                confirmLabel={LEAVE_CONFIRM_LABEL}
                cancelLabel={LEAVE_STAY_LABEL}
                destructive
                onConfirm={() => {
                    // Enlace frenado → sigue a su destino; botón Cancelar → /inicio
                    if (guard.pendingHref !== null) guard.leave();
                    else router.push(EXIT_HREF);
                    setLeaveOpen(false);
                }}
                onCancel={() => {
                    guard.stay();
                    setLeaveOpen(false);
                }}
            />
        </>
    );
}

// Datos de la escuela: solo administración y dirección (Back exige lo mismo)
export function SchoolScreen() {
    const { active } = useSession();

    if (!canManageSchool(active.role)) {
        return (
            <>
                <SchoolHeader />
                <EmptyState title={FORBIDDEN_TEXT} />
            </>
        );
    }

    return <SchoolContent />;
}
