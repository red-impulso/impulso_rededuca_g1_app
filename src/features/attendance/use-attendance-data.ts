"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/session/use-session";
import { apiFetch } from "@/lib/api";
import { coursesPathFor, sheetPath } from "./attendance-api";
import { isFutureDate, todayInArgentina } from "./attendance-rules";
import type { AttendanceCourse, AttendanceRow } from "./types";

// Lista de cursos: se pide una sola vez
export type CoursesState =
    | { status: "unsupported" } // este rol no toma lista
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; courses: AttendanceCourse[] };

// Resultado de pedir los cursos (path = de cuál de las dos rutas)
type CoursesResult =
    | { path: string; status: "ready"; courses: AttendanceCourse[] }
    | { path: string; status: "error"; message: string };

// Resultado de pedir la planilla de un curso y una fecha (key = cuál de las dos)
type SheetResult =
    | { key: string; status: "ready"; rows: AttendanceRow[] }
    | { key: string; status: "error"; message: string };

export type SheetState =
    | { status: "idle" } // todavía no hay curso o fecha válida
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; rows: AttendanceRow[] };

// "ok" = se puede pedir la planilla; "empty" = fecha vacía o incompleta; "future" = posterior a hoy
export type DateStatus = "ok" | "empty" | "future";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

// Trae del Back lo que necesita la pantalla de asistencia:
// los cursos del rol, y la planilla del curso y la fecha elegidos.
export function useAttendanceData() {
    const { active } = useSession();
    const coursesPath = coursesPathFor(active.role);

    // "Hoy" con hora de Argentina; se calcula una sola vez al abrir la pantalla
    const [today] = useState(() => todayInArgentina());

    const [coursesResult, setCoursesResult] = useState<CoursesResult | null>(null);
    const [coursesAttempt, setCoursesAttempt] = useState(0);

    // Lo que se eligió (null = no eligió nada: primer curso / hoy)
    const [courseChoice, setCourseChoice] = useState<string | null>(null);
    const [dateChoice, setDateChoice] = useState<string | null>(null);

    const [sheetResult, setSheetResult] = useState<SheetResult | null>(null);
    const [sheetAttempt, setSheetAttempt] = useState(0);

    // GET /me/courses (docente) o GET /courses (admin y director)
    useEffect(() => {
        if (!coursesPath) return;
        let cancelled = false;
        apiFetch<AttendanceCourse[]>(coursesPath)
            .then((courses) => {
                if (!cancelled) setCoursesResult({ path: coursesPath, status: "ready", courses });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setCoursesResult({
                    path: coursesPath,
                    status: "error",
                    message: toMessage(error, "No pudimos cargar tus cursos."),
                });
            });
        return () => {
            cancelled = true;
        };
    }, [coursesPath, coursesAttempt]);

    // Estado de los cursos: si lo guardado es de otra ruta, está cargando
    let catalog: CoursesState;
    if (!coursesPath) {
        catalog = { status: "unsupported" };
    } else if (coursesResult?.path === coursesPath) {
        catalog =
            coursesResult.status === "ready"
                ? { status: "ready", courses: coursesResult.courses }
                : { status: "error", message: coursesResult.message };
    } else {
        catalog = { status: "loading" };
    }

    const courses = catalog.status === "ready" ? catalog.courses : [];
    // Si no eligió nada (o lo elegido ya no está en la lista), queda el primero
    const course = courses.find((item) => item.id === courseChoice) ?? courses[0] ?? null;
    const courseId = course?.id ?? null;

    const date = dateChoice ?? today;
    let dateStatus: DateStatus = "ok";
    if (!DATE_RE.test(date)) {
        dateStatus = "empty";
    } else if (isFutureDate(date, today)) {
        dateStatus = "future";
    }
    const dateIsValid = dateStatus === "ok";

    // GET /attendance?courseId=...&date=...
    useEffect(() => {
        if (!courseId || !dateIsValid) return;
        const key = `${courseId}:${date}`;
        let cancelled = false;
        apiFetch<AttendanceRow[]>(sheetPath(courseId, date))
            .then((rows) => {
                if (!cancelled) setSheetResult({ key, status: "ready", rows });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setSheetResult({
                    key,
                    status: "error",
                    message: toMessage(error, "No pudimos cargar la lista del curso."),
                });
            });
        return () => {
            cancelled = true;
        };
    }, [courseId, date, dateIsValid, sheetAttempt]);

    // Estado de la planilla: si lo guardado es de otro curso o fecha, está cargando
    const requestKey = courseId && dateIsValid ? `${courseId}:${date}` : null;
    let sheet: SheetState;
    if (!requestKey) {
        sheet = { status: "idle" };
    } else if (sheetResult?.key === requestKey) {
        sheet =
            sheetResult.status === "ready"
                ? { status: "ready", rows: sheetResult.rows }
                : { status: "error", message: sheetResult.message };
    } else {
        sheet = { status: "loading" };
    }

    const retryCourses = useCallback(() => {
        setCoursesResult(null);
        setCoursesAttempt((value) => value + 1);
    }, []);

    // Reintentar tras un error: vuelve a mostrar "cargando"
    const retrySheet = useCallback(() => {
        setSheetResult(null);
        setSheetAttempt((value) => value + 1);
    }, []);

    // Después de guardar: las filas nuevas pasan a ser las vigentes sin volver a pedirlas
    const applyRows = useCallback(
        (rows: AttendanceRow[]) => {
            if (!requestKey) return;
            setSheetResult({ key: requestKey, status: "ready", rows });
        },
        [requestKey],
    );

    return {
        catalog,
        courses,
        course,
        selectCourse: setCourseChoice,
        today,
        date,
        dateStatus,
        selectDate: setDateChoice,
        sheet,
        retryCourses,
        retrySheet,
        applyRows,
    };
}
