import { formatAttendanceDate, formatPercentage, sortNewestFirst } from "./student-attendance";
import type { StudentAttendanceResponse } from "./student-attendance";
import { STATUS_LABEL } from "./types";
import type { AttendanceStatus } from "./types";

// Colores de emergencia para los estados de asistencia: usan las variables de globals.css
const STATUS_CHIP_STYLES: Record<AttendanceStatus, string> = {
    present: "bg-success-bg text-success border border-success/30",
    absent: "bg-error-bg text-error border border-error/30",
    late: "bg-warning-bg text-warning border border-warning/30",
    justified: "bg-blue/10 text-blue border border-blue/30",
};

function CountCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
        </div>
    );
}

// Asistencia de un hijo: porcentaje grande y días con su estado.
export function StudentAttendanceView({ records, summary }: StudentAttendanceResponse) {
    const days = sortNewestFirst(records);
    const hasRecords = days.length > 0;

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs text-muted">Asistencia</p>
                <p className="mt-1 text-4xl font-semibold text-ink">
                    {formatPercentage(summary.percentage)}
                </p>
                <p className="mt-2 text-xs text-muted">
                    Las llegadas tarde cuentan como presente y las justificadas no se descuentan.
                </p>
            </div>

            {hasRecords && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <CountCard label="Presentes" value={summary.present} />
                    <CountCard label="Ausentes" value={summary.absent} />
                    <CountCard label="Tarde" value={summary.late} />
                    <CountCard label="Justificadas" value={summary.justified} />
                </div>
            )}

            <section>
                <h2 className="mb-3 text-lg font-semibold text-ink">Detalle por día</h2>
                {hasRecords ? (
                    <ul className="grid gap-3 lg:grid-cols-2">
                        {days.map((record) => (
                            <li
                                key={record.date}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
                            >
                                <p className="min-w-0 text-sm text-ink">{formatAttendanceDate(record.date)}</p>
                                <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                        STATUS_CHIP_STYLES[record.status]
                                    }`}
                                >
                                    {STATUS_LABEL[record.status]}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                        Todavía no hay días registrados. Cuando se tome lista, los vas a ver acá.
                    </p>
                )}
            </section>
        </div>
    );
}