import Link from "next/link";

// El layout del panel carga la sesión antes de mostrar la página: se excluye de la validación de navegación instantánea
export const instant = false;

// Lo que va a tener la sección cuando esté lista (texto provisorio: pendiente de confirmar con UX)
const UPCOMING_FEATURES = [
  "Tus cursos y materias en un solo lugar",
  "La lista de alumnos de cada curso",
  "Accesos directos para tomar lista y cargar notas",
];

// Mientras tanto, lo que el docente ya puede usar
const AVAILABLE_LINKS = [
  { label: "Cargar notas", href: "/calificaciones" },
  { label: "Tomar asistencia", href: "/asistencia" },
];

// Mis cursos (docente): sección en construcción
export default function MyCoursesPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Mis cursos</h1>

      <section
        aria-labelledby="mis-cursos-proximamente"
        className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-2xl border border-line bg-surface px-6 py-10 text-center"
      >
        {/* Ilustración decorativa: un libro abierto */}
        <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6.5C10.5 5.3 8.3 4.8 5.5 5v12.5c2.8-.2 5 .3 6.5 1.5" />
            <path d="M12 6.5c1.5-1.2 3.7-1.7 6.5-1.5v12.5c-2.8-.2-5 .3-6.5 1.5" />
            <path d="M12 6.5V19" />
          </svg>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning">
          <span aria-hidden="true">◷</span>
          Próximamente
        </span>

        <div className="flex flex-col gap-2">
          <h2 id="mis-cursos-proximamente" className="text-xl font-semibold text-ink">
            Estamos construyendo esta sección
          </h2>
          <p className="text-muted">Muy pronto vas a encontrar acá todo lo de tus cursos.</p>
        </div>

        <ul className="flex w-full max-w-sm flex-col gap-2 text-left">
          {UPCOMING_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-ink">
              <span aria-hidden="true" className="mt-0.5 font-semibold text-brand">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex w-full flex-col gap-3 border-t border-line pt-5">
          <p className="text-sm text-muted">Mientras tanto, podés usar:</p>
          <nav aria-label="Accesos disponibles" className="flex flex-wrap justify-center gap-3">
            {AVAILABLE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-[10px] bg-blue px-4 text-sm font-semibold text-on-color outline-blue/40 hover:bg-blue/90 focus-visible:outline-3"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </>
  );
}
