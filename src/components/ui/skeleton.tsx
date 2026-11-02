// Barra gris que parpadea mientras carga el contenido
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-line ${className}`}
    />
  );
}

// Bloque de líneas de carga (tarjetas, listas, tablas)
export function SkeletonLines({ lines = 4 }: { lines?: number }) {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          // Las líneas pares son más cortas, como en el diseño
          className={index % 2 === 0 ? "h-4 w-full" : "h-4 w-2/3"}
        />
      ))}
    </div>
  );
}
