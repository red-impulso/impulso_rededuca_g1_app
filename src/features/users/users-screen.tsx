"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CONTROL_STYLES, LABEL_STYLES } from "@/components/ui/form-fields";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Modal } from "@/components/ui/modal";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import type { Role } from "@/features/session/types";
import { useSession } from "@/features/session/use-session";
import { errorInfo } from "../school/use-school-data";
import { pageCount } from "../students/students-rules";
import { UserDetailPanel, UserMenu } from "./user-panels";
import type { UserAction } from "./user-panels";
import { UserFormDialog } from "./user-form-dialog";
import { UsersList } from "./users-list";
import { ROLES } from "./users-api";
import { DEFAULT_USER_FILTERS, can, filterChips, hasUserFilters, isLastAdmin, readUserFilters, userFiltersQuery, withUserFilter } from "./users-rules";
import {
    DEACTIVATE_TEXT,
    EXPORT_USERS_LABEL,
    INVITE_USER_LABEL,
    LAST_ACCESS_LABELS,
    LAST_ADMIN_TEXT,
    LAST_ADMIN_TITLE,
    ROLE_CHANGED_TEXT,
    SAVE_ERROR_TEXT,
    SEARCH_USERS_HELP,
    SEARCH_USERS_PLACEHOLDER,
    SEND_LINK_LABEL,
    USER_CREATED_TEXT,
    USER_FILTER_LABELS,
    USER_MENU,
    USER_ROLE_LABELS,
    USER_STATUS_LABELS,
    USER_TABS,
    USER_UPDATED_TEXT,
    USERS_EMPTY_TEXT,
    USERS_EMPTY_TITLE,
    USERS_ERROR_TEXT,
    USERS_ERROR_TITLE,
    USERS_LOADING_TEXT,
    USERS_NO_RESULTS_TEXT,
    USERS_OFFLINE_TEXT,
    USERS_TITLE,
    changeRoleText,
    changeRoleTitle,
    deactivateTitle,
    invitationSentText,
    resetText,
    resetTitle,
    resultsText,
    showingText,
    usersNoResultsTitle,
    usersSelectedText,
    usersTotalText,
} from "./users-texts";
import type { LastAccessFilter, UserFilters, UserRow, UserStatus } from "./types";
import { useChangeRole, useExportUsers, useResetPassword, useSetActive, useUserCounts, useUsers } from "./use-users-data";

const PRIMARY = "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-blue px-4 font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3 disabled:opacity-60";
const SECONDARY = "inline-flex h-11 items-center justify-center rounded-[10px] border border-line bg-surface px-4 text-sm font-semibold text-ink outline-blue/40 hover:bg-page focus-visible:outline-3 disabled:opacity-60";

type Confirm = { kind: "deactivate" | "activate" | "reset" | "last-admin"; users: UserRow[] } | { kind: "role"; users: UserRow[]; role: Role } | null;

function Select({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className={LABEL_STYLES}>{label}</label>
            <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${CONTROL_STYLES} border-line md:w-44`}>
                <option value="">Todos</option>
                {options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}
            </select>
        </div>
    );
}

function Filters({ filters, total, onChange }: { filters: UserFilters; total: number | null; onChange: (filters: UserFilters) => void }) {
    const [query, setQuery] = useState(filters.q);
    const [urlQuery, setUrlQuery] = useState(filters.q);
    const [open, setOpen] = useState(false);
    if (filters.q !== urlQuery) {
        setUrlQuery(filters.q);
        setQuery(filters.q);
    }
    useEffect(() => {
        if (query === filters.q) return;
        const timer = setTimeout(() => onChange(withUserFilter(filters, { q: query })), 300);
        return () => clearTimeout(timer);
    }, [query, filters, onChange]);
    const chips = filterChips(filters);
    const set = (change: Partial<UserFilters>) => onChange(withUserFilter(filters, change));
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3">
            <div className="flex gap-2 md:items-end">
                <div className="flex-1">
                    <label htmlFor="usuarios-buscar" className="sr-only">{SEARCH_USERS_PLACEHOLDER}</label>
                    <input id="usuarios-buscar" type="search" placeholder={SEARCH_USERS_PLACEHOLDER} aria-describedby="usuarios-buscar-ayuda" value={query} onChange={(event) => setQuery(event.target.value)} className={`${CONTROL_STYLES} border-line`} />
                    <p id="usuarios-buscar-ayuda" className="mt-1 text-xs text-muted">{SEARCH_USERS_HELP}</p>
                </div>
                <button type="button" aria-expanded={open} aria-controls="usuarios-filtros" onClick={() => setOpen((value) => !value)} className={`${SECONDARY} shrink-0 md:hidden`}>Filtros{chips.length > 0 && ` (${chips.length})`}</button>
            </div>
            <div id="usuarios-filtros" className={`${open ? "grid" : "hidden"} grid-cols-2 gap-3 md:flex md:flex-wrap md:items-end`}>
                <Select id="usuarios-rol" label={USER_FILTER_LABELS.role} value={filters.role ?? ""} onChange={(value) => set({ role: (value || null) as Role | null })} options={ROLES.map((role) => [role, USER_ROLE_LABELS[role]])} />
                <Select id="usuarios-estado" label={USER_FILTER_LABELS.status} value={filters.status ?? ""} onChange={(value) => set({ status: (value || null) as UserStatus | null })} options={Object.entries(USER_STATUS_LABELS)} />
                <Select id="usuarios-acceso" label={USER_FILTER_LABELS.lastAccess} value={filters.lastAccess ?? ""} onChange={(value) => set({ lastAccess: (value || null) as LastAccessFilter | null })} options={Object.entries(LAST_ACCESS_LABELS)} />
            </div>
            {(chips.length > 0 || filters.q.trim()) && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {chips.map((chip) => (
                        <button key={chip.key} type="button" onClick={() => set({ [chip.key]: null })} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-[#E8EEF9] px-3 font-semibold text-blue" aria-label={`Quitar filtro ${chip.label}`}>{chip.label} <span aria-hidden="true">✕</span></button>
                    ))}
                    <button type="button" onClick={() => onChange(DEFAULT_USER_FILTERS)} className="min-h-11 px-2 font-semibold text-blue hover:underline">Limpiar filtros</button>
                    {total !== null && <span role="status" className="text-muted">{resultsText(total)}</span>}
                </div>
            )}
        </div>
    );
}

function UsersContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { active } = useSession();
    const { showToast } = useToast();
    const filters = readUserFilters(searchParams);
    const users = useUsers(filters);
    const counts = useUserCounts();
    const changeRole = useChangeRole();
    const setActive = useSetActive();
    const resetPassword = useResetPassword();
    const exportUsers = useExportUsers();
    const [selected, setSelected] = useState<string[]>([]);
    const [viewing, setViewing] = useState<UserRow | null>(null);
    const [menu, setMenu] = useState<UserRow | null>(null);
    const [form, setForm] = useState<{ user: UserRow | null } | null>(null);
    const [confirm, setConfirm] = useState<Confirm>(null);
    const [rolePick, setRolePick] = useState<UserRow[] | null>(null);
    const setFilters = useCallback((next: UserFilters) => router.replace(`${pathname}${userFiltersQuery(next)}`, { scroll: false }), [router, pathname]);
    const rows = users.data?.data ?? [];
    const school = active.institutionName;
    const failed = (error: unknown) => showToast(errorInfo(error, SAVE_ERROR_TEXT).message);

    const onAction = (action: UserAction, user: UserRow) => {
        setMenu(null);
        if (action === "view") return setViewing(user);
        setViewing(null);
        if (action === "edit") return setForm({ user });
        if (action === "role") return setRolePick([user]);
        if (action === "deactivate" && isLastAdmin(user, rows)) return setConfirm({ kind: "last-admin", users: [user] });
        setConfirm({ kind: action, users: [user] });
    };

    const runConfirm = () => {
        if (!confirm || confirm.kind === "last-admin") return setConfirm(null);
        const ids = confirm.users.map((user) => user.membershipId);
        const done = (text: string) => () => { setConfirm(null); setSelected([]); showToast(text); };
        if (confirm.kind === "role") changeRole.mutate({ ids, role: confirm.role }, { onSuccess: done(ROLE_CHANGED_TEXT), onError: failed });
        if (confirm.kind === "deactivate" || confirm.kind === "activate") setActive.mutate({ ids, active: confirm.kind === "activate" }, { onSuccess: done(USER_UPDATED_TEXT), onError: failed });
        if (confirm.kind === "reset") resetPassword.mutate(confirm.users.map((user) => user.userId), { onSuccess: done(confirm.users.length === 1 ? invitationSentText(confirm.users[0].email ?? "") : USER_UPDATED_TEXT), onError: failed });
    };
    const selectedRows = rows.filter((row) => selected.includes(row.membershipId));
    const first = confirm?.users[0];
    const confirmCopy: { title: string; description?: string; label: string } | null = !confirm || !first
        ? null
        : confirm.kind === "role"
          ? { title: changeRoleTitle(confirm.users.length === 1 ? first.fullName : usersSelectedText(confirm.users.length), USER_ROLE_LABELS[confirm.role]), description: changeRoleText(USER_ROLE_LABELS[confirm.role], school), label: USER_MENU.role[0] }
          : confirm.kind === "deactivate"
            ? { title: deactivateTitle(confirm.users.length === 1 ? first.fullName : usersSelectedText(confirm.users.length)), description: DEACTIVATE_TEXT, label: USER_MENU.deactivate[0] }
            : confirm.kind === "activate"
              ? { title: `¿Activar a ${first.fullName}?`, description: USER_MENU.activate[1], label: USER_MENU.activate[0] }
              : confirm.kind === "reset"
                ? { title: resetTitle(confirm.users.length === 1 ? first.fullName : usersSelectedText(confirm.users.length)), description: resetText(first.email), label: SEND_LINK_LABEL }
                : { title: LAST_ADMIN_TITLE, description: LAST_ADMIN_TEXT, label: "Entendido" };

    let content: ReactNode;
    if (users.isPending) {
        content = <div className="rounded-2xl border border-line bg-surface p-4" aria-busy="true"><p className="mb-3 text-sm text-muted">{USERS_LOADING_TEXT}</p><SkeletonLines lines={8} /></div>;
    } else if (users.isError && !users.data) {
        const info = errorInfo(users.error, USERS_ERROR_TEXT);
        content = <ErrorState message={info.kind === "offline" ? USERS_OFFLINE_TEXT : `${USERS_ERROR_TITLE} ${info.message === USERS_ERROR_TEXT ? USERS_ERROR_TEXT : info.message}`} onRetry={() => void users.refetch()} />;
    } else if (users.data.total === 0 && !hasUserFilters(filters)) {
        content = <EmptyState title={USERS_EMPTY_TITLE} description={USERS_EMPTY_TEXT} action={<button type="button" onClick={() => setForm({ user: null })} className={PRIMARY}>{INVITE_USER_LABEL}</button>} />;
    } else if (rows.length === 0) {
        content = <EmptyState title={usersNoResultsTitle(filters.q)} description={USERS_NO_RESULTS_TEXT} action={<button type="button" onClick={() => setFilters(DEFAULT_USER_FILTERS)} className={SECONDARY}>Limpiar filtros</button>} />;
    } else {
        const last = pageCount(users.data.total, users.data.limit);
        content = (
            <>
                {users.isError && <p role="alert" className="rounded-[10px] bg-warning-bg px-4 py-3 text-sm text-warning">{USERS_OFFLINE_TEXT} <button type="button" onClick={() => void users.refetch()} className="font-semibold underline">Reintentar</button></p>}
                <UsersList
                    users={rows}
                    schoolName={school}
                    selected={selected}
                    onToggle={(id) => setSelected((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]))}
                    onToggleAll={() => setSelected((list) => (rows.every((row) => list.includes(row.membershipId)) ? [] : rows.map((row) => row.membershipId)))}
                    onView={setViewing}
                    onEdit={(user) => setForm({ user })}
                    onMenu={setMenu}
                />
                <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted">Filas por página: 25 · {showingText(users.data.page, users.data.limit, users.data.total)}</p>
                    <div className="flex gap-2">
                        <button type="button" disabled={filters.page <= 1} onClick={() => setFilters(withUserFilter(filters, { page: filters.page - 1 }))} className={SECONDARY}>Anterior</button>
                        <span className="flex h-11 items-center px-2 text-sm text-ink" aria-current="page">{filters.page} de {last}</span>
                        <button type="button" disabled={filters.page >= last} onClick={() => setFilters(withUserFilter(filters, { page: filters.page + 1 }))} className={SECONDARY}>Siguiente</button>
                    </div>
                </nav>
            </>
        );
    }

    return (
        <>
            <p className="mb-1 text-sm text-muted">Administración › Usuarios</p>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-[28px] font-semibold text-ink">{USERS_TITLE}</h1>
                    {users.data && <p className="text-sm text-muted">{usersTotalText(users.data.total)} en {school}</p>}
                </div>
                <div className="flex gap-2">
                    <button type="button" disabled={exportUsers.isPending} onClick={() => exportUsers.mutate(selected, { onSuccess: (url) => window.open(url, "_blank", "noopener"), onError: failed })} className={SECONDARY}>{EXPORT_USERS_LABEL}</button>
                    <button type="button" onClick={() => setForm({ user: null })} className={PRIMARY}>{INVITE_USER_LABEL}</button>
                </div>
            </div>
            <div role="tablist" aria-label="Estado" className="mb-4 flex gap-1 overflow-x-auto border-b border-line">
                {(Object.keys(USER_TABS) as (keyof typeof USER_TABS)[]).map((tab) => {
                    const value = tab === "all" ? null : tab;
                    const count = counts.data?.[tab];
                    return (
                        <button key={tab} type="button" role="tab" aria-selected={filters.status === value} onClick={() => setFilters(withUserFilter(filters, { status: value }))} className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold ${filters.status === value ? "border-blue text-blue" : "border-transparent text-muted"}`}>
                            {USER_TABS[tab]}{count !== undefined && <span className="ml-1 rounded-full bg-page px-2 text-xs">{count.toLocaleString("es-AR")}</span>}
                        </button>
                    );
                })}
            </div>
            <div className="flex flex-col gap-4">
                <Filters filters={filters} total={users.data?.total ?? null} onChange={setFilters} />
                {selectedRows.length > 0 && (
                    <div role="region" aria-label="Acciones en lote" className="flex flex-wrap items-center gap-2 rounded-2xl bg-ink p-3 text-white">
                        <span className="text-sm font-semibold">{usersSelectedText(selectedRows.length)}</span>
                        <button type="button" onClick={() => setRolePick(selectedRows)} className="h-11 rounded-[10px] px-3 text-sm font-semibold hover:bg-white/10">{USER_MENU.role[0]}</button>
                        <button type="button" onClick={() => setConfirm(selectedRows.some((row) => isLastAdmin(row, rows)) ? { kind: "last-admin", users: selectedRows } : { kind: "deactivate", users: selectedRows })} className="h-11 rounded-[10px] px-3 text-sm font-semibold hover:bg-white/10">{USER_MENU.deactivate[0]}</button>
                        <button type="button" onClick={() => setConfirm({ kind: "reset", users: selectedRows })} className="h-11 rounded-[10px] px-3 text-sm font-semibold hover:bg-white/10">{USER_MENU.reset[0]}</button>
                        <button type="button" onClick={() => setSelected([])} className="ml-auto flex h-11 w-11 items-center justify-center rounded-[10px] hover:bg-white/10" aria-label="Quitar selección">✕</button>
                    </div>
                )}
                {content}
            </div>
            <UserDetailPanel user={viewing} schoolName={school} onClose={() => setViewing(null)} onAction={onAction} />
            <UserMenu user={menu} onClose={() => setMenu(null)} onAction={onAction} />
            <UserFormDialog
                open={form !== null}
                user={form?.user ?? null}
                onOpenChange={(open) => !open && setForm(null)}
                onSaved={(values) => { const created = !form?.user; setForm(null); showToast(created ? `${USER_CREATED_TEXT} ${invitationSentText(values.email)}` : USER_UPDATED_TEXT); }}
            />
            <ConfirmDialog
                open={confirm !== null}
                title={confirmCopy?.title ?? ""}
                description={confirmCopy?.description}
                confirmLabel={confirmCopy?.label ?? ""}
                cancelLabel={confirm?.kind === "last-admin" ? "Cerrar" : undefined}
                destructive={confirm?.kind === "deactivate"}
                loading={changeRole.isPending || setActive.isPending || resetPassword.isPending}
                onCancel={() => setConfirm(null)}
                onConfirm={runConfirm}
            />
            <Modal open={rolePick !== null} onOpenChange={(open) => !open && setRolePick(null)} title={USER_MENU.role[0]} description={rolePick ? `${rolePick.length === 1 ? rolePick[0].fullName : usersSelectedText(rolePick.length)} · ${USER_MENU.role[1]}` : undefined}>
                {rolePick && (
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const role = new FormData(event.currentTarget).get("rol") as Role;
                            const users = rolePick;
                            setRolePick(null);
                            setConfirm(users.some((user) => user.role === "admin" && role !== "admin" && isLastAdmin(user, rows)) ? { kind: "last-admin", users } : { kind: "role", users, role });
                        }}
                    >
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="usuarios-rol-nuevo" className={LABEL_STYLES}>Rol nuevo</label>
                            <select id="usuarios-rol-nuevo" name="rol" defaultValue={rolePick.length === 1 ? rolePick[0].role : "teacher"} className={`${CONTROL_STYLES} border-line`}>
                                {ROLES.map((role) => <option key={role} value={role}>{USER_ROLE_LABELS[role]}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3 lg:justify-end">
                            <button type="button" onClick={() => setRolePick(null)} className={SECONDARY}>Cancelar</button>
                            <button type="submit" className={PRIMARY}>Continuar</button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}

// Usuarios (SDD 8.2). Back exige Administración en /users.
export function UsersScreen() {
    const { active } = useSession();
    if (!can(active.role, "users:read")) return <EmptyState title="No tenés permiso para ver los usuarios de esta escuela." />;
    return <UsersContent />;
}
