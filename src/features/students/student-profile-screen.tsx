"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { GuardiansSection } from "../guardians/guardians-section";
import { canManageSchool } from "../school/school-rules";
import { FORBIDDEN_TEXT } from "../school/school-texts";
import { errorInfo } from "../school/use-school-data";
import { StudentFormDialog } from "./student-form-dialog";
import { StudentProfileView } from "./student-profile";
import type { ActivityState } from "./student-profile";
import { phoneHref, studentName } from "./students-rules";
import {
    ACTIVITY_LOAD_ERROR_TEXT,
    CONTACT_GUARDIAN_LABEL,
    DELETE_STUDENT_TEXT,
    EDIT_STUDENT_LABEL,
    GENERATE_REPORT_LABEL,
    GENERATING_REPORT_LABEL,
    NO_GUARDIAN_CONTACT_TEXT,
    PROFILE_LOAD_ERROR_TEXT,
    PROFILE_TABS,
    REPORT_ERROR_TEXT,
    STUDENT_DELETE_ERROR_TEXT,
    STUDENT_DELETED_TEXT,
    STUDENT_UPDATED_TEXT,
    deleteStudentTitle,
} from "./students-texts";
import { useDeleteStudent, useStudentActivity, useStudentProfile, useStudentReport } from "./use-students-data";

const BUTTON = "inline-flex h-11 items-center justify-center rounded-[10px] px-4 text-sm font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60";
const SECONDARY = `${BUTTON} border border-line bg-surface text-ink hover:bg-page`;
type Tab = keyof typeof PROFILE_TABS;

function ProfileContent({ studentId }: { studentId: string }) {
    const router = useRouter();
    const { showToast } = useToast();
    const profile = useStudentProfile(studentId);
    const activity = useStudentActivity(studentId);
    const report = useStudentReport();
    const remove = useDeleteStudent();
    const [tab, setTab] = useState<Tab>("summary");
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (profile.isPending) return <SkeletonLines lines={10} />;
    if (profile.isError) {
        const info = errorInfo(profile.error, PROFILE_LOAD_ERROR_TEXT);
        return <ErrorState message={info.message === PROFILE_LOAD_ERROR_TEXT ? info.message : `${PROFILE_LOAD_ERROR_TEXT} ${info.message}`} onRetry={() => void profile.refetch()} />;
    }

    const data = profile.data;
    const name = studentName(data.personal);
    const guardian = data.guardians.find((item) => item.phone || item.email);
    const contactHref = guardian ? (phoneHref(guardian.phone) ?? `mailto:${guardian.email}`) : null;
    const activityState: ActivityState = activity.isPending
        ? { status: "loading" }
        : activity.isError
          ? { status: "error", message: errorInfo(activity.error, ACTIVITY_LOAD_ERROR_TEXT).message, onRetry: () => void activity.refetch() }
          : { status: "ready", data: activity.data };

    const generateReport = () =>
        report.mutate(studentId, {
            onSuccess: (url) => window.open(url, "_blank", "noopener"),
            onError: (error) => showToast(`${REPORT_ERROR_TEXT} ${errorInfo(error, "").message}`.trim()),
        });

    const actions = (
        <>
            <button type="button" onClick={() => setEditing(true)} className={`${BUTTON} bg-blue text-white hover:bg-blue/90`}>{EDIT_STUDENT_LABEL}</button>
            <button type="button" onClick={generateReport} disabled={report.isPending} className={SECONDARY}>{report.isPending ? GENERATING_REPORT_LABEL : GENERATE_REPORT_LABEL}</button>
            {contactHref ? (
                <a href={contactHref} className={SECONDARY}>{CONTACT_GUARDIAN_LABEL}</a>
            ) : (
                <button type="button" onClick={() => showToast(NO_GUARDIAN_CONTACT_TEXT)} className={`${SECONDARY} opacity-60`}>{CONTACT_GUARDIAN_LABEL}</button>
            )}
            <button type="button" onClick={() => setDeleting(true)} className={`${BUTTON} text-error hover:bg-error-bg`}>Eliminar</button>
        </>
    );

    return (
        <>
            <div role="tablist" aria-label="Secciones de la ficha" className="mb-4 flex gap-1 border-b border-line">
                {(Object.keys(PROFILE_TABS) as Tab[]).map((item) => (
                    <button
                        key={item}
                        type="button"
                        role="tab"
                        id={`tab-${item}`}
                        aria-selected={tab === item}
                        aria-controls={`panel-${item}`}
                        onClick={() => setTab(item)}
                        className={`min-h-11 border-b-2 px-4 text-sm font-semibold outline-blue/40 focus-visible:outline-3 ${tab === item ? "border-blue text-blue" : "border-transparent text-muted"}`}
                    >
                        {PROFILE_TABS[item]}
                    </button>
                ))}
            </div>
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                {tab === "summary" ? <StudentProfileView profile={data} activity={activityState} actions={actions} /> : <GuardiansSection studentId={studentId} />}
            </div>
            <StudentFormDialog
                open={editing}
                profile={data}
                onOpenChange={setEditing}
                onSaved={() => {
                    setEditing(false);
                    showToast(STUDENT_UPDATED_TEXT);
                }}
            />
            <ConfirmDialog
                open={deleting}
                title={deleteStudentTitle(name)}
                description={DELETE_STUDENT_TEXT}
                confirmLabel="Eliminar"
                destructive
                loading={remove.isPending}
                onCancel={() => setDeleting(false)}
                onConfirm={() =>
                    remove.mutate(studentId, {
                        onSuccess: () => {
                            showToast(STUDENT_DELETED_TEXT);
                            router.push("/alumnos");
                        },
                        onError: (error) => {
                            setDeleting(false);
                            showToast(errorInfo(error, STUDENT_DELETE_ERROR_TEXT).message);
                        },
                    })
                }
            />
        </>
    );
}

// Ficha del alumno (SDD 5.2) con la pestaña de tutores (M9)
export function StudentProfileScreen() {
    const { studentId } = useParams<{ studentId: string }>();
    const { active } = useSession();
    if (!canManageSchool(active.role)) return <EmptyState title={FORBIDDEN_TEXT} />;
    return <ProfileContent key={studentId} studentId={studentId} />;
}
