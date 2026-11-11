import { StatusBadge } from "../../components/ui/status-badge";
import { EMPTY_VALUE, STATUS_LABELS } from "./school-texts";
import type { RecordStatus } from "./types";

const TONES = { active: "success", inactive: "neutral", draft: "warning" } as const;

// Estado de curso o materia; si Back no lo manda → "—"
export function RecordStatusBadge({ status }: { status: RecordStatus | null }) {
    if (!status) return <span className="text-sm text-muted">{EMPTY_VALUE}</span>;
    return <StatusBadge label={STATUS_LABELS[status]} tone={TONES[status]} />;
}
