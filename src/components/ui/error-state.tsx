type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

// Error al cargar datos, con botón para volver a intentar
export function ErrorState({
  message = "No pudimos cargar tu información.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p
        role="alert"
        className="w-full rounded-lg bg-error-bg px-4 py-3 text-sm text-error"
      >
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-line bg-surface px-4 py-2.5 font-semibold text-brand"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
