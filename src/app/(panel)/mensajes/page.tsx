import { EmptyState } from "@/components/ui/empty-state";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

export default function MessagesPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Mensajes</h1>
      <EmptyState title="Aún no hay mensajes" description="Cuando recibas mensajes, los vas a ver acá." />
    </>
  );
}
