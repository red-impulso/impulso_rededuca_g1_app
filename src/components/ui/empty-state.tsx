import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  // Botón o enlace opcional, por ejemplo "Crear comunicado"
  action?: ReactNode;
};

// Pantalla sin datos todavía
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-8 text-center">
      <div
        aria-hidden="true"
        className="mx-auto mb-4 h-14 w-14 rounded-full border border-line bg-page"
      />
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
