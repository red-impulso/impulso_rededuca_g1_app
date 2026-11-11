"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { canManageSchool, courseLabel } from "../school/school-rules";
import { FORBIDDEN_TEXT } from "../school/school-texts";
import { errorInfo } from "../school/use-school-data";
import { TeacherDetailView } from "./teacher-detail";
import type { TeacherActivityState } from "./teacher-detail";
import { TeacherFormDialog } from "./teacher-form-dialog";
import { ASSIGN_SUBJECTS_LABEL, ASSIGNMENTS_ERROR_TEXT, ASSIGNMENTS_SAVED_TEXT, BACK_TO_TEACHERS_LABEL, EDIT_TEACHER_LABEL, REMOVE_TEACHER_LABEL, TEACHER_SAVED_TEXT, TEACHERS_ERROR_TEXT, removeTeacherTitle } from "./teachers-texts";
import type { TeacherSubject } from "./types";
import { useSaveAssignments, useTeacher, useTeacherActivity } from "./use-teachers-data";

const BUTTON = "inline-flex h-11 items-center justify-center rounded-[10px] px-4 text-sm font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-60";

function RemoveDialog({ subject, teacherName, onClose }: { subject: TeacherSubject; teacherName: string; onClose: () => void }) {
    const { showToast } = useToast();
    const save = useSaveAssignments(subject.course?.id ?? "");
    return (
        <ConfirmDialog
            open
            title={removeTeacherTitle(teacherName, subject.name, subject.course ? courseLabel(subject.course) : "")}
            confirmLabel={REMOVE_TEACHER_LABEL}
            destructive
            loading={save.isPending}
            onCancel={onClose}
            onConfirm={() =>
                save.mutate({ [subject.id]: null }, {
                    onSuccess: () => { onClose(); showToast(ASSIGNMENTS_SAVED_TEXT); },
                    onError: (error) => showToast(errorInfo(error, ASSIGNMENTS_ERROR_TEXT).message),
                })
            }
        />
    );
}

function TeacherDetailContent({ id }: { id: string }) {
    const { showToast } = useToast();
    const teacher = useTeacher(id);
    const activity = useTeacherActivity(id);
    const [editing, setEditing] = useState(false);
    const [removing, setRemoving] = useState<TeacherSubject | null>(null);

    if (teacher.isPending) return <SkeletonLines lines={10} />;
    if (teacher.isError) return <ErrorState message={errorInfo(teacher.error, TEACHERS_ERROR_TEXT).message} onRetry={() => void teacher.refetch()} />;

    const activityState: TeacherActivityState = activity.isPending
        ? { status: "loading" }
        : activity.isError
          ? { status: "error", message: errorInfo(activity.error, "").message, onRetry: () => void activity.refetch() }
          : { status: "ready", data: activity.data };
    const firstCourse = teacher.data.subjects.find((subject) => subject.course)?.course;

    return (
        <>
            <Link href="/docentes" className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-blue hover:underline">← {BACK_TO_TEACHERS_LABEL}</Link>
            <div className="pb-20 lg:pb-0">
                <TeacherDetailView
                    teacher={teacher.data}
                    activity={activityState}
                    onRemoveSubject={setRemoving}
                    actions={
                        <>
                            <button type="button" onClick={() => setEditing(true)} className={`${BUTTON} bg-blue text-white hover:bg-blue/90`}>{EDIT_TEACHER_LABEL}</button>
                            <Link href={firstCourse ? `/docentes/asignacion?curso=${firstCourse.id}` : "/docentes/asignacion"} className={`${BUTTON} border border-line bg-surface text-ink hover:bg-page`}>{ASSIGN_SUBJECTS_LABEL}</Link>
                        </>
                    }
                />
            </div>
            <TeacherFormDialog open={editing} teacher={teacher.data} onOpenChange={setEditing} onSaved={() => { setEditing(false); showToast(TEACHER_SAVED_TEXT); }} />
            {removing && <RemoveDialog subject={removing} teacherName={teacher.data.fullName} onClose={() => setRemoving(null)} />}
        </>
    );
}

// Ficha de docente (SDD 7.2)
export function TeacherDetailScreen() {
    const { id } = useParams<{ id: string }>();
    const { active } = useSession();
    if (!canManageSchool(active.role)) return <EmptyState title={FORBIDDEN_TEXT} />;
    return <TeacherDetailContent id={id} />;
}
