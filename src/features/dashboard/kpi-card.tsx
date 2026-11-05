type KpiCardProps = {
    label: string;
    // Valor ya formateado ("1.847", "92,5%")
    value: string;
    // Aclaración debajo del valor, por ejemplo de qué período es
    hint?: string;
};

// Tarjeta de un número del tablero (M5-UX, figura 13), sin variación ni gráfico:
// Back todavía no manda período anterior ni serie.
export function KpiCard({ label, value, hint }: KpiCardProps) {
    return (
        <div className="min-w-0 rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
    );
}
