import { StatusBadge } from "../../components/ui/status-badge";
import { EMPTY_VALUE } from "../school/school-texts";
import { teacherStatusLabel } from "./teachers-rules";
import type { TeacherStatus } from "./types";

const TONES = { activo: "success", licencia: "warning", inactivo: "neutral" } as const;

export function TeacherStatusBadge({ status }: { status: TeacherStatus | null }) {
    if (!status) return <span className="text-sm text-muted">{EMPTY_VALUE}</span>;
    return <StatusBadge label={teacherStatusLabel(status)} tone={TONES[status]} />;
}
