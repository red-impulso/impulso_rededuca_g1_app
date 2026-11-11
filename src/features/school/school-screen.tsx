"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { SchoolForm, SchoolHeader } from "./school-form";
import { canManageSchool } from "./school-rules";
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
} from "./school-texts";
import { errorInfo, useSaveSchool, useSchool, useUploadLogo } from "./use-school-data";

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
    const { showToast } = useToast();
    const school = useSchool();
    const save = useSaveSchool();
    const logo = useUploadLogo();
    const [saved, setSaved] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);

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

    async function handleSave(values: SchoolFormValues): Promise<boolean> {
        setSaved(false);
        try {
            await save.mutateAsync(values);
            setSaved(true);
            return true;
        } catch {
            return false;
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
                logoUploading={logo.isPending}
                logoError={logo.isError ? errorInfo(logo.error, LOGO_ERROR_TEXT).message : null}
                onLogoChange={(file) => logo.mutate(file, { onSuccess: () => showToast(LOGO_UPDATED_TEXT) })}
            />
            <ConfirmDialog
                open={leaveOpen}
                title={LEAVE_TITLE}
                description={LEAVE_TEXT}
                confirmLabel={LEAVE_CONFIRM_LABEL}
                cancelLabel={LEAVE_STAY_LABEL}
                destructive
                onConfirm={() => {
                    setLeaveOpen(false);
                    router.push(EXIT_HREF);
                }}
                onCancel={() => setLeaveOpen(false)}
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
