import type { Role } from "../session/types";
import { lastAccessText, userInitials } from "./users-rules";
import { USER_COLUMNS, USER_ROLE_LABELS, USER_STATUS_LABELS } from "./users-texts";
import type { UserRow, UserStatus } from "./types";

// Badges con texto + ícono + color (SDD 8.3)
const ROLE_STYLES: Record<Role, [string, string]> = {
    admin: ["bg-[#FFEDD5] text-[#9A3412]", "▣"],
    director: ["bg-[#EFF6FF] text-[#1D4ED8]", "★"],
    teacher: ["bg-[#E6F4F2] text-[#0B6B64]", "▤"],
    guardian: ["bg-[#E8ECF4] text-ink", "♥"],
};
const STATUS_STYLES: Record<UserStatus, [string, string]> = {
    active: ["bg-[#E6F4F2] text-[#0B6B64]", "✓"],
    inactive: ["bg-[#F1F5F9] text-[#475569]", "–"],
    pending: ["bg-[#FEF3C7] text-[#92400E]", "◷"],
    blocked: ["bg-[#FEE2E2] text-[#B91C1C]", "⊘"],
};
const BADGE = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

export function RoleBadge({ role }: { role: Role }) {
    const [style, icon] = ROLE_STYLES[role];
    return <span className={`${BADGE} ${style}`}><span aria-hidden="true">{icon}</span>{USER_ROLE_LABELS[role]}</span>;
}

export function UserStatusBadge({ status }: { status: UserStatus | null }) {
    if (!status) return <span className="text-sm text-muted">—</span>;
    const [style, icon] = STATUS_STYLES[status];
    return <span className={`${BADGE} ${style}`}><span aria-hidden="true">{icon}</span>{USER_STATUS_LABELS[status]}</span>;
}

export function UserAvatar({ user }: { user: UserRow }) {
    return <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EEF9] text-sm font-semibold text-blue">{userInitials(user)}</span>;
}

type UsersListProps = {
    users: UserRow[];
    schoolName: string;
    selected: string[];
    onToggle: (id: string) => void;
    onToggleAll: () => void;
    onView: (user: UserRow) => void;
    onEdit: (user: UserRow) => void;
    onMenu: (user: UserRow) => void;
};

const ICON = "flex h-11 w-11 items-center justify-center rounded-[10px] text-ink outline-blue/40 hover:bg-page focus-visible:outline-3";
const CHECK = "h-5 w-5 accent-[var(--blue)]";

// Tabla en escritorio (tablet sin "Último acceso") y tarjetas en celular
export function UsersList({ users, schoolName, selected, onToggle, onToggleAll, onView, onEdit, onMenu }: UsersListProps) {
    const all = users.length > 0 && users.every((user) => selected.includes(user.membershipId));
    return (
        <>
            <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#F1F5F9] text-xs font-semibold text-muted">
                        <tr>
                            <th scope="col" className="w-12 px-4 py-3"><input type="checkbox" className={CHECK} checked={all} onChange={onToggleAll} aria-label="Seleccionar todos" /></th>
                            <th scope="col" className="px-3 py-3">{USER_COLUMNS.user}</th>
                            <th scope="col" className="px-3 py-3">{USER_COLUMNS.role}</th>
                            <th scope="col" className="px-3 py-3">{USER_COLUMNS.school}</th>
                            <th scope="col" className="px-3 py-3">{USER_COLUMNS.status}</th>
                            <th scope="col" className="hidden px-3 py-3 lg:table-cell">{USER_COLUMNS.lastAccess}</th>
                            <th scope="col" className="px-3 py-3 text-right">{USER_COLUMNS.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.membershipId} className="border-t border-line">
                                <td className="px-4 py-2"><input type="checkbox" className={CHECK} checked={selected.includes(user.membershipId)} onChange={() => onToggle(user.membershipId)} aria-label={`Seleccionar a ${user.fullName}`} /></td>
                                <th scope="row" className="px-3 py-2 font-normal">
                                    <span className="flex items-center gap-2">
                                        <UserAvatar user={user} />
                                        <span className="min-w-0">
                                            <span className="block font-semibold text-ink">{user.fullName || "—"}</span>
                                            <span className="block truncate text-xs text-muted">{user.email ?? "—"}</span>
                                        </span>
                                    </span>
                                </th>
                                <td className="px-3 py-2"><RoleBadge role={user.role} /></td>
                                <td className="max-w-48 truncate px-3 py-2 text-ink">{schoolName}</td>
                                <td className="px-3 py-2"><UserStatusBadge status={user.status} /></td>
                                <td className="hidden px-3 py-2 text-ink lg:table-cell">{lastAccessText(user.lastAccess)}</td>
                                <td className="px-2 py-1">
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => onView(user)} className={ICON} aria-label={`Ver detalle de ${user.fullName}`}><span aria-hidden="true">👁</span></button>
                                        <button type="button" onClick={() => onEdit(user)} className={ICON} aria-label={`Editar a ${user.fullName}`}><span aria-hidden="true">✎</span></button>
                                        <button type="button" onClick={() => onMenu(user)} className={ICON} aria-label={`Más acciones para ${user.fullName}`} aria-haspopup="dialog"><span aria-hidden="true">⋮</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ul className="flex flex-col gap-3 md:hidden">
                {users.map((user) => (
                    <li key={user.membershipId} className="rounded-2xl border border-line bg-surface p-4">
                        <div className="flex items-start gap-3">
                            <UserAvatar user={user} />
                            <button type="button" onClick={() => onView(user)} className="min-w-0 flex-1 text-left">
                                <span className="block font-semibold break-words text-ink">{user.fullName || "—"}</span>
                                <span className="block truncate text-sm text-muted">{user.email ?? "—"}</span>
                            </button>
                            <button type="button" onClick={() => onMenu(user)} className={ICON} aria-label={`Más acciones para ${user.fullName}`} aria-haspopup="dialog"><span aria-hidden="true">⋮</span></button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2"><RoleBadge role={user.role} /><UserStatusBadge status={user.status} /></div>
                        <p className="mt-2 text-sm text-muted">{schoolName} · {lastAccessText(user.lastAccess)}</p>
                    </li>
                ))}
            </ul>
        </>
    );
}
