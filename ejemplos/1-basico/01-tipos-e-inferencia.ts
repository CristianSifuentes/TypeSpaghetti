/**
 * Nivel 1 · Tipos e inferencia
 *
 * TypeScript no te obliga a anotarlo todo: infiere. Anota en los bordes (parámetros, retornos
 * públicos) y deja que la inferencia haga el resto.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

// Inferencia: `let` se ensancha al primitivo; `const` conserva el literal.
let titulo = 'TypeSpaghetti';
const edicion = 2026;
const activo = true;

titulo = 'TypeSpaghetti 2026';

// Lo que NO compila va en funciones que nunca se llaman: los tipos se borran, el código no.
function _noCompila(): void {
  // @ts-expect-error: un string no acepta un número
  titulo = 2026;
}

type _Pruebas = [
  Afirmar<Igual<typeof titulo, string>>,
  Afirmar<Igual<typeof edicion, 2026>>,   // el literal, no `number`
  Afirmar<Igual<typeof activo, true>>,
];

// Los primitivos de JavaScript, todos con su tipo.
const primitivos: [string, number, bigint, boolean, symbol, null, undefined] = [
  'texto', 42, 9007199254740993n, false, Symbol('id'), null, undefined,
];
console.log(primitivos.map((p) => (p === null ? 'null' : typeof p)).join(' · '));
// → string · number · bigint · boolean · symbol · null · undefined

// `any` apaga el comprobador; `unknown` lo obliga a trabajar.
const deLaRed: unknown = JSON.parse('{"version": 7}');
function _tampoco(): void {
  // @ts-expect-error: con `unknown` hay que comprobar antes de usar
  deLaRed.version;
}

if (typeof deLaRed === 'object' && deLaRed !== null && 'version' in deLaRed) {
  console.log(`versión ${String(deLaRed.version)}`);   // → versión 7
}

console.log(`${titulo}: ${edicion}, activo=${activo}`);   // → TypeSpaghetti 2026: 2026, activo=true
