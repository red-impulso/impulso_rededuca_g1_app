import { describe, expect, it } from "vitest";
import {
  CURVE_SEGMENTS,
  EDGES,
  RIBBON_1_LINES,
  RIBBON_2_LINES,
  buildSilhouettePaths,
  edgeX,
  maskImageUrl,
} from "./silhouette-paths";

const paths = buildSilhouettePaths();

// Puntos de paso [x, y] de un path: el M, cada L y el final de cada C
function points(d: string): [number, number][] {
  return [...d.matchAll(/(?:[ML]|C(?:-?[\d.]+ -?[\d.]+ ){2})(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
}

// Todos los números del path (puntos de paso y de control)
function numbers(d: string): number[] {
  return [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
}

// Tramos Bézier [p0, c1, c2, p1] de un path hecho con M y C
function curves(d: string): [number, number][][] {
  const n = numbers(d);
  const out: [number, number][][] = [];
  let last: [number, number] = [n[0], n[1]];
  for (let i = 2; i + 5 < n.length; i += 6) {
    const seg: [number, number][] = [last, [n[i], n[i + 1]], [n[i + 2], n[i + 3]], [n[i + 4], n[i + 5]]];
    out.push(seg);
    last = seg[3];
  }
  return out;
}

function bezier(seg: [number, number][], s: number): [number, number] {
  const k = [(1 - s) ** 3, 3 * (1 - s) ** 2 * s, 3 * (1 - s) * s ** 2, s ** 3];
  return [0, 1].map((j) => seg.reduce((sum, p, i) => sum + p[j] * k[i], 0)) as [number, number];
}

describe("silueta del login", () => {
  it("tiene 50 líneas en la cinta 1, 36 en la cinta 2 y 12 de puntitos", () => {
    expect(paths.ribbon1).toHaveLength(RIBBON_1_LINES);
    expect(paths.ribbon2).toHaveLength(RIBBON_2_LINES);
    expect(paths.dotted).toHaveLength(12);
  });

  it("las líneas de puntitos son las 2, 6, …, 46 de la cinta 1 (el dibujo las reutiliza)", () => {
    expect(paths.dottedIndexes).toEqual([2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46]);
    paths.dottedIndexes.forEach((k, i) => expect(paths.dotted[i]).toBe(paths.ribbon1[k]));
  });

  it("cada línea tiene 10 curvas (11 puntos de paso) y la primera empieza en y = -80", () => {
    const first = points(paths.ribbon1[0]);
    expect(paths.ribbon1[0].startsWith("M")).toBe(true);
    expect(first).toHaveLength(CURVE_SEGMENTS + 1);
    expect(first[0][1]).toBe(-80);
    expect(first.at(-1)?.[1]).toBe(1080);
    // La primera línea de la cinta 1 es el borde A
    expect(first[0][0]).toBeCloseTo(edgeX(EDGES.A, -80), 1);
  });

  it("las curvas siguen la fórmula exacta con menos de 0,2 unidades de error", () => {
    // Borde A (primera línea de la cinta 1) y borde D, en 5 puntos de cada tramo
    for (const [d, edge] of [
      [paths.ribbon1[0], EDGES.A],
      [paths.edgeD, EDGES.D],
    ] as const) {
      for (const seg of curves(d)) {
        for (const s of [0.1, 0.3, 0.5, 0.7, 0.9]) {
          const [x, y] = bezier(seg, s);
          expect(Math.abs(x - edgeX(edge, y))).toBeLessThan(0.2);
        }
      }
    }
  });

  it("todos los valores son números finitos con 1 decimal como máximo", () => {
    const all = [
      ...paths.ribbon1,
      ...paths.ribbon2,
      ...paths.dotted,
      paths.edgeA,
      paths.edgeD,
      paths.body,
      paths.lightCut,
      paths.lightMask,
      paths.darkMask,
    ];
    for (const d of all) {
      expect(d).not.toMatch(/NaN|Infinity/);
      for (const value of numbers(d)) {
        expect(Number.isFinite(value)).toBe(true);
        expect(String(value)).toMatch(/^-?\d+(\.\d)?$/);
      }
    }
  });

  it("el durazno (claro) queda a la derecha de B y D, y el verde (oscuro) a la izquierda de A", () => {
    const light = points(paths.lightCut);
    const dark = points(paths.darkMask).slice(0, 141);
    light.forEach(([x, y]) => {
      expect(x).toBeGreaterThanOrEqual(Math.max(edgeX(EDGES.B, y), edgeX(EDGES.D, y)) + 5.9);
      expect(x).toBeLessThan(400);
    });
    dark.forEach(([x, y]) => {
      expect(x).toBeLessThanOrEqual(edgeX(EDGES.A, y) - 19.9);
      expect(x).toBeGreaterThan(0);
    });
    expect(paths.lightMask).toMatch(/L400 1080 L400 -80 Z$/);
    expect(paths.darkMask).toMatch(/L0 1080 L0 -80 Z$/);
  });

  it("arma la máscara CSS como un SVG en data:", () => {
    const url = maskImageUrl(paths.lightMask);
    expect(url.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(decodeURIComponent(url)).toContain('preserveAspectRatio="none"');
  });
});
