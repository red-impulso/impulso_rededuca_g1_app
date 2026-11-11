"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { ApiError } from "./api";

// Reintenta solo sin conexión o error del servidor (un 4xx no se arregla reintentando)
function shouldRetry(failureCount: number, error: unknown): boolean {
    if (failureCount >= 2) return false;
    return error instanceof ApiError && (error.status === 0 || error.status >= 500);
}

// Caché de datos de la API (TanStack Query) para las pantallas del panel
export function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: shouldRetry },
                    mutations: { retry: false },
                },
            }),
    );
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
