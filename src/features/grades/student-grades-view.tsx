import { GradeChip } from "./grade-chip";
import { formatAverage, formatGrade } from "./grade-rules";
import type { StudentSummary, SubjectGrades } from "./student-grades";

function SummaryCard({
    label,
    value,
    className = "",
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
        </div>
    );
}

type StudentGradesViewProps = {
    subjects: SubjectGrades[];
    summary: StudentSummary;
};

// Resumen y detalle de notas de un hijo (M1-UX, sección 5). Solo dibuja: los datos llegan por props.
export function StudentGradesView({ subjects, summary }: StudentGradesViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <SummaryCard
                    label="Promedio general"
                    value={
                        summary.generalAverage === null
                            ? "Sin notas"
                            : formatAverage(summary.generalAverage)
                    }
                    className="col-span-2 sm:col-span-1"
                />
                <SummaryCard label="Materias aprobadas" value={String(summary.approved)} />
                <SummaryCard label="Materias pendientes" value={String(summary.pending)} />
            </div>

            <section>
                <h2 className="mb-3 text-lg font-semibold text-ink">Detalle de notas</h2>
                <ul className="grid gap-3 lg:grid-cols-2">
                    {subjects.map((subject) => (
                        <li
                            key={subject.subjectId}
                            className="rounded-2xl border border-line bg-surface p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="min-w-0 truncate font-semibold text-ink">
                                    {subject.subjectName}
                                </h3>
                                <GradeChip value={subject.average} />
                            </div>
                            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                                {subject.periods.map((period) => (
                                    <li key={period.periodId}>
                                        {`${period.periodName}: ${
                                            period.value === null
                                                ? "Sin nota"
                                                : formatGrade(period.value)
                                        }`}
                                    </li>
                                ))}
                            </ul>
                            {/* El texto se muestra siempre como texto (React lo escapa) */}
                            {subject.periods
                                .filter((period) => period.observations !== null)
                                .map((period) => (
                                    <p
                                        key={period.periodId}
                                        className="mt-2 whitespace-pre-line break-words text-sm text-ink"
                                    >
                                        <span className="font-semibold">{`Observación (${period.periodName}): `}</span>
                                        {period.observations}
                                    </p>
                                ))}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
