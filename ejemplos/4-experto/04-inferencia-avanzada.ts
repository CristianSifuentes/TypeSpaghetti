/**
 * Nivel 4 · Inferencia avanzada
 *
 * Inferir mucho a partir de poco: firmas que deducen tipos complejos de un objeto de configuración.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

// De unión a intersección: `infer` en posición contravariante produce una intersección.
type UnionAInterseccion<U> =
  (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

// Simplificar: que el editor muestre { a; b } en vez de A & B.
type Simplificar<T> = { [K in keyof T]: T[K] } & {};

type _Pruebas1 = [
  Afirmar<Igual<Simplificar<UnionAInterseccion<{ a: 1 } | { b: 2 }>>, { a: 1; b: 2 }>>,
];

// Una «tienda» que infiere el tipo de cada acción a partir de su implementación.
type Acciones<S> = Record<string, (estado: S, ...args: any[]) => S>;
type Despachadores<S, A extends Acciones<S>> = {
  [K in keyof A]: A[K] extends (estado: S, ...args: infer P) => S ? (...args: P) => void : never;
};

function crearTienda<S, A extends Acciones<S>>(inicial: S, acciones: A) {
  let estado = inicial;
  const despachar = {} as Despachadores<S, A>;
  for (const nombre of Object.keys(acciones) as (keyof A)[]) {
    despachar[nombre] = ((...args: unknown[]) => {
      estado = (acciones[nombre] as (s: S, ...a: unknown[]) => S)(estado, ...args);
    }) as Despachadores<S, A>[keyof A];
  }
  return { despachar, leer: (): S => estado };
}

const tienda = crearTienda(
  { cuenta: 0, historial: [] as string[] },
  {
    sumar: (s, n: number) => ({ cuenta: s.cuenta + n, historial: [...s.historial, `+${n}`] }),
    renombrar: (s, etiqueta: string, veces: number) => ({ ...s, historial: [...s.historial, etiqueta.repeat(veces)] }),
    reiniciar: () => ({ cuenta: 0, historial: [] as string[] }),
  },
);

type _Pruebas2 = [
  Afirmar<Igual<Parameters<typeof tienda.despachar.sumar>, [n: number]>>,
  Afirmar<Igual<Parameters<typeof tienda.despachar.renombrar>, [etiqueta: string, veces: number]>>,
];

function _noCompila(): void {
  // @ts-expect-error: sumar espera un número
  tienda.despachar.sumar('5');
}

tienda.despachar.sumar(5);
tienda.despachar.sumar(2);
tienda.despachar.renombrar('ok', 2);
console.log(tienda.leer().cuenta, tienda.leer().historial.join(' '));   // → 7 +5 +2 okok
tienda.despachar.reiniciar();
console.log(tienda.leer().cuenta);                                        // → 0
