import { EmptyState } from "@/components/ui/empty-state";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function GradesPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Calificaciones</h1>
      <EmptyState title="Aún no hay calificaciones" description="Cuando se carguen calificaciones, las vas a ver acá." />
    </>
  );
}
