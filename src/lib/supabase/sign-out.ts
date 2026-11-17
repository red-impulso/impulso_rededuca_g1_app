import { createClient } from "./client";

// Cierra la sesión de Supabase. Si el servidor no responde, igual se borra la sesión de este
// navegador (scope "local"): si quedara la cookie, /ingresar redirigiría al panel otra vez.
export async function signOut(): Promise<void> {
    try {
        const auth = createClient().auth;
        try {
            const { error } = await auth.signOut();
            if (error) await auth.signOut({ scope: "local" });
        } catch {
            await auth.signOut({ scope: "local" });
        }
    } catch {
        // Sin configuración de Supabase: no hay sesión que cerrar
    }
}

// Recarga completa a /ingresar: borra cualquier estado que haya quedado en memoria
// (Cache Components conserva el estado de las pantallas ya visitadas)
export function reloadToLogin(): void {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- recarga completa a propósito: Cache Components conserva el estado de pantallas ya visitadas
    window.location.assign("/ingresar");
}
