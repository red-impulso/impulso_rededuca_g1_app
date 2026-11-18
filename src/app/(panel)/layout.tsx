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
                    {/* Fondo que sube oscuro desde el footer (--panel-bg). El pb-32 deja libre
                        la franja oscura, así el texto fuera de tarjetas no cae sobre ella. */}
                    <div className="flex flex-1 flex-col bg-panel">
                        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-32">{children}</main>
                    </div>
                </NotificationsProvider>
            </SessionProvider>
        </QueryProvider>
    );
}
