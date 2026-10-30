import { createClient } from "@/lib/supabase/client";

// Next solo reemplaza las variables públicas si se escriben completas
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

// Institución de la membresía activa; la fija el SessionProvider al cargar /me
let activeInstitutionId: string | null = null;

export function setActiveInstitutionId(id: string | null) {
    activeInstitutionId = id;
}

// Saca un mensaje legible del cuerpo de error de la API
async function readErrorMessage(response: Response): Promise<string> {
    try {
        const body: unknown = await response.json();
        if (body && typeof body === "object" && "message" in body) {
            const { message } = body as { message: unknown };
            if (typeof message === "string" && message) return message;
            if (Array.isArray(message) && message.length) return message.join(". ");
        }
    } catch {
        // Cuerpo vacío o que no es JSON
    }
    return response.statusText || `Error ${response.status} de la API.`;
}

// Llama a la API de Back con la sesión de Supabase y la institución activa
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    if (!API_URL) {
        throw new Error(
            "Falta NEXT_PUBLIC_API_URL. Copiá .env.example a .env.local y completala.",
        );
    }

    const { data } = await createClient().auth.getSession();
    const headers = new Headers(init?.headers);
    if (data.session) {
        headers.set("Authorization", `Bearer ${data.session.access_token}`);
    }
    if (activeInstitutionId) {
        headers.set("X-Institution-Id", activeInstitutionId);
    }
    if (typeof init?.body === "string" && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
        response = await fetch(`${API_URL.replace(/\/$/, "")}${path}`, { ...init, headers });
    } catch {
        throw new ApiError(
            0,
            "No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo.",
        );
    }

    if (!response.ok) {
        throw new ApiError(response.status, await readErrorMessage(response));
    }
    // 204 Sin contenido
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}
