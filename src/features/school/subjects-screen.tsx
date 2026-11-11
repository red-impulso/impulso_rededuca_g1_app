"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { AssignTeacherDialog } from "./assign-teacher-dialog";
import {
    DEFAULT_SUBJECT_FILTERS,
    canManageSchool,
    courseLabel,
    coursesOf,
    filterSubjects,
    hasSubjectFilters,
    readSubjectFilters,
    subjectFiltersQuery,
    subjectsCountText,
    teachersOf,
} from "./school-rules";
import { SubjectFiltersBar } from "./subject-filters-bar";
import { SubjectFormDialog } from "./subject-form-dialog";
import { SubjectsList } from "./subjects-list";
import {
    CLEAR_FILTERS_LABEL,
    CREATE_SUBJECT_LABEL,
    DELETE_ERROR_TEXT,
    DELETE_LABEL,
    DELETE_SUBJECT_TEXT,
    FORBIDDEN_TEXT,
    NEW_SUBJECT_LABEL,
    NO_RESULTS_TEXT,
    NO_RESULTS_TITLE,
    SUBJECT_CREATED_TEXT,
    SUBJECT_DELETED_TEXT,
    SUBJECT_UPDATED_TEXT,
    SUBJECTS_EMPTY_TEXT,
    SUBJECTS_EMPTY_TITLE,
    SUBJECTS_LOAD_ERROR_TEXT,
    SUBJECTS_TITLE,
    TEACHER_ASSIGNED_TEXT,
    deleteSubjectTitle,
} from "./school-texts";
import type { Subject, SubjectFilters } from "./types";
import { errorInfo, useDeleteSubject, useSubjects } from "./use-school-data";

const PRIMARY_BUTTON =
    "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-blue px-4 font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3";

function Header({ subtitle, onCreate }: { subtitle?: string; onCreate?: () => void }) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold text-ink">{SUBJECTS_TITLE}</h1>
                {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
            </div>
            {onCreate && (
                <button type="button" onClick={onCreate} className={`${PRIMARY_BUTTON} hidden lg:inline-flex`}>
                    <span aria-hidden="true">+</span> {NEW_SUBJECT_LABEL}
                </button>
            )}
        </div>
    );
}

type DialogState =
    | { type: "none" }
    | { type: "form"; subject: Subject | null }
    | { type: "assign"; subject: Subject }
    | { type: "delete"; subject: Subject };

function SubjectsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const subjects = useSubjects();
    const remove = useDeleteSubject();
    const [dialog, setDialog] = useState<DialogState>({ type: "none" });

    const filters = readSubjectFilters(searchParams);
    const setFilters = useCallback(
        (next: SubjectFilters) => router.replace(`${pathname}${subjectFiltersQuery(next)}`, { scroll: false }),
        [router, pathname],
    );
    const close = () => setDialog({ type: "none" });

    if (subjects.isPending) {
        return (
            <>
                <Header />
                <div className="rounded-2xl border border-line bg-surface p-4"><SkeletonLines lines={6} /></div>
            </>
        );
    }
    if (subjects.isError) {
        const info = errorInfo(subjects.error, SUBJECTS_LOAD_ERROR_TEXT);
        const message = info.message === SUBJECTS_LOAD_ERROR_TEXT ? info.message : `${SUBJECTS_LOAD_ERROR_TEXT} ${info.message}`;
        return (
            <>
                <Header />
                <ErrorState message={message} onRetry={() => void subjects.refetch()} />
            </>
        );
    }

    const all = subjects.data;
    const visible = filterSubjects(all, filters);
    const openCreate = () => setDialog({ type: "form", subject: null });

    let content: ReactNode;
    if (all.length === 0) {
        content = (
            <EmptyState
                title={SUBJECTS_EMPTY_TITLE}
                description={SUBJECTS_EMPTY_TEXT}
                action={<button type="button" onClick={openCreate} className={PRIMARY_BUTTON}>{CREATE_SUBJECT_LABEL}</button>}
            />
        );
    } else if (visible.length === 0) {
        content = (
            <EmptyState
                title={NO_RESULTS_TITLE}
                description={NO_RESULTS_TEXT}
                action={
                    <button
                        type="button"
                        onClick={() => setFilters(DEFAULT_SUBJECT_FILTERS)}
                        className="h-11 rounded-[10px] border border-line bg-surface px-4 font-semibold text-ink outline-blue/40 focus-visible:outline-3"
                    >
                        {CLEAR_FILTERS_LABEL}
                    </button>
                }
            />
        );
    } else {
        content = (
            <SubjectsList
                subjects={visible}
                total={all.length}
                onEdit={(subject) => setDialog({ type: "form", subject })}
                onAssign={(subject) => setDialog({ type: "assign", subject })}
                onDelete={(subject) => setDialog({ type: "delete", subject })}
            />
        );
    }

    return (
        <>
            <Header subtitle={subjectsCountText(all.length)} onCreate={openCreate} />
            <div className="flex flex-col gap-4 pb-20 lg:pb-0">
                {all.length > 0 && (
                    <SubjectFiltersBar
                        filters={filters}
                        courses={coursesOf(all)}
                        teachers={teachersOf(all)}
                        hasFilters={hasSubjectFilters(filters)}
                        onChange={setFilters}
                        onClear={() => setFilters(DEFAULT_SUBJECT_FILTERS)}
                    />
                )}
                {content}
            </div>
            <button type="button" onClick={openCreate} className={`${PRIMARY_BUTTON} fixed right-4 bottom-4 z-20 shadow-lg lg:hidden`}>
                <span aria-hidden="true">+</span> {NEW_SUBJECT_LABEL}
            </button>

            <SubjectFormDialog
                open={dialog.type === "form"}
                subject={dialog.type === "form" ? dialog.subject : null}
                subjects={all}
                onOpenChange={(open) => !open && close()}
                onSaved={(_, created) => {
                    close();
                    showToast(created ? SUBJECT_CREATED_TEXT : SUBJECT_UPDATED_TEXT);
                }}
            />
            {dialog.type === "assign" && dialog.subject.course && (
                <AssignTeacherDialog
                    open
                    courseId={dialog.subject.course.id}
                    courseName={`${dialog.subject.name} · ${courseLabel(dialog.subject.course)}`}
                    subjectId={dialog.subject.id}
                    onOpenChange={(open) => !open && close()}
                    onAssigned={() => {
                        close();
                        showToast(TEACHER_ASSIGNED_TEXT);
                    }}
                />
            )}
            <ConfirmDialog
                open={dialog.type === "delete"}
                title={dialog.type === "delete" ? deleteSubjectTitle(dialog.subject.name) : ""}
                description={DELETE_SUBJECT_TEXT}
                confirmLabel={DELETE_LABEL}
                destructive
                loading={remove.isPending}
                onConfirm={() => {
                    if (dialog.type !== "delete") return;
                    remove.mutate(dialog.subject.id, {
                        onSuccess: () => {
                            close();
                            showToast(SUBJECT_DELETED_TEXT);
                        },
                        onError: (error) => {
                            close();
                            showToast(errorInfo(error, DELETE_ERROR_TEXT).message);
                        },
                    });
                }}
                onCancel={() => !remove.isPending && close()}
            />
        </>
    );
}

// Lista de materias (SDD 4.4): administración y dirección
export function SubjectsScreen() {
    const { active } = useSession();
    if (!canManageSchool(active.role)) {
        return (
            <>
                <Header />
                <EmptyState title={FORBIDDEN_TEXT} />
            </>
        );
    }
    return <SubjectsContent />;
}
