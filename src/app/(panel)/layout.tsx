import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { SessionProvider } from "@/features/session/session-provider";

// Layout de toda pantalla con sesión: carga /me y muestra header + menú por rol
export default function PanelLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AppHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        </SessionProvider>
    );
}
