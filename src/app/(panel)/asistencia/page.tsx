import { EmptyState } from "@/components/ui/empty-state";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function AttendancePage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Asistencia</h1>
      <EmptyState title="Aún no hay datos de asistencia" description="Cuando se cargue la asistencia, la vas a ver acá." />
    </>
  );
}
