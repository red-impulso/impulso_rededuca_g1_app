export const FOOTER_TEXT =
  "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina";

// Pie de todas las pantallas, con los colores de la marca
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface px-4 py-6 text-center text-sm text-muted">
      <p>{FOOTER_TEXT}</p>
    </footer>
  );
}