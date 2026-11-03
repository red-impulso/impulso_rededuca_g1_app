"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { LinkedStudent } from "./types";

type LinkedStudentsState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; students: LinkedStudent[] };

// Trae los hijos del tutor con GET /me/students (solo responde al rol guardian)
export function useLinkedStudents() {
    const [state, setState] = useState<LinkedStudentsState>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        apiFetch<LinkedStudent[]>("/me/students")
            .then((students) => {
                if (!cancelled) setState({ status: "ready", students });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setState({
                    status: "error",
                    message:
                        error instanceof Error ? error.message : "No pudimos cargar tus hijos.",
                });
            });
        return () => {
            cancelled = true;
        };
    }, [attempt]);

    const retry = useCallback(() => {
        setState({ status: "loading" });
        setAttempt((value) => value + 1);
    }, []);

    return { state, retry };
}
