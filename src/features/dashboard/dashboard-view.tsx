import { DashboardKpis } from "./dashboard-kpis";
import { GradeAveragesTable } from "./grade-averages-table";
import { LowAttendanceList } from "./low-attendance-list";
import type { DashboardSummary } from "./types";

type DashboardViewProps = {
    summary: DashboardSummary;
    // true mientras se vuelve a pedir el tablero
    refreshing: boolean;
};

// Tablero con datos (M5-UX, sección 2): los 4 números arriba.
// Celular: una columna, con la baja asistencia antes que los promedios.
// Computadora: promedios en la columna principal y baja asistencia en la lateral de 440 px.
export function DashboardView({ summary, refreshing }: DashboardViewProps) {
    return (
        <div aria-busy={refreshing} className="flex flex-col gap-6">
            <DashboardKpis
                students={summary.students}
                courses={summary.courses}
                teachers={summary.teachers}
                attendanceAverage={summary.attendanceAverage}
            />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
                <div className="min-w-0 lg:order-2">
                    <LowAttendanceList rows={summary.lowAttendance} />
                </div>
                <div className="min-w-0 lg:order-1">
                    <GradeAveragesTable rows={summary.gradeAverages} />
                </div>
            </div>
        </div>
    );
}
