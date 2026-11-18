"use client";

import { useEffect, useId, useRef } from "react";
import type { MouseEvent } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  // Acción destructiva (por ejemplo cerrar sesión): el botón de confirmar va en rojo
  destructive?: boolean;
  loading?: boolean;
  // Texto del botón de confirmar mientras carga (por ejemplo "Publicando…")
  loadingLabel?: string;
  // Aviso que explica por qué no se puede (o conviene) confirmar
  warning?: string;
  // Deshabilita el botón de confirmar (por ejemplo, un curso con estudiantes)
  confirmDisabled?: boolean;
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
  loadingLabel,
  warning,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // Si se cerró con un toque o clic (no con teclado)
  const closedByPointer = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) {
      dialog.close();
      // close() devuelve el foco al botón que abrió el diálogo (por ejemplo "Salir" del
      // encabezado). En celular ese botón queda marcado hasta tocar otra parte: si se
      // cerró con el dedo o el mouse se suelta el foco. Con teclado se deja, para no perderse.
      const focused = document.activeElement;
      if (closedByPointer.current && focused instanceof HTMLElement) focused.blur();
    }
    closedByPointer.current = false;
  }, [open]);

  // event.detail es 0 cuando el clic viene del teclado (Enter o espacio)
  function markPointer(event: MouseEvent) {
    closedByPointer.current = event.detail > 0;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: dejamos que decida el componente padre (mientras carga no se cierra)
        event.preventDefault();
        if (loading) return;
        closedByPointer.current = false;
        onCancel();
      }}
      onClick={(event) => {
        // Clic en el fondo oscuro: cancela (mientras carga no se cierra)
        if (event.target === dialogRef.current && !loading) {
          markPointer(event);
          onCancel();
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-overlay/50"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        {warning && (
          <p role="alert" className="mt-3 rounded-lg bg-warning-bg px-3 py-2 text-sm font-semibold text-warning">
            {warning}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={(event) => {
              markPointer(event);
              onCancel();
            }}
            disabled={loading}
            className="rounded-lg border border-line bg-page px-4 py-2.5 font-semibold text-ink disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={(event) => {
              markPointer(event);
              onConfirm();
            }}
            disabled={loading || confirmDisabled}
            aria-busy={loading}
            className={`rounded-lg px-4 py-2.5 font-semibold text-on-color disabled:opacity-60 ${
              destructive ? "bg-error" : "bg-brand"
            }`}
          >
            {loading && loadingLabel ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
