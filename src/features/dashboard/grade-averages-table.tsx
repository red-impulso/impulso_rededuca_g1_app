import { courseName, formatAverage, getPerformanceBand, subjectName } from "./dashboard-rules";
import {
    AVERAGE_COLUMN,
    BAND_CLASS,
    BAND_LABELS,
    COURSE_COLUMN,
    GRADE_AVERAGES_EMPTY,
    GRADE_AVERAGES_TITLE,
    STATUS_COLUMN,
    SUBJECT_COLUMN,
} from "./dashboard-ui";
import type { GradeAverageRow } from "./types";

// Etiqueta del rango: siempre con texto, nunca solo color. Sin notas no lleva etiqueta.
function BandBadge({ average }: { average: number | null }) {
    if (average === null) return null;
    const band = getPerformanceBand(average);
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${BAND_CLASS[band]}`}>
            {BAND_LABELS[band]}
        </span>
    );
}

// Promedio por materia y curso, en el orden que manda Back (materia y después curso)
export function GradeAveragesTable({ rows }: { rows: GradeAverageRow[] }) {
    return (
        <section aria-labelledby="tablero-promedios" className="min-w-0">
            <h2 id="tablero-promedios" className="mb-3 text-lg font-semibold text-ink">
                {GRADE_AVERAGES_TITLE}
            </h2>

            {rows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                    {GRADE_AVERAGES_EMPTY}
                </p>
            ) : (
                <>
                    {/* Celular: una tarjeta por materia */}
                    <ul className="flex flex-col gap-3 lg:hidden">
                        {rows.map((row) => (
                            <li
                                key={`${row.subject.id}:${row.course.id}`}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-semibold text-ink">{subjectName(row.subject)}</p>
                                    <p className="truncate text-sm text-muted">{courseName(row.course)}</p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <span className="text-lg font-semibold text-ink">{formatAverage(row.average)}</span>
                                    <BandBadge average={row.average} />
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Computadora: tabla */}
                    <div className="hidden overflow-auto rounded-2xl border border-line bg-surface lg:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">
                                        {SUBJECT_COLUMN}
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">
                                        {COURSE_COLUMN}
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-muted">
                                        {AVERAGE_COLUMN}
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">
                                        {STATUS_COLUMN}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={`${row.subject.id}:${row.course.id}`} className="border-t border-line">
                                        <th scope="row" className="px-4 py-2 text-left font-semibold text-ink">
                                            {subjectName(row.subject)}
                                        </th>
                                        <td className="px-4 py-2 text-muted">{courseName(row.course)}</td>
                                        <td className="px-4 py-2 text-right font-semibold text-ink">
                                            {formatAverage(row.average)}
                                        </td>
                                        <td className="px-4 py-2">
                                            <BandBadge average={row.average} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
}
