// Silueta de líneas del login (/ingresar), solo en escritorio: una "cinta de malla"
// en S sobre el corte entre el panel verde y el lado durazno. Componente de servidor.
// El ancho (--login-silhouette-w en globals.css) se achica con la pantalla para no
// tapar el formulario. La silueta y las máscaras de los fondos usan el mismo viewBox
// y preserveAspectRatio="none": se estiran juntas con el alto y nunca se separan.
import type { CSSProperties } from "react";
import {
  SILHOUETTE_VIEW_HEIGHT,
  SILHOUETTE_VIEW_WIDTH,
  buildSilhouettePaths,
  maskImageUrl,
} from "./silhouette-paths";

// Se calcula una sola vez (no depende de nada de la pantalla)
const PATHS = buildSilhouettePaths();
const WIDTH = "var(--login-silhouette-w)";
// Borde izquierdo de la franja de la silueta: centrada sobre el corte (50 %)
const STRIP_LEFT = "left-[calc(50%-var(--login-silhouette-w)/2)]";
const STRIP_RIGHT = "right-[calc(50%-var(--login-silhouette-w)/2)]";

// Modo claro: el durazno ocupa desde la silueta hasta la derecha.
// Máscara: la curva dentro de la franja + un rectángulo para el resto.
const LIGHT_SIDE_MASK: CSSProperties = {
  maskImage: `${maskImageUrl(PATHS.lightMask)}, linear-gradient(black, black)`,
  maskSize: `${WIDTH} 100%, calc(100% - ${WIDTH} + 1px) 100%`,
  maskPosition: "left top, right top",
  maskRepeat: "no-repeat",
};

// Modo oscuro: el panel verde ocupa desde la izquierda hasta la silueta.
const DARK_PANEL_MASK: CSSProperties = {
  maskImage: `linear-gradient(black, black), ${maskImageUrl(PATHS.darkMask)}`,
  maskSize: `calc(100% - ${WIDTH} + 1px) 100%, ${WIDTH} 100%`,
  maskPosition: "left top, right top",
  maskRepeat: "no-repeat",
};

const LINE = { fill: "none", vectorEffect: "non-scaling-stroke" } as const;
// Región de los filtros más grande que los trazos, para que el blur no se corte
const FILTER_REGION = { filterUnits: "userSpaceOnUse", x: -100, y: -200, width: 600, height: 1400 } as const;

function LoginSilhouette() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${SILHOUETTE_VIEW_WIDTH} ${SILHOUETTE_VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      className={`absolute inset-y-0 h-full w-(--login-silhouette-w) overflow-visible ${STRIP_LEFT}`}
    >
      <defs>
        <filter id="silueta-blur-cuerpo" {...FILTER_REGION}>
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="silueta-blur-borde" {...FILTER_REGION}>
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="silueta-blur-leve" {...FILTER_REGION}>
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        {/* Degradés verticales: celeste arriba, verde agua al medio y verde abajo */}
        <linearGradient id="silueta-cinta-1" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={SILHOUETTE_VIEW_HEIGHT}>
          <stop offset="0" style={{ stopColor: "var(--sky-400)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--aqua-glow)" }} />
          <stop offset="1" style={{ stopColor: "var(--green-400)" }} />
        </linearGradient>
        <linearGradient id="silueta-cinta-2" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={SILHOUETTE_VIEW_HEIGHT}>
          <stop offset="0" style={{ stopColor: "var(--blue-500)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--cyan-400)" }} />
          <stop offset="1" style={{ stopColor: "var(--aqua-glow)" }} />
        </linearGradient>
      </defs>

      {/* Solo en claro: línea suave sobre el borde del durazno, para que el corte no se vea recto */}
      <path
        {...LINE}
        d={PATHS.lightCut}
        className="dark:hidden"
        style={{ stroke: "var(--mint-50)" }}
        strokeWidth={22}
        opacity={0.9}
        filter="url(#silueta-blur-borde)"
      />

      {/* Brillo del cuerpo (entre A y B) */}
      <path
        d={PATHS.body}
        style={{ fill: "var(--cyan-400)" }}
        opacity={0.22}
        filter="url(#silueta-blur-cuerpo)"
      />

      {/* Brillo de los bordes */}
      <g {...LINE} strokeWidth={10} opacity={0.7} filter="url(#silueta-blur-borde)">
        <path vectorEffect="non-scaling-stroke" d={PATHS.edgeA} style={{ stroke: "var(--aqua-glow)" }} />
        <path vectorEffect="non-scaling-stroke" d={PATHS.edgeD} style={{ stroke: "var(--sky-400)" }} />
      </g>

      {/* Cinta 2 (atrás) */}
      <g {...LINE} stroke="url(#silueta-cinta-2)" strokeWidth={0.9} opacity={0.35}>
        {PATHS.ribbon2.map((d) => (
          <path key={d} vectorEffect="non-scaling-stroke" d={d} />
        ))}
      </g>

      {/* Cinta 1 */}
      <g {...LINE} stroke="url(#silueta-cinta-1)" strokeWidth={0.8} opacity={0.45}>
        {PATHS.ribbon1.map((d, k) => (
          <path key={d} id={`silueta-c1-${k}`} vectorEffect="non-scaling-stroke" d={d} />
        ))}
      </g>

      {/* Líneas de puntitos */}
      <g
        {...LINE}
        stroke="url(#silueta-cinta-1)"
        strokeWidth={1.6}
        strokeDasharray="0.1 6"
        strokeLinecap="round"
        opacity={0.9}
      >
        {/* Son líneas de la cinta 1: se reutilizan con <use> en vez de repetir el trazo.
            El <use> no copia los atributos del <g> de la cinta 1: toma los de este grupo. */}
        {PATHS.dottedIndexes.map((k) => (
          <use key={k} href={`#silueta-c1-${k}`} />
        ))}
      </g>

      {/* Bordes nítidos */}
      <g {...LINE} filter="url(#silueta-blur-leve)">
        <path vectorEffect="non-scaling-stroke" d={PATHS.edgeA} style={{ stroke: "var(--mint-200)" }} strokeWidth={2.4} />
        <path vectorEffect="non-scaling-stroke" d={PATHS.edgeD} style={{ stroke: "var(--sky-300)" }} strokeWidth={1.8} opacity={0.8} />
      </g>
    </svg>
  );
}

// Fondos del login en escritorio y la silueta encima. Va dentro del <main> (relative),
// antes de las columnas: el panel de marca y el formulario quedan por encima.
// En celular no se muestra: queda el fondo durazno (bg-login) del <main>.
export function LoginBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      {/* Modo claro: verde de fondo y el durazno encima, recortado por la silueta */}
      <div className="absolute inset-0 bg-linear-to-br from-brand-dark to-brand dark:hidden" />
      <div className={`absolute inset-y-0 right-0 bg-login dark:hidden ${STRIP_LEFT}`} style={LIGHT_SIDE_MASK} />

      {/* Modo oscuro: el fondo oscuro del <main> y el panel verde recortado por la silueta.
          Termina en petróleo: el --brand oscuro es claro y el texto blanco no llegaría a AA */}
      <div
        className={`absolute inset-y-0 left-0 hidden bg-linear-to-br from-brand-dark to-petroleum-500 dark:block ${STRIP_RIGHT}`}
        style={DARK_PANEL_MASK}
      />

      <LoginSilhouette />
    </div>
  );
}
