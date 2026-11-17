"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useIsMutating } from "@tanstack/react-query";
import type { FocusEvent, ReactNode } from "react";

type ModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
};

// Tiempo aproximado que tarda en aparecer el teclado del celular
const KEYBOARD_DELAY_MS = 300;

// En celular el teclado tapa la hoja inferior: el campo enfocado se lleva a la vista
function keepFieldVisible(event: FocusEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches("input, textarea, select")) return;
    if (typeof window === "undefined" || window.matchMedia("(min-width: 64rem)").matches) return;
    window.setTimeout(() => {
        if (document.activeElement === target) target.scrollIntoView({ block: "center", behavior: "smooth" });
    }, KEYBOARD_DELAY_MS);
}

// Modal con Radix Dialog: centrado en escritorio, hoja inferior (radio 20 px) en celular.
// Radix maneja el foco, Escape y el clic afuera.
// Mientras se guarda algo (una mutación de TanStack Query en curso) no se puede cerrar:
// si se cerrara, el formulario se desmonta y se pierde el aviso de éxito o de error.
export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
    const busy = useIsMutating() > 0;

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(next) => {
                if (!next && busy) return;
                onOpenChange(next);
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50" />
                <Dialog.Content
                    onFocus={keepFieldVisible}
                    className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[20px] border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink shadow-xl outline-none lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:w-full lg:max-w-lg lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:p-6"
                >
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <Dialog.Title className="text-lg font-semibold text-ink">{title}</Dialog.Title>
                            {description ? (
                                <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
                            ) : (
                                <Dialog.Description className="sr-only">{title}</Dialog.Description>
                            )}
                        </div>
                        <Dialog.Close
                            aria-label="Cerrar"
                            disabled={busy}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-muted outline-blue/40 hover:bg-page focus-visible:outline-3 disabled:opacity-40"
                        >
                            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5">
                                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </Dialog.Close>
                    </div>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
