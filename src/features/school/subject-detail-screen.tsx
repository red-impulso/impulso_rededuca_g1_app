"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { AssignTeacherDialog } from "./assign-teacher-dialog";
import { canManageSchool, courseLabel } from "./school-rules";
import { SubjectDetail } from "./subject-detail";
import { SubjectFormDialog } from "./subject-form-dialog";
import {
    DEACTIVATE_LABEL,
    DEACTIVATE_SUBJECT_TEXT,
    FORBIDDEN_TEXT,
    NOT_FOUND_TEXT,
    SAVE_ERROR_TEXT,
    SUBJECT_DEACTIVATED_TEXT,
    SUBJECT_LOAD_ERROR_TEXT,
    SUBJECT_UPDATED_TEXT,
    TEACHER_ASSIGNED_TEXT,
    deactivateSubjectTitle,
} from "./school-texts";
import { errorInfo, useDeactivateSubject, useSubjects } from "./use-school-data";

// Back no tiene GET /subjects/:id: la materia sale de GET /subjects
function SubjectDetailContent({ subjectId }: { subjectId: string }) {
    const { showToast } = useToast();
    const subjects = useSubjects();
    const deactivate = useDeactivateSubject();
    const [dialog, setDialog] = useState<"none" | "edit" | "assign" | "deactivate">("none");
    const close = () => setDialog("none");

    if (subjects.isPending) {
        return <div className="rounded-2xl border border-line bg-surface p-4"><SkeletonLines lines={6} /></div>;
    }
    if (subjects.isError) {
        return <ErrorState message={errorInfo(subjects.error, SUBJECT_LOAD_ERROR_TEXT).message} onRetry={() => void subjects.refetch()} />;
    }
    const subject = subjects.data.find((item) => item.id === subjectId);
    if (!subject) return <EmptyState title={NOT_FOUND_TEXT} />;

    return (
        <>
            <SubjectDetail
                subject={subject}
                onEdit={() => setDialog("edit")}
                onChangeTeacher={() => setDialog("assign")}
                onDeactivate={() => setDialog("deactivate")}
            />
            <SubjectFormDialog
                open={dialog === "edit"}
                subject={subject}
                subjects={subjects.data}
                onOpenChange={(open) => !open && close()}
                onSaved={() => {
                    close();
                    showToast(SUBJECT_UPDATED_TEXT);
                }}
            />
            {subject.course && (
                <AssignTeacherDialog
                    open={dialog === "assign"}
                    courseId={subject.course.id}
                    courseName={`${subject.name} · ${courseLabel(subject.course)}`}
                    subjectId={subject.id}
                    onOpenChange={(open) => !open && close()}
                    onAssigned={() => {
                        close();
                        showToast(TEACHER_ASSIGNED_TEXT);
                    }}
                />
            )}
            <ConfirmDialog
                open={dialog === "deactivate"}
                title={deactivateSubjectTitle(subject.name)}
                description={DEACTIVATE_SUBJECT_TEXT}
                confirmLabel={DEACTIVATE_LABEL}
                destructive
                loading={deactivate.isPending}
                onConfirm={() =>
                    deactivate.mutate(subject.id, {
                        onSuccess: () => {
                            close();
                            showToast(SUBJECT_DEACTIVATED_TEXT);
                        },
                        onError: (error) => {
                            close();
                            showToast(errorInfo(error, SAVE_ERROR_TEXT).message);
                        },
                    })
                }
                onCancel={() => !deactivate.isPending && close()}
            />
        </>
    );
}

export function SubjectDetailScreen() {
    const { active } = useSession();
    const params = useParams<{ id: string }>();
    if (!canManageSchool(active.role)) return <EmptyState title={FORBIDDEN_TEXT} />;
    return <SubjectDetailContent subjectId={params.id} />;
}
