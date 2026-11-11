import { loadLevel, loadLevelText } from "./teachers-rules";
import { loadText } from "./teachers-texts";

const BAR = { ok: "bg-blue", near: "bg-warning", over: "bg-error" } as const;

// Medidor de carga horaria con texto (nunca solo color)
export function LoadMeter({ hours, max }: { hours: number; max: number }) {
    const level = loadLevel(hours, max);
    const label = loadLevelText(level);
    const width = max > 0 ? Math.min(100, (hours / max) * 100) : 0;
    return (
        <div className="min-w-28">
            <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-ink">{loadText(hours, max)}</span>
                {label && <span className={level === "over" ? "font-semibold text-error" : "font-semibold text-warning"}>{level === "over" ? "▲ " : "● "}{label}</span>}
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-page" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={hours} aria-label={loadText(hours, max)}>
                <div className={`h-1.5 rounded-full ${BAR[level]}`} style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}
