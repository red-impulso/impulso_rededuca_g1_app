// Estado del guardado: lo comparten las pantallas que usan esta barra
export type SaveState =
    | { status: "idle" }
    | { status: "saving" }
    // saved = cantidad de registros que realmente cambiaron (0 si no había cambios)
    | { status: "saved"; saved: number }
    // kind "offline" se muestra en amarillo y "error" en rojo
    | { status: "error"; kind: "offline" | "error"; message: string };

type SaveBarProps = {
    // Cantidad de cambios sin guardar
    changedCount: number;
    // true si algún dato tiene error: no se puede guardar
    hasErrors: boolean;
    // Texto que se muestra cuando hasErrors es true (cada pantalla explica lo suyo)
    errorsText?: string;
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

// Barra de guardado abajo de las planillas (M1-UX, secciones 3 y 4):
// la usan calificaciones y asistencia
export function SaveBar({
    changedCount,
    hasErrors,
    errorsText = "Corrige los datos marcados en rojo para poder guardar.",
    saveState,
    onCancel,
    onSave,
}: SaveBarProps) {
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
                        ? errorsText
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