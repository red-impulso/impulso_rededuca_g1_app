// Cálculo de la silueta de líneas del login (función pura, con tests).
// Coordenadas de un viewBox "0 0 400 1000". Cada borde es una curva
// x(y) = 200 + off + a * sin(2π * (y + 80) / 1173 + ph), con y de -80 a 1080.
// Las líneas que se ven van con 10 curvas Bézier cada una (error < 0,05 unidades, menos
// que el redondeo a 1 decimal): con 140 tramos rectos el HTML de /ingresar pesaba ~170 KB.
// Los cortes de los fondos (lightCut y las máscaras) siguen con 140 tramos rectos,
// porque max(xB, xD) tiene quiebres que una curva suave no copia.

export const SILHOUETTE_VIEW_WIDTH = 400;
export const SILHOUETTE_VIEW_HEIGHT = 1000;

const Y_START = -80;
const Y_END = 1080;
const STEPS = 140;
const PERIOD = 1173;

export type Edge = { a: number; ph: number; off: number };

export const EDGES = {
  A: { a: 110, ph: 0, off: -10 },
  B: { a: 60, ph: 1.4, off: 70 },
  C: { a: 100, ph: 0.6, off: -30 },
  D: { a: 120, ph: 1.7, off: 30 },
} satisfies Record<string, Edge>;

export const RIBBON_1_LINES = 50; // entre A y B
export const RIBBON_2_LINES = 36; // entre C y D
// Líneas de puntitos: una de cada 4 de la cinta 1 (k = 2, 6, …, 46): 12 líneas
const DOTTED_EVERY = 4;
const DOTTED_FIRST = 2;

// Separación entre la silueta y los fondos de cada lado
const LIGHT_CUT_GAP = 6; // modo claro: el durazno empieza en max(xB, xD) + 6
const DARK_CUT_GAP = 20; // modo oscuro: el verde termina en xA - 20

// Los 141 valores de y (de -80 a 1080)
const YS = Array.from({ length: STEPS + 1 }, (_, i) => Y_START + ((Y_END - Y_START) * i) / STEPS);

// Tramos de cada línea visible: 10 curvas Bézier (11 valores de y)
export const CURVE_SEGMENTS = 10;
const CURVE_YS = Array.from(
  { length: CURVE_SEGMENTS + 1 },
  (_, i) => Y_START + ((Y_END - Y_START) * i) / CURVE_SEGMENTS,
);

export function edgeX(edge: Edge, y: number): number {
  return (
    SILHOUETTE_VIEW_WIDTH / 2 +
    edge.off +
    edge.a * Math.sin((2 * Math.PI * (y + 80)) / PERIOD + edge.ph)
  );
}

// Pendiente dx/dy del borde (para las curvas Bézier)
export function edgeSlope(edge: Edge, y: number): number {
  const w = (2 * Math.PI) / PERIOD;
  return edge.a * w * Math.cos(w * (y + 80) + edge.ph);
}

// Una línea entre dos bordes: x = x1 + (x2 - x1) * t (t = 0 es el borde "from")
function blendX(from: Edge, to: Edge, t: number, y: number): number {
  return edgeX(from, y) + (edgeX(to, y) - edgeX(from, y)) * t;
}

function blendSlope(from: Edge, to: Edge, t: number, y: number): number {
  return edgeSlope(from, y) + (edgeSlope(to, y) - edgeSlope(from, y)) * t;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function point(x: number, y: number): string {
  return `${round(x)} ${round(y)}`;
}

// Línea abierta que recorre todos los y con las x dadas
function linePath(xs: number[]): string {
  return xs.map((x, i) => `${i === 0 ? "M" : "L"}${point(x, YS[i])}`).join(" ");
}

// Línea suave que recorre los y dados (de arriba abajo o al revés) con curvas Bézier
// cúbicas: cada tramo usa el valor y la pendiente exactos en sus dos puntas (Hermite).
// "start" es "M" para empezar un path o "L" para seguir uno ya empezado.
function curvePath(from: Edge, to: Edge, t: number, ys: number[] = CURVE_YS, start = "M"): string {
  return ys
    .map((y, i) => {
      const x = blendX(from, to, t, y);
      if (i === 0) return `${start}${point(x, y)}`;
      const y0 = ys[i - 1];
      const h = y - y0;
      const x0 = blendX(from, to, t, y0);
      const c1 = point(x0 + (blendSlope(from, to, t, y0) * h) / 3, y0 + h / 3);
      const c2 = point(x - (blendSlope(from, to, t, y) * h) / 3, y - h / 3);
      return `C${c1} ${c2} ${point(x, y)}`;
    })
    .join(" ");
}

// Las n líneas de una cinta: t = k / n, con k de 0 a n - 1
function ribbonPaths(from: Edge, to: Edge, lines: number): string[] {
  return Array.from({ length: lines }, (_, k) => curvePath(from, to, k / lines));
}

function edgeXs(edge: Edge): number[] {
  return YS.map((y) => edgeX(edge, y));
}

export type SilhouettePaths = {
  ribbon1: string[];
  ribbon2: string[];
  dotted: string[];
  // Qué líneas de la cinta 1 llevan puntitos (el dibujo las reutiliza con <use>)
  dottedIndexes: number[];
  edgeA: string;
  edgeD: string;
  // Área cerrada entre A y B (brillo del cuerpo)
  body: string;
  // Modo claro: borde donde empieza el durazno y su área (cerrada hacia la derecha)
  lightCut: string;
  lightMask: string;
  // Modo oscuro: área del panel verde (cerrada hacia la izquierda)
  darkMask: string;
};

export function buildSilhouettePaths(): SilhouettePaths {
  const { A, B, C, D } = EDGES;
  const xsA = edgeXs(A);
  const xsB = edgeXs(B);
  const xsD = edgeXs(D);
  const ribbon1 = ribbonPaths(A, B, RIBBON_1_LINES);
  const ribbon2 = ribbonPaths(C, D, RIBBON_2_LINES);
  const dottedIndexes = ribbon1
    .map((_, k) => k)
    .filter((k) => k % DOTTED_EVERY === DOTTED_FIRST);

  const lightXs = xsB.map((xB, i) => Math.max(xB, xsD[i]) + LIGHT_CUT_GAP);
  const darkXs = xsA.map((xA) => xA - DARK_CUT_GAP);
  const top = round(Y_START);
  const bottom = round(Y_END);

  // Borde B de abajo hacia arriba, para cerrar el área del cuerpo
  const reversedB = curvePath(B, B, 0, [...CURVE_YS].reverse(), "L");

  return {
    ribbon1,
    ribbon2,
    dotted: dottedIndexes.map((k) => ribbon1[k]),
    dottedIndexes,
    edgeA: curvePath(A, A, 0),
    edgeD: curvePath(D, D, 0),
    body: `${curvePath(A, A, 0)} ${reversedB} Z`,
    lightCut: linePath(lightXs),
    lightMask: `${linePath(lightXs)} L${SILHOUETTE_VIEW_WIDTH} ${bottom} L${SILHOUETTE_VIEW_WIDTH} ${top} Z`,
    darkMask: `${linePath(darkXs)} L0 ${bottom} L0 ${top} Z`,
  };
}

// SVG para usar como máscara CSS (mask-image). Solo importa la forma: el color
// "black" no se ve, marca la parte visible.
export function maskImageUrl(d: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SILHOUETTE_VIEW_WIDTH} ${SILHOUETTE_VIEW_HEIGHT}" preserveAspectRatio="none"><path fill="black" d="${d}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
