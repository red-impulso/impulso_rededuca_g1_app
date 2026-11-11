"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { SWITCH_STEPS, useInstitutionSwitch } from "./institution-switch";
import { ROLE_LABELS } from "./types";
import type { Membership } from "./types";
import { useSession } from "./use-session";

function initials(name: string): string {
    return name.split(/\s+/).filter((word) => /^[A-Za-zÁÉÍÓÚÑ]/.test(word)).slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("") || "E";
}

function SchoolLogo({ name }: { name: string }) {
    return <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#E8EEF9] text-xs font-semibold text-blue">{initials(name)}</span>;
}

const SCHOOL_STATUS_LABELS: Record<string, string> = { "en-implementacion": "⏳ En implementación", suspendida: "⚠ Suspendida" };

// Ciudad y nivel de GET /me, si Back los manda
export function schoolPlace(membership: Membership): string | null {
    return [membership.city, membership.level].filter(Boolean).join(" · ") || null;
}

function SchoolCard({ membership, current, onChoose }: { membership: Membership; current: boolean; onChoose: () => void }) {
    return (
        <button
            type="button"
            role="option"
            aria-selected={current}
            onClick={onChoose}
            className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border p-3 text-left outline-blue/40 focus-visible:outline-3 ${current ? "border-blue bg-[#E8EEF9]/50" : "border-line hover:bg-page"}`}
        >
            <SchoolLogo name={membership.institutionName} />
            <span className="min-w-0 flex-1">
                <span className="block font-semibold break-words text-ink">{membership.institutionName}</span>
                {schoolPlace(membership) && <span className="block text-sm text-muted">{schoolPlace(membership)}</span>}
                <span className="block text-sm text-muted">Tu rol: {ROLE_LABELS[membership.role]}</span>
                {membership.institutionStatus && membership.institutionStatus !== "activa" && <span className="block text-xs font-semibold text-warning">{SCHOOL_STATUS_LABELS[membership.institutionStatus] ?? membership.institutionStatus}</span>}
            </span>
            {current && <span className="shrink-0 text-xs font-semibold text-blue">✓ Escuela actual</span>}
        </button>
    );
}

// Selector de escuela del header (SDD 8.5). Una sola escuela: solo el nombre.
export function SchoolSelector() {
    const { memberships, active } = useSession();
    const { state, switchTo, dismiss } = useInstitutionSwitch();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const failed = state.phase === "error";

    if (memberships.length <= 1) return <p className="truncate text-xs text-muted">{active.institutionName}</p>;

    const normalized = query.trim().toLocaleLowerCase("es");
    const others = memberships.filter((item) => item.id !== active.id && item.institutionName.toLocaleLowerCase("es").includes(normalized));
    const choose = (target: Membership) => {
        setOpen(false);
        setQuery("");
        if (target.id !== active.id) switchTo(target);
    };
    // Flechas para moverse entre escuelas (SDD 8.5)
    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'));
        const index = options.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === "ArrowDown" ? Math.min(options.length - 1, index + 1) : Math.max(0, index - 1);
        options[next]?.focus();
        event.preventDefault();
    };

    return (
        <>
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger
                    aria-haspopup="dialog"
                    className={`flex min-h-11 max-w-[218px] items-center gap-1 rounded-[10px] border px-2 text-left text-xs outline-blue/40 focus-visible:outline-3 md:max-w-[280px] lg:max-w-[340px] ${failed ? "border-error text-error" : "border-transparent text-muted hover:bg-page"}`}
                >
                    <span className="truncate">{failed ? "No pudimos cambiar" : active.institutionName}</span>
                    <span aria-hidden="true">▾</span>
                    <span className="sr-only">Cambiar de escuela</span>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50" />
                    <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[20px] border border-line bg-surface p-5 text-ink shadow-xl outline-none md:inset-x-auto md:top-20 md:bottom-auto md:left-4 md:w-[470px] md:rounded-2xl">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                                <Dialog.Title className="text-lg font-semibold">Cambiar de escuela</Dialog.Title>
                                <Dialog.Description className="text-sm text-muted">{memberships.length} escuelas</Dialog.Description>
                            </div>
                            <Dialog.Close className="flex h-11 w-11 items-center justify-center rounded-[10px] text-muted hover:bg-page" aria-label="Cerrar">✕</Dialog.Close>
                        </div>
                        <label htmlFor="escuelas-buscar" className="sr-only">Buscar escuela por nombre</label>
                        <input id="escuelas-buscar" type="search" placeholder="Buscar por nombre" value={query} onChange={(event) => setQuery(event.target.value)} className="mb-3 h-11 w-full rounded-[10px] border border-line px-3 outline-blue/40 focus-visible:outline-3" />
                        <div role="listbox" aria-label="Escuelas" onKeyDown={onKeyDown} className="min-h-0 flex-1 overflow-y-auto">
                            <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted">ESCUELA ACTUAL</h3>
                            <SchoolCard membership={active} current onChoose={() => setOpen(false)} />
                            <h3 className="mt-4 mb-2 text-xs font-semibold tracking-wide text-muted">TUS ESCUELAS</h3>
                            {others.length === 0 ? (
                                <div className="flex flex-col items-start gap-2 text-sm">
                                    <p className="font-semibold">No hay escuelas en “{query.trim()}”.</p>
                                    <p className="text-muted">Probá con otra ciudad o con el nombre de la escuela.</p>
                                    <button type="button" onClick={() => setQuery("")} className="min-h-11 font-semibold text-blue hover:underline">Limpiar búsqueda</button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {others.map((item) => <SchoolCard key={item.id} membership={item} current={false} onChoose={() => choose(item)} />)}
                                </div>
                            )}
                        </div>
                        <p className="mt-3 hidden text-xs text-muted md:block">↑ ↓ para moverte · Enter para elegir</p>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            <SwitchProgress onRetry={() => state.phase === "error" && switchTo(state.target)} onCancel={dismiss} />
        </>
    );
}

// Progreso y error del cambio de escuela (SDD 8.6)
function SwitchProgress({ onRetry, onCancel }: { onRetry: () => void; onCancel: () => void }) {
    const { state } = useInstitutionSwitch();
    if (state.phase === "idle") return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 md:items-center">
            <div role="dialog" aria-modal="true" aria-labelledby="cambio-escuela-titulo" className="w-full rounded-t-[20px] bg-surface p-6 text-ink md:max-w-[440px] md:rounded-2xl">
                <div className="mb-3 flex items-center gap-3">
                    <SchoolLogo name={state.target.institutionName} />
                    <h2 id="cambio-escuela-titulo" className="font-semibold">{state.phase === "loading" ? `Cambiando a ${state.target.institutionName}` : "No pudimos cambiar de escuela"}</h2>
                </div>
                {state.phase === "loading" ? (
                    <>
                        <p className="mb-3 text-sm text-muted">Estamos preparando tu espacio de trabajo.</p>
                        <ol aria-live="polite" className="flex flex-col gap-2 text-sm">
                            {SWITCH_STEPS.map((step, index) => (
                                <li key={step} className={index <= state.step ? "text-ink" : "text-muted"}>
                                    <span aria-hidden="true">{index < state.step ? "✓ " : index === state.step ? "… " : "○ "}</span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                        <div className="mt-4 h-1.5 rounded-full bg-page"><div className="h-1.5 rounded-full bg-blue" style={{ width: `${((state.step + 1) / SWITCH_STEPS.length) * 100}%` }} /></div>
                    </>
                ) : (
                    <>
                        <p role="alert" className="rounded-[10px] bg-error-bg px-4 py-3 text-sm text-error">{state.message}</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button type="button" onClick={onCancel} className="h-11 rounded-[10px] border border-line px-4 font-semibold">Cancelar</button>
                            <button type="button" onClick={onRetry} className="h-11 rounded-[10px] bg-blue px-4 font-semibold text-white">Reintentar</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
