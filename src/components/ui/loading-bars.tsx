// Indicador de carga: tres barras redondeadas que pulsan en secuencia y el texto "Cargando…".
// La animación está en globals.css (.fx-loading-bar); con prefers-reduced-motion quedan quietas.
export function LoadingBars({ label = "Cargando…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3">
      <div aria-hidden="true" className="flex h-8 items-center gap-1.5">
        <span className="fx-loading-bar h-8 w-2 rounded-full bg-brand" />
        <span className="fx-loading-bar h-8 w-2 rounded-full bg-brand" />
        <span className="fx-loading-bar h-8 w-2 rounded-full bg-brand" />
      </div>
      <p className="text-muted">{label}</p>
    </div>
  );
}
