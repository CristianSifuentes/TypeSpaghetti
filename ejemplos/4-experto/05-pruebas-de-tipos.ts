/**
 * Nivel 4 · Probar los tipos
 *
 * Los tipos también son código, y también se rompen. Dos herramientas sin dependencias:
 *   - `// @ts-expect-error` afirma que algo NO compila (y falla si un día compila).
 *   - `Igual<A, B>` + `Afirmar<…>` afirma que dos tipos son exactamente iguales.
 * Este repositorio entero se prueba así: `tsc` es el ejecutor de pruebas de los tipos.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

// La función bajo prueba: separa una lista por un predicado de tipo.
function particionar<T, S extends T>(lista: readonly T[], esS: (x: T) => x is S): [S[], Exclude<T, S>[]] {
  const si: S[] = [];
  const no: Exclude<T, S>[] = [];
  for (const x of lista) (esS(x) ? si.push(x) : no.push(x as Exclude<T, S>));
  return [si, no];
}

const mezcla = [1, 'dos', 3, 'cuatro', null] as const;
const [textos, resto] = particionar(mezcla, (x): x is 'dos' | 'cuatro' => typeof x === 'string');

// Igualdad exacta: `Igual` distingue lo que la asignabilidad no.
type _Pruebas = [
  Afirmar<Igual<typeof textos, ('dos' | 'cuatro')[]>>,
  Afirmar<Igual<typeof resto, (1 | 3 | null)[]>>,
  Afirmar<Igual<Igual<any, unknown>, false>>,             // any no es unknown
  Afirmar<Igual<Igual<{ a: 1 } & { b: 2 }, { a: 1; b: 2 }>, false>>,   // ni una intersección es su objeto aplanado
  Afirmar<Igual<Igual<1 | 2, 2 | 1>, true>>,              // el orden de una unión no importa
];

function _noCompila(): void {
  // @ts-expect-error: el predicado debe estrechar el tipo de los elementos
  particionar(mezcla, (x): x is boolean => typeof x === 'boolean');
}

console.log(textos.join(','), resto.join(','));   // → dos,cuatro 1,3,
console.log('5 afirmaciones de tipos comprobadas por tsc');   // → 5 afirmaciones de tipos comprobadas por tsc
