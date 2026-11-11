"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch, setActiveInstitutionId } from "@/lib/api";
import { signOut } from "@/lib/supabase/sign-out";
import { INSTITUTION_CHANNEL, InstitutionSwitchContext, initialMembership, readRememberedInstitution, rememberInstitution, switchErrorText } from "./institution-switch";
import type { InstitutionSwitch, SwitchState } from "./institution-switch";
import { SessionContext } from "./use-session";
import type { MeResponse, Membership, Session } from "./types";

type State =
    | { status: "loading" }
    | { status: "ready"; me: MeResponse }
    | { status: "error"; message: string };

// Carga la sesión real con GET /me y la comparte con todo el panel
export function SessionProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [state, setState] = useState<State>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [switchState, setSwitchState] = useState<SwitchState>({ phase: "idle" });
    const queryClient = useQueryClient();
    const channel = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiFetch<MeResponse>("/me")
            .then((me) => {
                // La última escuela elegida, o la primera membresía
                const first = initialMembership(me.memberships, readRememberedInstitution());
                setActiveInstitutionId(first?.institutionId ?? null);
                if (!cancelled) {
                    setActiveId(first?.id ?? null);
                    setState({ status: "ready", me });
                }
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
        const active = memberships.find((item) => item.id === activeId) ?? memberships[0];
        return active ? { profile, memberships, active } : null;
    }, [state, activeId]);

    // Otra pestaña cambió de escuela: avisa y sigue en la suya (SDD 8.6)
    useEffect(() => {
        if (typeof BroadcastChannel === "undefined") return;
        const current = new BroadcastChannel(INSTITUTION_CHANNEL);
        channel.current = current;
        return () => current.close();
    }, []);

    // Cambio de contexto institucional (SDD 8.6): verifica acceso con /me, vacía la caché y aplica el rol de la nueva escuela
    const switchTo = useCallback(
        async (target: Membership) => {
            if (!session || target.id === session.active.id) return;
            setSwitchState({ phase: "loading", target, step: 0 });
            try {
                const me = await apiFetch<MeResponse>("/me");
                const fresh = me.memberships.find((item) => item.id === target.id);
                if (!fresh) throw new Error("Ya no tenés acceso a esta escuela.");
                setSwitchState({ phase: "loading", target: fresh, step: 1 });
                setActiveInstitutionId(fresh.institutionId);
                setSwitchState({ phase: "loading", target: fresh, step: 2 });
                queryClient.clear();
                setState({ status: "ready", me });
                setActiveId(fresh.id);
                rememberInstitution(fresh.id);
                setSwitchState({ phase: "loading", target: fresh, step: 3 });
                channel.current?.postMessage({ institutionId: fresh.institutionId });
                router.refresh();
                setSwitchState({ phase: "idle" });
            } catch (error) {
                setActiveInstitutionId(session.active.institutionId);
                const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
                setSwitchState({ phase: "error", target, message: `${switchErrorText(target.institutionName, session.active.institutionName)}${detail}` });
            }
        },
        [session, queryClient, router],
    );

    const institutionSwitch = useMemo<InstitutionSwitch>(
        () => ({ state: switchState, switchTo: (target) => void switchTo(target), dismiss: () => setSwitchState({ phase: "idle" }) }),
        [switchState, switchTo],
    );

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

    return (
        <SessionContext.Provider value={session}>
            <InstitutionSwitchContext.Provider value={institutionSwitch}>{children}</InstitutionSwitchContext.Provider>
        </SessionContext.Provider>
    );
}
