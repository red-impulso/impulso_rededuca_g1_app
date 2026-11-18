export const FOOTER_TEXT =
  "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina";

// Pie de todas las pantallas: degradé petróleo (oscuro en los dos modos)
export function SiteFooter() {
  return (
    <footer className="bg-linear-to-r from-petroleum-900 via-footer-bg to-petroleum-900 px-4 py-6 text-center text-sm font-medium text-footer-text">
      <p>{FOOTER_TEXT}</p>
    </footer>
  );
}