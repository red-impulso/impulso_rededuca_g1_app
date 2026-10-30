import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que se pueden ver sin sesión
const PUBLIC_PATHS = ["/ingresar"];

function isPublicPath(pathname: string) {
return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
);
}

// Corre antes de cada página: renueva la sesión de Supabase y
// manda a /ingresar a quien no esté autenticado
export async function proxy(request: NextRequest) {
let response = NextResponse.next({ request });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin configuración de Supabase nadie puede tener sesión: solo rutas públicas
if (!supabaseUrl || !supabaseAnonKey) {
    return isPublicPath(request.nextUrl.pathname)
    ? response
    : NextResponse.redirect(new URL("/ingresar", request.url));
}

const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
    getAll() {
        return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options),
        );
    },
    },
});

  // getClaims verifica el token; no usar getSession acá porque no lo valida
const { data } = await supabase.auth.getClaims();

const isAuthenticated = Boolean(data?.claims);

if (!isAuthenticated && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = new URL("/ingresar", request.url);
    return NextResponse.redirect(loginUrl);
}

return response;
}

export const config = {
  // Todo salvo archivos internos de Next, imágenes, íconos y el manifiesto (el navegador
    // lo pide sin sesión, en /ingresar, para poder instalar la app)
    matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|icon.png|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
],
};