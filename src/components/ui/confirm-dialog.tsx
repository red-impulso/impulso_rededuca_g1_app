"use client";

import { useEffect, useId, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  // Acción destructiva (por ejemplo cerrar sesión): el botón de confirmar va en rojo
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Modal de confirmación. Usa <dialog>, que ya maneja el foco y la tecla Escape
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
        // Escape: dejamos que decida el componente padre
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        // Clic en el fondo oscuro: cancela
        if (event.target === dialogRef.current) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-ink/50"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-line bg-page px-4 py-2.5 font-semibold text-ink disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2.5 font-semibold text-white disabled:opacity-60 ${
              destructive ? "bg-error" : "bg-brand"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
