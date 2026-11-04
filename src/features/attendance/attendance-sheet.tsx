"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { SaveBar } from "@/components/ui/save-bar";
import { useUnsavedChangesGuard } from "@/lib/use-unsaved-changes-guard";
import { NOTHING_TO_SAVE_MESSAGE, SAVED_MESSAGE } from "./attendance-api";
import {
    applySaved,
    buildEntries,
    countChanges,
    courseLabel,
    getStatus,
    markAllPresent,
    setStatus,
    summarizeAttendance,
} from "./attendance-rules";
import type { AttendanceDrafts } from "./attendance-rules";
import { AttendanceStudentRow } from "./attendance-student-row";
import type { AttendanceRow, AttendanceStatus } from "./types";
import { useAttendanceData } from "./use-attendance-data";
import { useSaveAttendance } from "./use-save-attendance";

const NO_ROWS: AttendanceRow[] = [];

// Estilo de los selectores y botones (radio de 10 px, 44 px de alto, foco visible)
const CONTROL_STYLES =
    "h-11 rounded-[10px] border border-line bg-surface px-3 text-ink outline-blue/40 focus-visible:outline-3";

// Mientras cargan los datos
function LoadingCard() {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <SkeletonLines lines={4} />
            <p className="mt-3 text-xs font-semibold text-muted">Cargando alumnos…</p>
        </div>
    );
}

// Pantalla para tomar lista: curso + fecha → un estado (P / A / T / J) por alumno
export function AttendanceSheet() {
    const {
        catalog,
        courses,
        course,
        selectCourse,
        today,
        date,
        dateStatus,
        selectDate,
        sheet,
        retryCourses,
        retrySheet,
        applyRows,
    } = useAttendanceData();

    const { state: saveState, save, reset: resetSave } = useSaveAttendance();
    const { showToast } = useToast();

    // Lo que se marcó y todavía no se guardó
    const [drafts, setDrafts] = useState<AttendanceDrafts>({});

    const rows = sheet.status === "ready" ? sheet.rows : NO_ROWS;
    const changedCount = useMemo(() => countChanges(rows, drafts), [rows, drafts]);
    const counts = useMemo(() => summarizeAttendance(rows, drafts), [rows, drafts]);
    const saving = saveState.status === "saving";

    // Aviso antes de perder cambios: al tocar un enlace, cambiar de curso o de fecha
    // y al cerrar la pestaña
    const guard = useUnsavedChangesGuard(changedCount > 0);
    const [pendingChange, setPendingChange] = useState<(() => void) | null>(null);
    const confirmOpen = pendingChange !== null || guard.pendingHref !== null;

    // Si hay cambios sin guardar pregunta antes; si no, hace el cambio directo
    function requestChange(change: () => void) {
        if (changedCount > 0) {
            setPendingChange(() => change);
        } else {
            change();
        }
    }

    function handleStay() {
        setPendingChange(null);
        guard.stay();
    }

    function handleLeave() {
        if (pendingChange) {
            const change = pendingChange;
            setPendingChange(null);
            change();
        } else {
            guard.leave();
        }
    }

    // Al cambiar de curso o de fecha, lo marcado ya no corresponde
    function handleCourseChange(courseId: string) {
        setDrafts({});
        resetSave();
        selectCourse(courseId);
    }

    function handleDateChange(value: string | null) {
        setDrafts({});
        resetSave();
        selectDate(value);
    }

    function handleStatusChange(row: AttendanceRow, status: AttendanceStatus) {
        setDrafts((current) => setStatus(current, row, status));
        // Al seguir marcando, desaparece el aviso del guardado anterior
        if (saveState.status !== "idle") resetSave();
    }

    function handleAllPresent() {
        setDrafts((current) => markAllPresent(rows, current));
        if (saveState.status !== "idle") resetSave();
    }

    function handleCancel() {
        setDrafts({});
        resetSave();
    }

    async function handleSave() {
        if (!course) return;
        const result = await save({
            courseId: course.id,
            date,
            entries: buildEntries(rows, drafts),
        });
        if (!result) return;
        // Lo guardado pasa a ser lo vigente
        applyRows(applySaved(rows, drafts));
        setDrafts({});
        showToast(result.saved === 0 ? NOTHING_TO_SAVE_MESSAGE : SAVED_MESSAGE);
    }

    // Textos propios: pendiente de confirmar con UX
    if (catalog.status === "unsupported") {
        return (
            <EmptyState
                title="Esta pantalla es para docentes y directivos"
                description="Con tu perfil no puedes tomar lista desde acá."
            />
        );
    }
    if (catalog.status === "loading") return <LoadingCard />;
    if (catalog.status === "error") {
        return <ErrorState message={catalog.message} onRetry={retryCourses} />;
    }
    if (!course) {
        return (
            <EmptyState
                title="Aún no hay cursos para tomar lista"
                description="Cuando haya cursos asignados, vas a poder tomar lista desde acá."
            />
        );
    }

    let body: ReactNode;
    if (dateStatus === "empty") {
        body = <EmptyState title="Elige una fecha" description="Indica el día del que quieres tomar lista." />;
    } else if (dateStatus === "future") {
        body = (
            <EmptyState
                title="No se puede tomar lista de una fecha futura"
                description="Elige el día de hoy o uno anterior."
            />
        );
    } else if (sheet.status === "error") {
        body = <ErrorState message={sheet.message} onRetry={retrySheet} />;
    } else if (sheet.status !== "ready") {
        body = <LoadingCard />;
    } else if (rows.length === 0) {
        body = (
            <EmptyState
                title="No hay alumnos en este curso"
                description="Cuando se asignen alumnos podrás tomar lista."
            />
        );
    } else {
        body = (
            <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p role="status" className="text-sm text-muted">
                        Presentes: {counts.present} · Ausentes: {counts.absent} · Tarde: {counts.late} ·
                        Justificadas: {counts.justified} · Sin marcar: {counts.unmarked}
                    </p>
                    <button
                        type="button"
                        onClick={handleAllPresent}
                        disabled={saving || counts.unmarked === 0}
                        className={`${CONTROL_STYLES} font-semibold disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        Todos presentes
                    </button>
                </div>

                <ul className="grid gap-3 lg:grid-cols-2">
                    {rows.map((row) => (
                        <AttendanceStudentRow
                            key={row.student.id}
                            row={row}
                            status={getStatus(row, drafts)}
                            changed={row.student.id in drafts}
                            onChange={(status) => handleStatusChange(row, status)}
                            disabled={saving}
                        />
                    ))}
                </ul>
            </>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-ink">{courseLabel(course)}</h2>

            <div className="flex flex-wrap items-center gap-3">
                <select
                    aria-label="Curso"
                    value={course.id}
                    onChange={(event) => {
                        const courseId = event.target.value;
                        requestChange(() => handleCourseChange(courseId));
                    }}
                    disabled={saving}
                    className={CONTROL_STYLES}
                >
                    {courses.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.shift ? `${courseLabel(item)} · ${item.shift}` : courseLabel(item)}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    aria-label="Fecha"
                    value={date}
                    max={today}
                    onChange={(event) => {
                        const value = event.target.value;
                        requestChange(() => handleDateChange(value));
                    }}
                    disabled={saving}
                    className={CONTROL_STYLES}
                />

                {date !== today && (
                    <button
                        type="button"
                        onClick={() => requestChange(() => handleDateChange(null))}
                        disabled={saving}
                        className={`${CONTROL_STYLES} font-semibold`}
                    >
                        Ir a hoy
                    </button>
                )}
            </div>

            {body}

            {dateStatus === "ok" && sheet.status === "ready" && rows.length > 0 && (
                <SaveBar
                    changedCount={changedCount}
                    hasErrors={false}
                    saveState={saveState}
                    onCancel={handleCancel}
                    onSave={handleSave}
                />
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Cambios sin guardar"
                description={`Tienes ${
                    changedCount === 1 ? "1 cambio" : `${changedCount} cambios`
                } sin guardar. Si sales, se perderán.`}
                confirmLabel="Salir sin guardar"
                cancelLabel="Seguir editando"
                destructive
                onConfirm={handleLeave}
                onCancel={handleStay}
            />
        </div>
    );
}
