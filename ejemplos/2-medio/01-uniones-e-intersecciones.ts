/**
 * Nivel 2 · Uniones e intersecciones
 *
 * Piensa en los tipos como conjuntos de valores:
 *   A | B  →  los valores de A más los de B   (unión: «uno u otro»)
 *   A & B  →  los valores que son A y B a la vez (intersección: «todo junto»)
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

type Id = string | number;

interface ConMarcaDeTiempo { creado: Date }
interface ConAutor { autor: string }
type Comentario = { texto: string } & ConMarcaDeTiempo & ConAutor;

const comentario: Comentario = { texto: 'Gran guía', creado: new Date('2026-11-16'), autor: 'Ada' };

// Con una unión, solo puedes usar lo que tienen todos sus miembros… hasta que estrechas.
function formatearId(id: Id): string {
  return typeof id === 'number' ? `#${id.toString().padStart(4, '0')}` : id.toUpperCase();
}

// Conjuntos imposibles: la intersección de dos primitivos distintos no tiene valores.
type Imposible = string & number;
// keyof de una unión: solo las claves comunes. De una intersección: todas.
type ClavesUnion = keyof ({ a: 1; b: 2 } | { a: 3; c: 4 });
type ClavesInterseccion = keyof ({ a: 1 } & { b: 2 });

type _Pruebas = [
  Afirmar<Igual<Imposible, never>>,
  Afirmar<Igual<ClavesUnion, 'a'>>,
  Afirmar<Igual<ClavesInterseccion, 'a' | 'b'>>,
];

console.log(formatearId(42), formatearId('abc-7'));                     // → #0042 ABC-7
console.log(`${comentario.autor}: «${comentario.texto}» (${comentario.creado.getUTCFullYear()})`);
// → Ada: «Gran guía» (2026)
