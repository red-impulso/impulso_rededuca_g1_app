"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SaveBar } from "@/components/ui/save-bar";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useUnsavedChangesGuard } from "@/lib/use-unsaved-changes-guard";
import {
    getObservationState,
    getRowState,
    setDraft,
    setObservationDraft,
    summarizeDrafts,
} from "./grade-drafts";
import type { GradeDrafts, ObservationDrafts } from "./grade-drafts";
import { GradeStudentCard } from "./grade-student-card";
import { GradeStudentRow } from "./grade-student-row";
import type { CourseRef, GradeRow } from "./types";
import { useGradesData } from "./use-grades-data";
import { NOTHING_TO_SAVE_MESSAGE, SAVED_MESSAGE, useSaveGrades } from "./use-save-grades";

const NO_ROWS: GradeRow[] = [];

// Estilo de los selectores y del buscador (radio de 10 px, 44 px de alto, foco visible)
const CONTROL_STYLES =
    "h-11 rounded-[10px] border border-line bg-surface px-3 text-ink outline-blue/40 focus-visible:outline-3";

// "1.º A", o "1.º" si el curso no tiene división
function courseLabel(course: CourseRef): string {
    return course.division ? `${course.year}.º ${course.division}` : `${course.year}.º`;
}

// Para buscar sin importar mayúsculas ni tildes
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Mientras cargan los datos (M1-UX, sección 7)
function LoadingCard() {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <SkeletonLines lines={4} />
            <p className="mt-3 text-xs font-semibold text-muted">Cargando alumnos…</p>
        </div>
    );
}

// Planilla de notas del docente: materia + período → una nota por alumno
export function GradesSheet() {
    const {
        catalog,
        subjects,
        periods,
        subject,
        period,
        selectSubject,
        selectPeriod,
        sheet,
        retryCatalog,
        retrySheet,
    } = useGradesData();

    const { state: saveState, save, reset: resetSave } = useSaveGrades();
    const { showToast } = useToast();

    // Lo que el docente escribió y todavía no guardó
    const [drafts, setDrafts] = useState<GradeDrafts>({});
    // Notas ya guardadas en esta sesión: se muestran sin volver a pedirlas a Back
    const [savedValues, setSavedValues] = useState<Record<string, number | null>>({});
    // Observaciones: lo escrito sin guardar y lo ya guardado en esta sesión
    const [observationDrafts, setObservationDrafts] = useState<ObservationDrafts>({});
    const [savedObservations, setSavedObservations] = useState<Record<string, string>>({});
    const [query, setQuery] = useState("");
    const [descending, setDescending] = useState(false);

    const serverRows = sheet.status === "ready" ? sheet.rows : NO_ROWS;
    const rows = useMemo(() => {
        if (Object.keys(savedValues).length === 0 && Object.keys(savedObservations).length === 0) {
            return serverRows;
        }
        return serverRows.map((row) => {
            const id = row.student.id;
            let next = row;
            if (id in savedValues) next = { ...next, value: savedValues[id] };
            if (id in savedObservations) next = { ...next, observations: savedObservations[id] };
            return next;
        });
    }, [serverRows, savedValues, savedObservations]);

    const summary = useMemo(
        () => summarizeDrafts(rows, drafts, observationDrafts),
        [rows, drafts, observationDrafts],
    );
    const saving = saveState.status === "saving";

    // Aviso antes de perder cambios: al tocar un enlace, cambiar de materia o período
    // y al cerrar la pestaña
    const guard = useUnsavedChangesGuard(summary.changedCount > 0);
    const [pendingChange, setPendingChange] = useState<(() => void) | null>(null);
    const confirmOpen = pendingChange !== null || guard.pendingHref !== null;

    // Si hay cambios sin guardar pregunta antes; si no, hace el cambio directo
    function requestChange(change: () => void) {
        if (summary.changedCount > 0) {
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

    // Back entrega los alumnos de la A a la Z; acá solo se filtra y se invierte
    const visibleRows = useMemo(() => {
        const search = normalize(query.trim());
        const filtered = search
            ? rows.filter((row) =>
                  normalize(`${row.student.lastName} ${row.student.firstName}`).includes(search),
              )
            : rows;
        return descending ? [...filtered].reverse() : filtered;
    }, [rows, query, descending]);

    // Al cambiar de materia o período las notas escritas ya no corresponden
    function handleSubjectChange(subjectId: string) {
        setDrafts({});
        setObservationDrafts({});
        setSavedValues({});
        setSavedObservations({});
        setQuery("");
        resetSave();
        selectSubject(subjectId);
    }

    function handlePeriodChange(periodId: string) {
        setDrafts({});
        setObservationDrafts({});
        setSavedValues({});
        setSavedObservations({});
        resetSave();
        selectPeriod(periodId);
    }

    function handleChange(row: GradeRow, text: string) {
        setDrafts((current) => setDraft(current, row, text));
        // Al seguir escribiendo, desaparece el aviso del guardado anterior
        if (saveState.status !== "idle") resetSave();
    }

    function handleObservationChange(row: GradeRow, text: string) {
        setObservationDrafts((current) => setObservationDraft(current, row, text));
        if (saveState.status !== "idle") resetSave();
    }

    function handleCancel() {
        setDrafts({});
        setObservationDrafts({});
        resetSave();
    }

    async function handleSave() {
        if (!subject || !period) return;
        const result = await save({
            subjectId: subject.id,
            periodId: period.id,
            entries: summary.entries,
        });
        if (!result) return;
        // Lo guardado pasa a ser la nota vigente
        setSavedValues((current) => ({
            ...current,
            ...Object.fromEntries(summary.entries.map((entry) => [entry.studentId, entry.value])),
        }));
        setSavedObservations((current) => ({
            ...current,
            ...Object.fromEntries(
                summary.entries
                    .filter((entry) => entry.observations !== undefined)
                    .map((entry) => [entry.studentId, entry.observations as string]),
            ),
        }));
        setDrafts({});
        setObservationDrafts({});
        showToast(result.saved === 0 ? NOTHING_TO_SAVE_MESSAGE : SAVED_MESSAGE);
    }

    if (catalog.status === "loading") return <LoadingCard />;
    if (catalog.status === "error") {
        return <ErrorState message={catalog.message} onRetry={retryCatalog} />;
    }
    if (!subject) {
        return (
            <EmptyState
                title="Aún no tienes materias asignadas"
                description="Pide a la institución que te asigne tus materias."
            />
        );
    }
    if (!period) {
        return (
            <EmptyState
                title="Todavía no hay períodos cargados"
                description="Cuando la institución los cargue, vas a poder cargar notas."
            />
        );
    }

    const subtitle = [
        `${subject.course.year}.º Año`,
        subject.course.division ? `División ${subject.course.division}` : null,
        period.name,
        String(period.schoolYear),
    ]
        .filter(Boolean)
        .join(" · ");

    let body: ReactNode;
    if (sheet.status === "error") {
        body = <ErrorState message={sheet.message} onRetry={retrySheet} />;
    } else if (sheet.status !== "ready") {
        body = <LoadingCard />;
    } else if (rows.length === 0) {
        body = (
            <EmptyState
                title="No hay alumnos en este curso"
                description="Cuando se asignen alumnos podrás cargar notas."
            />
        );
    } else if (visibleRows.length === 0) {
        body = (
            <EmptyState
                title="No encontramos alumnos"
                description="Revisa el nombre que escribiste en el buscador."
            />
        );
    } else {
        body = (
            <>
                {/* Celular: una tarjeta por alumno */}
                <ul className="flex flex-col gap-3 lg:hidden">
                    {visibleRows.map((row) => (
                        <GradeStudentCard
                            key={row.student.id}
                            row={row}
                            state={getRowState(row, drafts)}
                            onChange={(text) => handleChange(row, text)}
                            observation={getObservationState(row, observationDrafts)}
                            onObservationChange={(text) => handleObservationChange(row, text)}
                            disabled={saving}
                        />
                    ))}
                </ul>

                {/* Computadora: tabla con el encabezado fijo */}
                <div className="hidden max-h-[60vh] overflow-auto rounded-2xl border border-line bg-surface lg:block">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-surface">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">
                                    Alumno
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">
                                    Nota
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">
                                    Resultado
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">
                                    Observaciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row) => (
                                <GradeStudentRow
                                    key={row.student.id}
                                    row={row}
                                    state={getRowState(row, drafts)}
                                    onChange={(text) => handleChange(row, text)}
                                    observation={getObservationState(row, observationDrafts)}
                                    onObservationChange={(text) => handleObservationChange(row, text)}
                                    disabled={saving}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="text-xl font-semibold text-ink">{subject.name}</h2>
                <p className="text-sm text-muted">{subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <select
                    aria-label="Materia"
                    value={subject.id}
                    onChange={(event) => {
                        const subjectId = event.target.value;
                        requestChange(() => handleSubjectChange(subjectId));
                    }}
                    disabled={saving}
                    className={CONTROL_STYLES}
                >
                    {subjects.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name} · {courseLabel(item.course)}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Período"
                    value={period.id}
                    onChange={(event) => {
                        const periodId = event.target.value;
                        requestChange(() => handlePeriodChange(periodId));
                    }}
                    disabled={saving}
                    className={CONTROL_STYLES}
                >
                    {periods.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name} · {item.schoolYear}
                        </option>
                    ))}
                </select>

                <input
                    type="search"
                    aria-label="Buscar alumno"
                    placeholder="Buscar alumno"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className={`${CONTROL_STYLES} min-w-0 flex-1`}
                />

                <button
                    type="button"
                    onClick={() => setDescending((current) => !current)}
                    className={`${CONTROL_STYLES} font-semibold`}
                >
                    {descending ? "Apellido Z–A" : "Apellido A–Z"}
                </button>
            </div>

            {body}

            {sheet.status === "ready" && rows.length > 0 && (
                <SaveBar
                    changedCount={summary.changedCount}
                    hasErrors={summary.hasErrors}
                    errorsText="Corrige lo marcado en rojo para poder guardar."
                    saveState={saveState}
                    onCancel={handleCancel}
                    onSave={handleSave}
                />
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Cambios sin guardar"
                description={`Tienes ${
                    summary.changedCount === 1 ? "1 cambio" : `${summary.changedCount} cambios`
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
