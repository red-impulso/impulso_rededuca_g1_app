import { isAuthApiError, isAuthRetryableFetchError } from "@supabase/supabase-js";

export const AUTH_ERROR_MESSAGES = {
    invalidCredentials: "Correo o contraseña incorrectos.",
    emailNotConfirmed: "Tenés que confirmar tu correo antes de ingresar.",
    tooManyRequests: "Demasiados intentos. Esperá un momento y probá de nuevo.",
    network: "No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo.",
    unknown: "No pudimos iniciar sesión. Probá de nuevo en unos minutos.",
} as const;

// Traduce un error de Supabase Auth a un mensaje visible para el usuario
export function getAuthErrorMessage(error: unknown): string {
if (isAuthRetryableFetchError(error)) return AUTH_ERROR_MESSAGES.network;

if (isAuthApiError(error)) {
    switch (error.code) {
    case "invalid_credentials":
    case "user_not_found":
        return AUTH_ERROR_MESSAGES.invalidCredentials;
    case "email_not_confirmed":
        return AUTH_ERROR_MESSAGES.emailNotConfirmed;
    case "over_request_rate_limit":
        return AUTH_ERROR_MESSAGES.tooManyRequests;
    default:
        // En desarrollo agregamos el detalle técnico para poder diagnosticar
        return process.env.NODE_ENV === "development"
            ? `${AUTH_ERROR_MESSAGES.unknown} (${error.status} ${error.code ?? "sin código"}: ${error.message})`
            : AUTH_ERROR_MESSAGES.unknown;
    }
}

  // Error local, por ejemplo variables de entorno faltantes
if (error instanceof Error && error.message) return error.message;
return AUTH_ERROR_MESSAGES.unknown;
}