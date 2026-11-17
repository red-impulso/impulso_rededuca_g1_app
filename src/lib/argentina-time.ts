// Fechas con el calendario de Argentina, sin depender del huso horario del navegador.

export const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

// "8 nov 2026" en hora de Argentina
export const argentinaShortDateFormat = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: ARGENTINA_TIME_ZONE,
});

// Número de día en Argentina: la resta de dos da cuántos días de calendario hay entre ellas
export function argentinaDayNumber(date: Date): number {
    return Math.round(Date.parse(`${dayKeyFormat.format(date)}T00:00:00Z`) / 86_400_000);
}
