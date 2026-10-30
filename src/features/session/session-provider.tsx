"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch, setActiveInstitutionId } from "@/lib/api";
import { signOut } from "@/lib/supabase/sign-out";
import { SessionContext } from "./use-session";
import type { MeResponse, Session } from "./types";

type State =
    | { status: "loading" }
    | { status: "ready"; me: MeResponse }
    | { status: "error"; message: string };

// Carga la sesión real con GET /me y la comparte con todo el panel
export function SessionProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [state, setState] = useState<State>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        apiFetch<MeResponse>("/me")
            .then((me) => {
                // La membresía activa es la primera (el selector llega en M10-2)
                setActiveInstitutionId(me.memberships[0]?.institutionId ?? null);
                if (!cancelled) setState({ status: "ready", me });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                // Sin sesión válida en la API: volver a ingresar
                if (error instanceof ApiError && error.status === 401) {
                    router.replace("/ingresar");
                    return;
                }
                setState({
                    status: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "No pudimos cargar tu sesión.",
                });
            });
        return () => {
            cancelled = true;
        };
    }, [attempt, router]);

    const retry = useCallback(() => {
        setState({ status: "loading" });
        setAttempt((value) => value + 1);
    }, []);

    const handleSignOut = useCallback(async () => {
        await signOut();
        setActiveInstitutionId(null);
        router.push("/ingresar");
    }, [router]);

    const session = useMemo<Session | null>(() => {
        if (state.status !== "ready") return null;
        const { profile, memberships } = state.me;
        const active = memberships[0];
        return active ? { profile, memberships, active } : null;
    }, [state]);

    if (state.status === "loading") {
        return (
            <main className="flex flex-1 items-center justify-center px-6 py-10">
                <p role="status" className="text-muted">
                    Cargando...
                </p>
            </main>
        );
    }

    if (state.status === "error") {
        return (
            <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <p role="alert" className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error">
                    {state.message}
                </p>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={retry}
                        className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-white"
                    >
                        Reintentar
                    </button>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-sm font-medium text-brand hover:underline"
                    >
                        Salir
                    </button>
                </div>
            </main>
        );
    }

    // Cuenta sin ningún perfil en una institución
    if (!session) {
        return (
            <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <p className="font-medium text-ink">
                    Tu cuenta todavía no tiene un perfil asignado
                </p>
                <p className="max-w-md text-sm text-muted">
                    Pedile a tu institución que te asigne un rol para poder ingresar.
                </p>
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-sm font-medium text-brand hover:underline"
                >
                    Salir
                </button>
            </main>
        );
    }

    return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
