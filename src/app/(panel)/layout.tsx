import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { NotificationsProvider } from "@/features/notifications/notifications-provider";
import { SessionProvider } from "@/features/session/session-provider";
import { QueryProvider } from "@/lib/query-provider";

// Layout de toda pantalla con sesión: carga /me y muestra header + menú por rol.
// NotificationsProvider comparte el contador de no leídas (campanita y bandeja).
// QueryProvider guarda en caché los datos de la API (TanStack Query).
export default function PanelLayout({ children }: { children: ReactNode }) {
    return (
        <QueryProvider>
            <SessionProvider>
                <NotificationsProvider>
                    <AppHeader />
                    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
                </NotificationsProvider>
            </SessionProvider>
        </QueryProvider>
    );
}
