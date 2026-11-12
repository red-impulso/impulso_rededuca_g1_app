import { EmptyState } from "@/components/ui/empty-state";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function MyCoursesPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Mis cursos</h1>
      <EmptyState title="Página en construcción" description="Próximamente vas a poder ver tus cursos acá." />
    </>
  );
}
