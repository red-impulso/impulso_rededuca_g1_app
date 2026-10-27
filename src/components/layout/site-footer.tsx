export const FOOTER_TEXT =
  "Creado por alumnos de IES Nº 6 de Perico, Jujuy, Argentina";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
      <p>{FOOTER_TEXT}</p>
    </footer>
  );
}
