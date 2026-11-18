// Textos de los errores de ingreso. Van en un archivo aparte, sin Supabase, para que
// /ingresar pueda mostrarlos aunque no haya podido descargar el código de Supabase.
export const AUTH_ERROR_MESSAGES = {
    invalidCredentials: "Correo o contraseña incorrectos.",
    emailNotConfirmed: "Tenés que confirmar tu correo antes de ingresar.",
    tooManyRequests: "Demasiados intentos. Esperá un momento y probá de nuevo.",
    network: "No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo.",
    unknown: "No pudimos iniciar sesión. Probá de nuevo en unos minutos.",
} as const;
