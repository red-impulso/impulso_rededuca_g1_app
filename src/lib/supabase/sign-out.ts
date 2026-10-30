import { createClient } from "./client";

// Cierra la sesión de Supabase; si falla igual dejamos que la pantalla limpie su estado
export async function signOut(): Promise<void> {
try {
    await createClient().auth.signOut();
} catch {
    // Sin conexión o sin configuración: no hay sesión remota que cerrar
}
}