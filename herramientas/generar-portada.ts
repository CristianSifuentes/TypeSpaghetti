/**
 * Genera assets/portada.svg: dieciocho hebras enredadas a la izquierda que se desenredan, de
 * izquierda a derecha, en los seis carriles de los niveles de la guía.
 *
 * Determinista (generador pseudoaleatorio con semilla fija) y sin dependencias:
 *     node herramientas/generar-portada.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

type Punto = readonly [x: number, y: number];

const ANCHO = 1600;
const ALTO = 560;
const NIVELES = [
  { nombre: 'básico', color: '#4c9aff' },
  { nombre: 'medio', color: '#2fc28b' },
  { nombre: 'avanzado', color: '#f0743c' },
  { nombre: 'experto', color: '#8b7bf0' },
  { nombre: 'arquitectura', color: '#e8a317' },
  { nombre: 'arte', color: '#e86aa8' },
] as const;

/** Mulberry32: suficiente para que el dibujo sea siempre el mismo. */
function generador(semilla: number): () => number {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Curva suave que pasa por todos los puntos (Catmull-Rom convertida a Bézier cúbicas). */
function trazo(puntos: readonly Punto[]): string {
  const f = (n: number): string => n.toFixed(1);
  let d = `M${f(puntos[0]![0])},${f(puntos[0]![1])}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i]!;
    const p1 = puntos[i]!;
    const p2 = puntos[i + 1]!;
    const p3 = puntos[i + 2] ?? p2;
    const c1: Punto = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Punto = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

function generar(): string {
  const azar = generador(2026);
  const carril = (i: number): number => 250 + i * 46;
  const hebras: string[] = [];

  NIVELES.forEach((nivel, i) => {
    for (let h = 0; h < 3; h++) {
      const enredo: Punto[] = Array.from({ length: 6 }, (_, k) => [70 + k * 95 + azar() * 70, 70 + azar() * 430]);
      const y = carril(i) + (h - 1) * 5;
      const puntos: Punto[] = [[-20, 60 + azar() * 440], ...enredo, [760, y + (azar() - 0.5) * 30], [940, y], [ANCHO + 20, y]];
      const grosor = (2.2 + azar() * 1.6).toFixed(2);
      hebras.push(`<path d="${trazo(puntos)}" stroke="${nivel.color}" stroke-width="${grosor}" stroke-opacity="${h === 1 ? 0.95 : 0.55}" fill="none" stroke-linecap="round"/>`);
    }
  });

  const etiquetas = NIVELES.map((n, i) =>
    `<g transform="translate(1000 ${carril(i)})"><rect x="-17" y="-15" width="${44 + n.nombre.length * 9.6}" height="30" rx="15" fill="#0b1426" fill-opacity="0.92" stroke="${n.color}" stroke-opacity="0.45"/><circle r="11" fill="${n.color}"/><text x="0" y="4.5" text-anchor="middle" font-size="13" font-weight="700" fill="#0b1020">${i + 1}</text>` +
    `<text x="22" y="5" font-size="17" fill="#e6edf7">${n.nombre}</text></g>`).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${ALTO}" width="${ANCHO}" height="${ALTO}" role="img" aria-labelledby="t d" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
<title id="t">TypeSpaghetti · edición 2026</title>
<desc id="d">Dieciocho hebras de colores se enredan a la izquierda y se desenredan hacia la derecha en seis carriles paralelos: básico, medio, avanzado, experto, arquitectura y arte, los seis niveles de la guía.</desc>
<defs>
  <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#070b16"/><stop offset="0.6" stop-color="#0d1a33"/><stop offset="1" stop-color="#143066"/></linearGradient>
  <radialGradient id="halo" cx="0.22" cy="0.5" r="0.45"><stop offset="0" stop-color="#3178c6" stop-opacity="0.35"/><stop offset="1" stop-color="#3178c6" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${ANCHO}" height="${ALTO}" rx="22" fill="url(#fondo)"/>
<rect width="${ANCHO}" height="${ALTO}" rx="22" fill="url(#halo)"/>
<g>
${hebras.join('\n')}
</g>
<text x="1000" y="112" font-size="64" font-weight="800" fill="#ffffff" letter-spacing="-1">Type<tspan fill="#4c9aff">Spaghetti</tspan></text>
<text x="1002" y="154" font-size="21" fill="#b9c6dc">Desenreda el sistema de tipos, nivel a nivel</text>
<text x="1002" y="186" font-size="15" fill="#7f90ad">Edición 2026 · TypeScript 7 · 35 ejemplos ejecutables y verificados</text>
${etiquetas}
</svg>
`;
}

const destino = fileURLToPath(new URL('../assets/portada.svg', import.meta.url));
mkdirSync(fileURLToPath(new URL('../assets/', import.meta.url)), { recursive: true });
writeFileSync(destino, generar());
console.log(`→ ${destino}`);
