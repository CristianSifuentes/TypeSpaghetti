/**
 * Pruebas de tipos: afirmaciones que se comprueban al compilar y no existen al ejecutar.
 *
 *   type _ = Afirmar<Igual<typeof valor, "esperado">>;   // si no son iguales, `tsc` falla
 *
 * `Igual` compara de forma exacta (no basta con que uno sea asignable al otro): es el truco de
 * las funciones genéricas que solo son idénticas si sus parámetros de tipo lo son.
 */
export type Igual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

/** Falla en compilación si `T` no es exactamente `true`. */
export type Afirmar<T extends true> = T;
