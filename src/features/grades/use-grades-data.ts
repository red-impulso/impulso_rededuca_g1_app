"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { readSelection, writeSelection } from "./grade-draft-storage";
import type { GradeRow, GradingPeriod, TeacherSubject } from "./types";

// Materias y períodos: se piden juntos, una vez por escuela
type CatalogState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; subjects: TeacherSubject[]; periods: GradingPeriod[] };

// Resultado del catálogo (key = de qué usuario, escuela e intento es)
type CatalogResult =
    | { key: string; status: "error"; message: string }
    | { key: string; status: "ready"; subjects: TeacherSubject[]; periods: GradingPeriod[] };

// Resultado de pedir la planilla de una materia y un período (key = cuál de las dos)
type SheetResult =
    | { key: string; status: "ready"; rows: GradeRow[] }
    | { key: string; status: "error"; message: string };

export type SheetState =
    | { status: "idle" } // todavía no hay materia o período elegido
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; rows: GradeRow[] };

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

// Trae del Back lo que necesita la planilla del docente:
// sus materias, los períodos y las notas de la materia y el período elegidos.
// scope: usuario y escuela, para recordar la última materia y período elegidos
export function useGradesData(scope: string) {
    const [catalogResult, setCatalogResult] = useState<CatalogResult | null>(null);
    const [catalogAttempt, setCatalogAttempt] = useState(0);
    // Al cambiar de escuela (scope) es otro pedido: no se muestran materias de la anterior
    const catalogKey = `${scope}:${catalogAttempt}`;

    // Lo que el docente eligió (null = no eligió nada, se usa el primero de la lista).
    // Arranca con lo elegido la última vez; en el servidor no hay localStorage y queda null,
    // sin diferencias al hidratar porque hasta tener el catálogo solo se muestra "cargando".
    const [subjectChoice, setSubjectChoice] = useState<string | null>(() => readSelection(scope).subjectId);
    const [periodChoice, setPeriodChoice] = useState<string | null>(() => readSelection(scope).periodId);

    // Otra escuela: se recupera lo último elegido en esa escuela
    const [selectionScope, setSelectionScope] = useState(scope);
    if (selectionScope !== scope) {
        const stored = readSelection(scope);
        setSelectionScope(scope);
        setSubjectChoice(stored.subjectId);
        setPeriodChoice(stored.periodId);
    }

    const [sheetResult, setSheetResult] = useState<SheetResult | null>(null);
    const [sheetAttempt, setSheetAttempt] = useState(0);

    // GET /me/subjects y GET /grading-periods
    useEffect(() => {
        let cancelled = false;
        Promise.all([
            apiFetch<TeacherSubject[]>("/me/subjects"),
            apiFetch<GradingPeriod[]>("/grading-periods"),
        ])
            .then(([subjects, periods]) => {
                if (cancelled) return;
                setCatalogResult({
                    key: catalogKey,
                    status: "ready",
                    // Respuesta vacía o inesperada: se trata como lista vacía
                    subjects: Array.isArray(subjects) ? subjects : [],
                    periods: Array.isArray(periods) ? periods : [],
                });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setCatalogResult({
                    key: catalogKey,
                    status: "error",
                    message: toMessage(error, "No pudimos cargar tus materias."),
                });
            });
        return () => {
            cancelled = true;
        };
    }, [catalogKey]);

    let catalog: CatalogState;
    if (catalogResult?.key !== catalogKey) {
        catalog = { status: "loading" };
    } else if (catalogResult.status === "ready") {
        catalog = { status: "ready", subjects: catalogResult.subjects, periods: catalogResult.periods };
    } else {
        catalog = { status: "error", message: catalogResult.message };
    }

    const subjects = catalog.status === "ready" ? catalog.subjects : [];
    const periods = catalog.status === "ready" ? catalog.periods : [];

    // Si no eligió nada (o lo elegido ya no está en la lista), queda el primero
    const subject = subjects.find((item) => item.id === subjectChoice) ?? subjects[0] ?? null;
    const period = periods.find((item) => item.id === periodChoice) ?? periods[0] ?? null;
    const subjectId = subject?.id ?? null;
    const periodId = period?.id ?? null;

    // GET /grades?subjectId=...&periodId=...
    useEffect(() => {
        if (!subjectId || !periodId) return;
        const key = `${scope}:${subjectId}:${periodId}`;
        let cancelled = false;
        apiFetch<GradeRow[]>(
            `/grades?subjectId=${encodeURIComponent(subjectId)}&periodId=${encodeURIComponent(periodId)}`,
        )
            .then((rows) => {
                if (!cancelled) setSheetResult({ key, status: "ready", rows: Array.isArray(rows) ? rows : [] });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setSheetResult({
                    key,
                    status: "error",
                    message: toMessage(error, "No pudimos cargar las notas."),
                });
            });
        return () => {
            cancelled = true;
        };
    }, [scope, subjectId, periodId, sheetAttempt]);

    // Estado de la planilla: si lo guardado es de otra materia o período, está cargando
    let sheet: SheetState;
    if (!subjectId || !periodId) {
        sheet = { status: "idle" };
    } else if (sheetResult?.key === `${scope}:${subjectId}:${periodId}`) {
        sheet =
            sheetResult.status === "ready"
                ? { status: "ready", rows: sheetResult.rows }
                : { status: "error", message: sheetResult.message };
    } else {
        sheet = { status: "loading" };
    }

    const retryCatalog = useCallback(() => {
        setCatalogAttempt((value) => value + 1);
    }, []);

    // Reintentar tras un error: vuelve a mostrar "cargando"
    const retrySheet = useCallback(() => {
        setSheetResult(null);
        setSheetAttempt((value) => value + 1);
    }, []);

    // Volver a pedir las notas sin mostrar "cargando" (por ejemplo, después de guardar)
    const refreshSheet = useCallback(() => {
        setSheetAttempt((value) => value + 1);
    }, []);

    const selectSubject = (id: string) => {
        setSubjectChoice(id);
        writeSelection(scope, { subjectId: id, periodId });
    };

    const selectPeriod = (id: string) => {
        setPeriodChoice(id);
        writeSelection(scope, { subjectId, periodId: id });
    };

    return {
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
        refreshSheet,
    };
}