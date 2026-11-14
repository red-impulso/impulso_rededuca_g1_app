"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { NotificationsScreen } from "./notifications-screen";
import { CLOSE_DRAWER_LABEL, NOTIFICATIONS_HREF, SCREEN_TITLE, SEE_ALL_LABEL } from "./notifications-ui";

type NotificationsDrawerProps = {
    open: boolean;
    onClose: () => void;
};

// Bandeja en un panel lateral (computadora). Usa <dialog>, que ya maneja el foco y la tecla Escape.
// La bandeja se monta recién al abrir: así se piden las notificaciones y se toma la hora cada vez.
export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => {
                // Escape en el diálogo de eliminar no cierra el panel
                if (event.target !== dialogRef.current) return;
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                // Clic en el fondo oscuro o en un enlace (una notificación, "Ver todas"): se cierra
                const target = event.target;
                if (target === dialogRef.current) onClose();
                else if (target instanceof Element && target.closest("a")) onClose();
            }}
            className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md border-l border-line bg-page p-0 text-ink backdrop:bg-ink/40"
        >
            {open && (
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
                        <h2 id={titleId} className="text-lg font-semibold text-ink">
                            {SCREEN_TITLE}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Link
                                href={NOTIFICATIONS_HREF}
                                className="rounded-lg px-2 py-2 text-sm font-medium text-blue outline-blue/40 hover:underline focus-visible:outline-3"
                            >
                                {SEE_ALL_LABEL}
                            </Link>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label={CLOSE_DRAWER_LABEL}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-xl text-ink outline-blue/40 hover:bg-page focus-visible:outline-3"
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <NotificationsScreen />
                    </div>
                </div>
            )}
        </dialog>
    );
}
