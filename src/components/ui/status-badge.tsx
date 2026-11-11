type Tone = "success" | "neutral" | "warning";

const TONE_STYLES: Record<Tone, string> = {
    success: "bg-[#E6F4F2] text-[#0B6B64]",
    neutral: "bg-[#F1F5F9] text-[#475569]",
    warning: "bg-warning-bg text-warning",
};

// Ícono + texto: el estado no se comunica solo con color
function ToneIcon({ tone }: { tone: Tone }) {
    if (tone === "success") {
        return <path d="M4 8.5 7 11.5 12 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
    }
    if (tone === "warning") {
        return (
            <>
                <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 5v3.2l2 1.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </>
        );
    }
    return <path d="M4.5 8h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
}

// Badge de estado (SDD: Activo verde, Inactivo gris azulado, Borrador amarillo)
export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONE_STYLES[tone]}`}>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5">
                <ToneIcon tone={tone} />
            </svg>
            {label}
        </span>
    );
}
