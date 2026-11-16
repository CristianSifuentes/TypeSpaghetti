/**
 * Nivel 3 · Tipos condicionales e `infer`
 *
 * `A extends B ? X : Y` pregunta «¿A es un subconjunto de B?». `infer` captura una parte del tipo
 * cuando el patrón encaja. Sobre uniones, el condicional se reparte miembro a miembro.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

type EsTexto<T> = T extends string ? true : false;

// infer: desestructurar tipos.
type Elemento<T> = T extends readonly (infer E)[] ? E : T;
type Desenvolver<T> = T extends Promise<infer V> ? Desenvolver<V> : T;
type PrimerArgumento<F> = F extends (primero: infer A, ...resto: never[]) => unknown ? A : never;

// infer con restricción (4.7) y en plantillas con números (4.8).
type ANumero<S> = S extends `${infer N extends number}` ? N : never;

// Distributividad: se aplica a cada miembro. Envolver en [] la desactiva.
type ALista<T> = T extends unknown ? T[] : never;
type AListaJunta<T> = [T] extends [unknown] ? T[] : never;

// Filtrar uniones: así están hechos Exclude y Extract.
type SinNulos<T> = T extends null | undefined ? never : T;

async function cargarUsuario(id: number) {
  return { id, nombre: 'Ada' };
}

type _Pruebas = [
  Afirmar<Igual<EsTexto<'a' | 1>, boolean>>,                      // true | false
  Afirmar<Igual<Elemento<string[]>, string>>,
  Afirmar<Igual<Desenvolver<Promise<Promise<number>>>, number>>,
  Afirmar<Igual<PrimerArgumento<typeof cargarUsuario>, number>>,
  Afirmar<Igual<Awaited<ReturnType<typeof cargarUsuario>>, { id: number; nombre: string }>>,
  Afirmar<Igual<ANumero<'42'>, 42>>,
  Afirmar<Igual<ALista<string | number>, string[] | number[]>>,
  Afirmar<Igual<AListaJunta<string | number>, (string | number)[]>>,
  Afirmar<Igual<SinNulos<string | null | undefined>, string>>,
];

const usuario = await cargarUsuario(7);
console.log(`${usuario.nombre} (${usuario.id})`);   // → Ada (7)
console.log('todas las pruebas de tipos se comprobaron al compilar');   // → todas las pruebas de tipos se comprobaron al compilar
