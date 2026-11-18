import { isAuthApiError, isAuthRetryableFetchError } from "@supabase/supabase-js";

import { AUTH_ERROR_MESSAGES } from "./auth-error-messages";

export { AUTH_ERROR_MESSAGES };

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