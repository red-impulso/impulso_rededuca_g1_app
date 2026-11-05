import { courseName, formatPercentage, studentName } from "./dashboard-rules";
import { LOW_ATTENDANCE_EMPTY, LOW_ATTENDANCE_HINT, LOW_ATTENDANCE_TITLE } from "./dashboard-ui";
import type { LowAttendanceRow } from "./types";

// Alumnos con baja asistencia, en el orden que manda Back (de menor a mayor porcentaje)
export function LowAttendanceList({ rows }: { rows: LowAttendanceRow[] }) {
    return (
        <section aria-labelledby="tablero-baja-asistencia" className="min-w-0">
            <h2 id="tablero-baja-asistencia" className="text-lg font-semibold text-ink">
                {LOW_ATTENDANCE_TITLE}
                {rows.length > 0 && <span className="font-normal text-muted"> ({rows.length})</span>}
            </h2>
            <p className="mb-3 text-sm text-muted">{LOW_ATTENDANCE_HINT}</p>

            {rows.length > 0 ? (
                <ul className="flex flex-col gap-3">
                    {rows.map((row) => (
                        <li
                            key={`${row.student.id}:${row.course.id}`}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-ink">{studentName(row.student)}</p>
                                <p className="truncate text-sm text-muted">{courseName(row.course)}</p>
                            </div>
                            <span className="shrink-0 rounded-full border border-error/30 bg-error-bg px-3 py-1 text-sm font-semibold text-error">
                                {formatPercentage(row.percentage)}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                    {LOW_ATTENDANCE_EMPTY}
                </p>
            )}
        </section>
    );
}
