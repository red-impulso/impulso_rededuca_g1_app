"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LABEL_STYLES, CONTROL_STYLES } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { CANCEL_LABEL, EMPTY_VALUE } from "../school/school-texts";
import { errorInfo } from "../school/use-school-data";
import { ACTION, GuardianCard, PRIMARY_BUTTON } from "./guardian-card";
import { GuardianFormDialog } from "./guardian-form-dialog";
import { groupGuardians, isActiveLink, unlinkRule } from "./guardians-rules";
import {
    ADD_GUARDIAN_LABEL,
    GROUP_LABELS,
    GUARDIAN_ACTION_ERROR_TEXT,
    GUARDIAN_ADDED_TEXT,
    GUARDIAN_PRIMARY_TEXT,
    GUARDIAN_UNLINKED_TEXT,
    GUARDIAN_UPDATED_TEXT,
    GUARDIANS_LOAD_ERROR_TEXT,
    GUARDIANS_TITLE,
    HIDE_INACTIVE_LABEL,
    NEW_PRIMARY_LABEL,
    NO_GUARDIANS_TEXT,
    NO_GUARDIANS_TITLE,
    ONLY_PRIMARY_TEXT,
    SHOW_INACTIVE_LABEL,
    UNLINK_LABEL,
    UNLINK_PRIMARY_TEXT,
    UNLINK_TEXT,
    unlinkTitle,
} from "./guardians-texts";
import type { GuardianLink } from "./types";
import { useGuardianLinks, useMakePrimary, useUnlinkGuardian } from "./use-guardians-data";

function UnlinkDialog({ link, links, studentId, onClose, onDone }: { link: GuardianLink; links: GuardianLink[]; studentId: string; onClose: () => void; onDone: () => void }) {
    const unlink = useUnlinkGuardian(studentId);
    const rule = unlinkRule(link, links);
    const [newPrimaryId, setNewPrimaryId] = useState(rule.kind === "choose-primary" ? rule.options[0].guardianMembershipId : "");
    const error = unlink.isError ? errorInfo(unlink.error, GUARDIAN_ACTION_ERROR_TEXT).message : null;
    const description = rule.kind === "blocked" ? ONLY_PRIMARY_TEXT : rule.kind === "choose-primary" ? UNLINK_PRIMARY_TEXT : UNLINK_TEXT;
    return (
        <Modal open onOpenChange={(open) => !open && onClose()} title={unlinkTitle(link.fullName || EMPTY_VALUE)} description={description}>
            <div className="flex flex-col gap-4">
                {rule.kind === "choose-primary" && (
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="nuevo-principal" className={LABEL_STYLES}>{NEW_PRIMARY_LABEL}</label>
                        <select id="nuevo-principal" value={newPrimaryId} onChange={(event) => setNewPrimaryId(event.target.value)} className={`${CONTROL_STYLES} border-line`}>
                            {rule.options.map((option) => (
                                <option key={option.guardianMembershipId} value={option.guardianMembershipId}>{option.fullName || EMPTY_VALUE}</option>
                            ))}
                        </select>
                    </div>
                )}
                {error && <p role="alert" className="rounded-[10px] bg-error-bg px-4 py-3 text-sm text-error">{error}</p>}
                <div className="flex gap-3 lg:justify-end">
                    <button type="button" onClick={onClose} className="h-11 flex-1 rounded-[10px] border border-line bg-surface px-4 font-semibold text-ink lg:flex-none">{CANCEL_LABEL}</button>
                    {rule.kind !== "blocked" && (
                        <button
                            type="button"
                            disabled={unlink.isPending}
                            onClick={() => unlink.mutate({ guardianMembershipId: link.guardianMembershipId, newPrimaryId: rule.kind === "choose-primary" ? newPrimaryId : null }, { onSuccess: onDone })}
                            className="h-11 flex-1 rounded-[10px] bg-error px-4 font-semibold text-white disabled:opacity-60 lg:flex-none"
                        >
                            {unlink.isPending ? "Desvinculando…" : UNLINK_LABEL}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function Group({ title, links, render }: { title: string; links: GuardianLink[]; render: (link: GuardianLink) => React.ReactNode }) {
    if (links.length === 0) return null;
    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted">{title}</h3>
            <div className="grid gap-3 md:grid-cols-2">{links.map(render)}</div>
        </section>
    );
}

// Tutores dentro de la ficha del alumno (SDD M9)
export function GuardiansSection({ studentId }: { studentId: string }) {
    const links = useGuardianLinks(studentId);
    const makePrimary = useMakePrimary(studentId);
    const { showToast } = useToast();
    const [showInactive, setShowInactive] = useState(false);
    const [form, setForm] = useState<{ link: GuardianLink | null } | null>(null);
    const [unlinking, setUnlinking] = useState<GuardianLink | null>(null);

    if (links.isPending) return <SkeletonLines lines={4} />;
    if (links.isError) return <ErrorState message={errorInfo(links.error, GUARDIANS_LOAD_ERROR_TEXT).message} onRetry={() => void links.refetch()} />;

    const all = links.data;
    const groups = groupGuardians(all, showInactive);
    const hasInactive = all.some((link) => !isActiveLink(link));
    const hasPrimary = all.some((link) => link.isPrimary && isActiveLink(link));
    const render = (link: GuardianLink) => (
        <GuardianCard
            key={link.guardianMembershipId}
            link={link}
            busy={makePrimary.isPending}
            onEdit={() => setForm({ link })}
            onUnlink={() => setUnlinking(link)}
            onMakePrimary={() =>
                makePrimary.mutate(link.guardianMembershipId, {
                    onSuccess: () => showToast(GUARDIAN_PRIMARY_TEXT),
                    onError: (error) => showToast(errorInfo(error, GUARDIAN_ACTION_ERROR_TEXT).message),
                })
            }
        />
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-ink">{GUARDIANS_TITLE}</h2>
                <div className="flex flex-wrap gap-2">
                    {hasInactive && (
                        <button type="button" onClick={() => setShowInactive((value) => !value)} aria-pressed={showInactive} className={ACTION}>
                            {showInactive ? HIDE_INACTIVE_LABEL : SHOW_INACTIVE_LABEL}
                        </button>
                    )}
                    <button type="button" onClick={() => setForm({ link: null })} className={PRIMARY_BUTTON}>
                        <span aria-hidden="true">+</span> {ADD_GUARDIAN_LABEL}
                    </button>
                </div>
            </div>
            {all.length === 0 ? (
                <EmptyState title={NO_GUARDIANS_TITLE} description={NO_GUARDIANS_TEXT} />
            ) : (
                <>
                    <Group title={GROUP_LABELS.primary} links={groups.primary} render={render} />
                    <Group title={GROUP_LABELS.secondary} links={groups.secondary} render={render} />
                    <Group title={GROUP_LABELS.others} links={groups.others} render={render} />
                </>
            )}
            <GuardianFormDialog
                open={form !== null}
                studentId={studentId}
                link={form?.link ?? null}
                suggestPrimary={!hasPrimary}
                onOpenChange={(open) => !open && setForm(null)}
                onSaved={(created) => {
                    setForm(null);
                    showToast(created ? GUARDIAN_ADDED_TEXT : GUARDIAN_UPDATED_TEXT);
                }}
            />
            {unlinking && (
                <UnlinkDialog
                    link={unlinking}
                    links={all}
                    studentId={studentId}
                    onClose={() => setUnlinking(null)}
                    onDone={() => {
                        setUnlinking(null);
                        showToast(GUARDIAN_UNLINKED_TEXT);
                    }}
                />
            )}
        </div>
    );
}
