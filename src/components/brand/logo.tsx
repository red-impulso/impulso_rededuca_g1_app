import Image from "next/image";

type LogoMarkProps = { size?: number; title?: string };

// Isotipo de RedEduca: usa el mismo archivo del ícono de la app (src/app/icon.svg),
// que Next sirve en /icon.svg. Así hay una sola versión del logo en el proyecto.
export function LogoMark({ size = 40, title }: LogoMarkProps) {
  return (
    <Image
      src="/icon.svg"
      width={size}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      unoptimized
      className="shrink-0"
    />
  );
}

// "dark": para fondos oscuros (panel de marca del login). "light": para fondos claros.
type WordmarkTone = "dark" | "light";

const WORDMARK_COLORS: Record<WordmarkTone, { red: string; educa: string }> = {
  dark: { red: "text-emerald-400", educa: "text-white" },
  light: { red: "text-brand", educa: "text-ink" },
};

// Texto "RedEduca" en una sola palabra: "Red" resaltado y "Educa" aparte
export function Wordmark({
  tone = "light",
  className = "",
}: {
  tone?: WordmarkTone;
  className?: string;
}) {
  const colors = WORDMARK_COLORS[tone];
  return (
    <span className={`font-bold ${className}`} style={{ letterSpacing: "-0.02em" }}>
      <span className={colors.red}>Red</span>
      <span className={colors.educa}>Educa</span>
    </span>
  );
}

// Logo horizontal completo: isotipo + texto
export function Logo({ size = 40, tone = "light" }: { size?: number; tone?: WordmarkTone }) {
  return (
    <span
      role="img"
      aria-label="RedEduca"
      className="inline-flex items-center"
      style={{ gap: size * 0.25 }}
    >
      <LogoMark size={size} />
      <span aria-hidden="true" style={{ fontSize: size * 0.68, lineHeight: 1 }}>
        <Wordmark tone={tone} />
      </span>
    </span>
  );
}
