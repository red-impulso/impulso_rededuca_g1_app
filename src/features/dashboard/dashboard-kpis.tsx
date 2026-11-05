import { formatCount, formatPercentage } from "./dashboard-rules";
import {
    ATTENDANCE_HINT,
    ATTENDANCE_LABEL,
    COURSES_LABEL,
    STUDENTS_LABEL,
    TEACHERS_LABEL,
} from "./dashboard-ui";
import { KpiCard } from "./kpi-card";
import type { DashboardSummary } from "./types";

type DashboardKpisProps = Pick<DashboardSummary, "students" | "courses" | "teachers" | "attendanceAverage">;

// Los 4 números de arriba: 2 columnas en celular y 4 en computadora
export function DashboardKpis({ students, courses, teachers, attendanceAverage }: DashboardKpisProps) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label={STUDENTS_LABEL} value={formatCount(students)} />
            <KpiCard label={COURSES_LABEL} value={formatCount(courses)} />
            <KpiCard label={TEACHERS_LABEL} value={formatCount(teachers)} />
            <KpiCard label={ATTENDANCE_LABEL} value={formatPercentage(attendanceAverage)} hint={ATTENDANCE_HINT} />
        </div>
    );
}
