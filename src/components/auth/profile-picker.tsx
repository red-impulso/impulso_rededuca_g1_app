"use client";

import { ROLE_LABELS, useSession } from "@/features/session/session";
import type { Membership } from "@/features/session/session";

type ProfilePickerProps = {
    onSelect: (membership: Membership) => void;
    onLogout: () => void;
};

// Iniciales a partir del nombre (ej: "Persona de Ejemplo" -> "PE")
function getInitials(fullName: string): string {
const words = fullName.split(" ").filter(Boolean);
const first = words[0]?.[0] ?? "";
const last = words.length > 1 ? words[words.length - 1][0] : "";
return (first + last).toUpperCase();
}

export function ProfilePicker({ onSelect, onLogout }: ProfilePickerProps) {
const { profile, memberships } = useSession();

return (
    <div className="flex flex-col gap-6">
    <div className="flex items-center gap-3 border-b border-line pb-5">
        <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand font-semibold text-white"
            aria-hidden="true"
        >
            {getInitials(profile.fullName)}
        </div>
        <div>
            <p className="text-xs text-muted">Sesión iniciada como</p>
            <p className="font-semibold text-ink">{profile.fullName}</p>
        </div>
    </div>

    <div>
        <h2 className="text-2xl font-semibold text-ink">¿Cómo querés ingresar?</h2>
        <p className="mt-1 text-muted">
            Tu cuenta tiene más de un perfil. Elegí uno para continuar.
        </p>
    </div>

    <ul className="flex flex-col gap-3">
        {memberships.map((membership) => (
        <li key={membership.id}>
            <button
                type="button"
                onClick={() => onSelect(membership)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
            <span className="flex flex-col">
                <span className="font-semibold text-ink">
                    {ROLE_LABELS[membership.role]}
                </span>
                <span className="text-sm text-muted">
                    {membership.institutionName}
                </span>
                <span className="text-xs text-muted">{membership.detail}</span>
                </span>
            <span className="text-brand" aria-hidden="true">
                ›
            </span>
            </button>
        </li>
        ))}
    </ul>

    <p className="text-center text-xs text-muted">
        Solo verás la información habilitada para el perfil elegido.
    </p>

    <button
        type="button"
        onClick={onLogout}
        className="self-center text-sm font-medium text-brand hover:underline"
    >
        ‹ Cerrar sesión
    </button>
    </div>
);
}