/**
 * Nivel 4 · Tipos recursivos
 *
 * Un tipo puede referirse a sí mismo: estructuras anidadas (JSON, árboles) y transformaciones
 * «profundas». Con recursión de cola (4.5), el límite sube de ~50 a 999 niveles.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

// JSON completo: el ejemplo clásico, ahora con arreglos (que faltaban en la primera edición).
type Json = string | number | boolean | null | Json[] | { [clave: string]: Json };

// Transformaciones profundas.
type SoloLecturaProfunda<T> =
  T extends (...args: never[]) => unknown ? T
  : T extends object ? { readonly [K in keyof T]: SoloLecturaProfunda<T[K]> }
  : T;

// Rutas de un objeto como cadenas: "servidor" | "servidor.puerto" | …
type Rutas<T> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? K | `${K}.${Rutas<T[K]>}` : K }[keyof T & string]
  : never;

// Recursión de cola con acumulador: invertir una tupla.
type Invertir<T extends readonly unknown[], Acc extends unknown[] = []> =
  T extends readonly [infer P, ...infer R] ? Invertir<R, [P, ...Acc]> : Acc;

const config = {
  servidor: { puerto: 8080, tls: { activo: true } },
  registro: { nivel: 'info' },
};

type _Pruebas = [
  Afirmar<Igual<Rutas<typeof config>, 'servidor' | 'servidor.puerto' | 'servidor.tls' | 'servidor.tls.activo' | 'registro' | 'registro.nivel'>>,
  Afirmar<Igual<Invertir<[1, 2, 3]>, [3, 2, 1]>>,
];

function profundidad(valor: Json): number {
  if (valor === null || typeof valor !== 'object') return 0;
  const hijos = Array.isArray(valor) ? valor : Object.values(valor);
  return 1 + Math.max(0, ...hijos.map(profundidad));
}

function congelar<T>(valor: T): SoloLecturaProfunda<T> {
  if (valor && typeof valor === 'object') {
    for (const hijo of Object.values(valor)) congelar(hijo);
    Object.freeze(valor);
  }
  return valor as SoloLecturaProfunda<T>;
}

const congelada = congelar(config);
function _noCompila(): void {
  // @ts-expect-error: de solo lectura en todos los niveles
  congelada.servidor.tls.activo = false;
}

const documento: Json = { nombre: 'atlas', capitulos: [{ n: 1, temas: ['versiones'] }] };
console.log(profundidad(documento));                        // → 4
console.log(Object.isFrozen(congelada.servidor.tls));      // → true
