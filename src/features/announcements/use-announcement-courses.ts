"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/session/use-session";
import { apiFetch } from "@/lib/api";
import { parseCourses } from "./announcements-api";
import { coursesPathFor } from "./announcements-rules";
import { COURSES_ERROR_TEXT } from "./announcements-ui";
import type { AnnouncementCourse } from "./types";

type CoursesResult =
    | { key: string; status: "ready"; courses: AnnouncementCourse[] }
    | { key: string; status: "error"; message: string };

export type AnnouncementCoursesState =
    | { status: "unsupported" } // este rol no publica (tutor)
    | { status: "idle" } // todavía no se abrió el formulario: no se pidió nada
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; courses: AnnouncementCourse[] };

// Cursos para elegir en el formulario: docente /me/courses, admin y director /courses.
// Solo los pide cuando "enabled" es true (cuando se abre el formulario) y no los vuelve a pedir
// si ya los tiene.
export function useAnnouncementCourses(enabled: boolean) {
    const { active } = useSession();
    const path = coursesPathFor(active.role);
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<CoursesResult | null>(null);

    const key = path ? `${active.id}:${path}:${attempt}` : null;
    // Clave del último pedido que ya terminó (bien o mal)
    const loadedKey = result?.key ?? null;

    useEffect(() => {
        // Si ya hay resultado de este pedido, no se vuelve a pedir al abrir y cerrar el formulario
        if (!enabled || !path || !key || loadedKey === key) return;
        let cancelled = false;
        apiFetch<unknown>(path)
            .then((data) => {
                if (cancelled) return;
                const courses = parseCourses(data);
                setResult(
                    courses
                        ? { key, status: "ready", courses }
                        : { key, status: "error", message: COURSES_ERROR_TEXT },
                );
            })
            .catch(() => {
                if (!cancelled) setResult({ key, status: "error", message: COURSES_ERROR_TEXT });
            });
        return () => {
            cancelled = true;
        };
    }, [enabled, path, key, loadedKey]);

    let state: AnnouncementCoursesState;
    if (!path) {
        state = { status: "unsupported" };
    } else if (result?.key === key) {
        state =
            result.status === "ready"
                ? { status: "ready", courses: result.courses }
                : { status: "error", message: result.message };
    } else if (!enabled) {
        state = { status: "idle" };
    } else {
        state = { status: "loading" };
    }

    const courses = state.status === "ready" ? state.courses : [];

    // Reintentar tras un error: cambia la clave y vuelve a mostrar "cargando"
    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    return { state, courses, retry };
}
