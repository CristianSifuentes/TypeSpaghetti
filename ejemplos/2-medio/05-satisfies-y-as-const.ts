/**
 * Nivel 2 · `satisfies` y `as const`
 *
 *   const x: T = v        comprueba v y convierte x en T (se pierden los detalles)
 *   const x = v as T      no comprueba casi nada: «confía en mí»
 *   const x = v satisfies T   comprueba v y conserva su tipo exacto  ← lo que casi siempre quieres
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

type Color = `#${string}` | [r: number, g: number, b: number];

// Con anotación: `tema.fondo` sería Color, y habría que estrechar para usarlo.
const temaAnotado: Record<string, Color> = { fondo: '#101820', texto: [242, 170, 76] };

// Con satisfies: se comprueba contra Record<…, Color> y se conservan las claves y los tipos concretos.
const tema = {
  fondo: '#101820',
  texto: [242, 170, 76],
  acento: '#3178c6',
} satisfies Record<string, Color>;

type _Pruebas = [
  Afirmar<Igual<keyof typeof tema, 'fondo' | 'texto' | 'acento'>>,
  Afirmar<Igual<keyof typeof temaAnotado, string>>,
];

function _noCompila(): void {
  const _mal = {
    // @ts-expect-error: 'rojo' no es un Color: satisfies sí lo detecta
    fondo: 'rojo',
  } satisfies Record<string, Color>;
}

// as const + satisfies: literales exactos, inmutables y validados.
const RUTAS = [
  { ruta: '/', publica: true },
  { ruta: '/panel', publica: false },
] as const satisfies readonly { ruta: `/${string}`; publica: boolean }[];

type Ruta = (typeof RUTAS)[number]['ruta'];
type _Ruta = Afirmar<Igual<Ruta, '/' | '/panel'>>;

console.log(tema.fondo.toUpperCase(), tema.texto[0]);                          // → #101820 242
console.log(RUTAS.filter((r) => r.publica).map((r) => r.ruta).join(','));     // → /
console.log(Object.keys(temaAnotado).length);                                  // → 2
