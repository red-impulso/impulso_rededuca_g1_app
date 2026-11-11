"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

type ModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
};

// Modal con Radix Dialog: centrado en escritorio, hoja inferior (radio 20 px) en celular.
// Radix maneja el foco, Escape y el clic afuera.
export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50" />
                <Dialog.Content
                    className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-[20px] border border-line bg-surface p-5 text-ink shadow-xl outline-none lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:w-full lg:max-w-lg lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:p-6"
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
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-muted outline-blue/40 hover:bg-page focus-visible:outline-3"
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
