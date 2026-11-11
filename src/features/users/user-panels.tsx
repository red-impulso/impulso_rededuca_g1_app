"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { accessLevel, lastAccessText } from "./users-rules";
import { ACCESS_LEVELS, DETAIL_FIELDS, DETAIL_SECTIONS, DETAIL_TITLE, USER_MENU, USER_ROLE_LABELS } from "./users-texts";
import { RoleBadge, UserAvatar, UserStatusBadge } from "./users-list";
import type { UserRow } from "./types";

export type UserAction = "view" | "edit" | "role" | "reset" | "deactivate" | "activate";

// Panel lateral 440/520 px en escritorio, hoja inferior en celular
function Sheet({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
    return (
        <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-y-auto rounded-t-[20px] border border-line bg-surface p-5 text-ink shadow-xl outline-none md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-2xl lg:w-[520px]">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
                            <Dialog.Description className={description ? "text-sm text-muted" : "sr-only"}>{description ?? title}</Dialog.Description>
                        </div>
                        <Dialog.Close className="flex h-11 w-11 items-center justify-center rounded-[10px] text-muted hover:bg-page" aria-label="Cerrar">✕</Dialog.Close>
                    </div>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
    return (
        <dl className="flex flex-col gap-2 text-sm">
            {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-medium break-words">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function UserDetailPanel({ user, schoolName, onClose, onAction }: { user: UserRow | null; schoolName: string; onClose: () => void; onAction: (action: UserAction, user: UserRow) => void }) {
    const level = user ? accessLevel(user.role) : 1;
    return (
        <Sheet open={user !== null} onClose={onClose} title={DETAIL_TITLE} description={user ? `${user.fullName} · ${USER_ROLE_LABELS[user.role]}` : undefined}>
            {user && (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                            <p className="font-semibold">{user.fullName}</p>
                            <div className="mt-1 flex flex-wrap gap-2"><RoleBadge role={user.role} /><UserStatusBadge status={user.status} /></div>
                        </div>
                    </div>
                    <section aria-label={DETAIL_SECTIONS.general}>
                        <h3 className="mb-2 font-semibold">{DETAIL_SECTIONS.general}</h3>
                        <Rows rows={[[DETAIL_FIELDS.firstName, user.firstName ?? "—"], [DETAIL_FIELDS.lastName, user.lastName ?? "—"], [DETAIL_FIELDS.dni, user.dni ?? "—"], [DETAIL_FIELDS.phone, user.phone ?? "—"], [DETAIL_FIELDS.email, user.email ?? "—"]]} />
                    </section>
                    <section aria-label={DETAIL_SECTIONS.access}>
                        <h3 className="mb-2 font-semibold">{DETAIL_SECTIONS.access}</h3>
                        <Rows rows={[[DETAIL_FIELDS.user, user.email ?? "—"], [DETAIL_FIELDS.lastAccess, lastAccessText(user.lastAccess)], [DETAIL_FIELDS.status, <UserStatusBadge key="s" status={user.status} />]]} />
                    </section>
                    <section aria-label={DETAIL_SECTIONS.permissions}>
                        <h3 className="mb-2 font-semibold">{DETAIL_SECTIONS.permissions}</h3>
                        <Rows rows={[[DETAIL_FIELDS.role, <span key="r" className="flex items-center gap-2"><RoleBadge role={user.role} /><button type="button" onClick={() => onAction("role", user)} className="min-h-11 px-2 font-semibold text-blue hover:underline">{USER_MENU.role[0]}</button></span>], [DETAIL_FIELDS.schools, schoolName]]} />
                        <p className="mt-3 text-sm text-muted">{DETAIL_FIELDS.level}: {ACCESS_LEVELS[level - 1]}</p>
                        <div className="mt-1 grid grid-cols-4 gap-1" role="img" aria-label={`${DETAIL_FIELDS.level}: ${ACCESS_LEVELS[level - 1]}`}>
                            {ACCESS_LEVELS.map((label, index) => <span key={label} className={`h-1.5 rounded-full ${index < level ? "bg-blue" : "bg-page"}`} />)}
                        </div>
                    </section>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => onAction("edit", user)} className="h-11 rounded-[10px] bg-blue px-4 font-semibold text-white">Editar</button>
                        <button type="button" onClick={() => onAction("reset", user)} className="h-11 rounded-[10px] border border-line px-4 font-semibold">{USER_MENU.reset[0]}</button>
                        {user.status === "inactive" ? (
                            <button type="button" onClick={() => onAction("activate", user)} className="h-11 rounded-[10px] border border-line px-4 font-semibold">{USER_MENU.activate[0]}</button>
                        ) : (
                            <button type="button" onClick={() => onAction("deactivate", user)} className="h-11 rounded-[10px] border border-error px-4 font-semibold text-error">{USER_MENU.deactivate[0]}</button>
                        )}
                    </div>
                </div>
            )}
        </Sheet>
    );
}

// Menú contextual (hoja inferior en celular, panel en escritorio)
export function UserMenu({ user, onClose, onAction }: { user: UserRow | null; onClose: () => void; onAction: (action: UserAction, user: UserRow) => void }) {
    const actions: UserAction[] = user ? ["view", "edit", "role", "reset", user.status === "inactive" ? "activate" : "deactivate"] : [];
    return (
        <Sheet open={user !== null} onClose={onClose} title={user?.fullName ?? ""} description={user ? USER_ROLE_LABELS[user.role] : undefined}>
            <ul className="flex flex-col">
                {user && actions.map((action) => (
                    <li key={action}>
                        <button type="button" onClick={() => onAction(action, user)} className={`flex min-h-14 w-full flex-col items-start justify-center rounded-[10px] px-3 text-left hover:bg-page ${action === "deactivate" ? "text-error" : ""}`}>
                            <span className="font-semibold">{USER_MENU[action][0]}</span>
                            <span className="text-xs text-muted">{USER_MENU[action][1]}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </Sheet>
    );
}
