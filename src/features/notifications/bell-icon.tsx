// Ícono de campanita en SVG propio (el proyecto no usa librería de íconos).
// Toma el color del texto (currentColor). Es decorativo: el nombre lo da el enlace.
export function BellIcon({ className = "h-6 w-6" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className={className}
        >
            <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9Z" />
            <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
        </svg>
    );
}
