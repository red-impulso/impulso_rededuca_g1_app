import { createBrowserClient } from "@supabase/ssr";

// Next solo reemplaza las variables públicas si se escriben completas (no con process.env[nombre])
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cliente de Supabase para componentes del navegador ("use client")
export function createClient() {
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copiá .env.example a .env.local y completalas.",
    );
}
return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}