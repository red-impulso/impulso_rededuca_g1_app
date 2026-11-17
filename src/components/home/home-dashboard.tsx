import Link from "next/link";
import {
  sampleAnnouncements,
  sampleEvents,
  samplePendingTasks,
  sampleStats,
} from "@/features/home/sample-data";
import type { HomeListItem, HomeStat } from "@/features/home/sample-data";

export type QuickLink = { label: string; href: string };

type HomeDashboardProps = {
  userName: string;
  // Rol e institución con los que trabaja la persona (por ejemplo "Docente · Escuela Demo")
  context?: string;
  // Accesos del rol (los mismos ítems del menú): nadie ve accesos a pantallas que no son suyas
  quickLinks?: QuickLink[];
};

const TONE_CLASSES: Record<HomeStat["tone"], string> = {
  success: "text-success",
  ink: "text-ink",
  accent: "text-accent",
  blue: "text-blue",
};

function StatCard({ stat }: { stat: HomeStat }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{stat.label}</p>
      <p className={`text-3xl font-bold ${TONE_CLASSES[stat.tone]}`}>{stat.value}</p>
      <p className="text-sm text-muted">{stat.caption}</p>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: HomeListItem[] }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 md:p-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Todavía no hay nada para mostrar.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-t border-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3">
              <span className="text-ink">{item.title}</span>
              <span className="shrink-0 text-sm text-muted">{item.when}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Pantalla de Inicio: saludo, resumen, accesos y tres listas
export function HomeDashboard({ userName, context, quickLinks = [] }: HomeDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-muted">Buen día,</p>
        <h1 className="text-2xl font-semibold text-ink md:text-3xl">{userName}</h1>
        {context && <p className="mt-1 text-sm text-muted">{context}</p>}
      </div>

      {/* Los números y las listas todavía no vienen de Back: se avisa para que nadie los tome por reales */}
      <p className="rounded-lg bg-warning-bg px-4 py-3 text-sm text-warning">
        Vista de ejemplo: estos números y listas son ilustrativos y todavía no muestran los datos de tu escuela.
      </p>

      <section aria-label="Resumen (ejemplo)" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sampleStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      {quickLinks.length > 0 && (
        <nav aria-label="Accesos" className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-brand hover:border-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <ListCard title="Comunicados recientes" items={sampleAnnouncements} />
        <ListCard title="Próximos eventos" items={sampleEvents} />
        <ListCard title="Actividades pendientes" items={samplePendingTasks} />
      </div>
    </div>
  );
}
