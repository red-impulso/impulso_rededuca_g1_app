import type { SaveState } from "./use-save-grades";

type GradesSaveBarProps = {
    // Alumnos con cambios sin guardar
    changedCount: number;
    // true si algún casillero tiene error: no se puede guardar
    hasErrors: boolean;
    saveState: SaveState;
    onCancel: () => void;
    onSave: () => void;
};

const BUTTON_STYLES =
    "h-11 rounded-[10px] px-4 font-semibold outline-blue/40 focus-visible:outline-3 disabled:cursor-not-allowed";

function changesText(count: number): string {
    if (count === 0) return "No hay cambios sin guardar";
    return count === 1 ? "1 cambio sin guardar" : `${count} cambios sin guardar`;
}

// Barra fija abajo de la planilla (M1-UX, secciones 3 y 4)
export function GradesSaveBar({
    changedCount,
    hasErrors,
    saveState,
    onCancel,
    onSave,
}: GradesSaveBarProps) {
    const saving = saveState.status === "saving";
    const canSave = changedCount > 0 && !hasErrors && !saving;

    return (
        <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex flex-col gap-3 border-t border-line bg-surface px-4 py-3 lg:mx-0 lg:rounded-2xl lg:border">
            {/* Sin conexión en amarillo; el resto de los errores en rojo */}
            {saveState.status === "error" && (
                <p
                    role="alert"
                    className={`rounded-[10px] px-4 py-3 text-sm ${
                        saveState.kind === "offline"
                            ? "bg-warning-bg text-warning"
                            : "bg-error-bg text-error"
                    }`}
                >
                    {saveState.message}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={`text-sm ${hasErrors ? "text-error" : "text-muted"}`}>
                    {hasErrors
                        ? "Corrige las notas marcadas en rojo para poder guardar."
                        : changesText(changedCount)}
                </p>

                <div className="flex w-full gap-3 lg:w-auto">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={changedCount === 0 || saving}
                        className={`${BUTTON_STYLES} flex-1 border border-line bg-surface text-ink disabled:opacity-60 lg:flex-none`}
                    >
                        <span className="lg:hidden">Cancelar</span>
                        <span className="hidden lg:inline">Cancelar cambios</span>
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={!canSave}
                        className={`${BUTTON_STYLES} flex-[2] bg-blue text-white hover:bg-blue/90 disabled:bg-line disabled:text-muted lg:flex-none`}
                    >
                        {saving ? "Guardando…" : "Guardar cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}