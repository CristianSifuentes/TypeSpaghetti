/**
 * Nivel 1 · Arreglos y tuplas
 *
 * Un arreglo es una lista de longitud variable y elementos del mismo tipo.
 * Una tupla es una lista de longitud fija donde cada posición tiene su propio tipo.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

const lenguajes: string[] = ['TypeScript', 'JavaScript'];
const versiones: readonly number[] = [5.9, 6.0, 7.0];   // readonly: sin push ni sort in situ

function _noCompila(): void {
  // @ts-expect-error: un arreglo de solo lectura no tiene push
  versiones.push(7.1);
}

// Tuplas con nombre (4.0): el editor muestra `inicio` y `fin` en lugar de 0 y 1.
type Rango = [inicio: number, fin: number];
type Pixel = [x: number, y: number, color?: string];

const semana: Rango = [1, 7];
const punto: Pixel = [10, 20];

// Desestructurar respeta los tipos de cada posición.
const [x, y, color = 'negro'] = punto;
console.log(`(${x}, ${y}) en ${color}`);   // → (10, 20) en negro

// Con noUncheckedIndexedAccess, leer por índice admite que no haya nada.
const primero = lenguajes[0];
type _Pruebas = [Afirmar<Igual<typeof primero, string | undefined>>];
console.log(primero?.toUpperCase() ?? 'vacío');   // → TYPESCRIPT

// Copias inmutables (ES2023): no modifican el original.
const ordenadas = versiones.toSorted((a, b) => b - a);
console.log(ordenadas.join(' > '), '| original:', versiones.join(', '));   // → 7 > 6 > 5.9 | original: 5.9, 6, 7

console.log(`días: ${semana[1] - semana[0] + 1}`);   // → días: 7
