/**
 * Nivel 6 · Mensajes de error propios
 *
 * Cuando una firma compleja falla, el mensaje del compilador puede ocupar una pantalla. Un truco de
 * artesano: hacer que el tipo esperado SEA el mensaje, para que el error diga en castellano qué falta.
 *
 * Dos técnicas, según lo que se valide:
 *   - Literales de cadena → el mensaje SUSTITUYE al tipo cuando la condición falla.
 *   - Objetos y tuplas    → el mensaje se INTERSECA con el tipo cuando la condición falla.
 * (Intersecar con una cadena no sirve: "dos palabras" & "⛔ …" son dos literales distintos y su
 * intersección es `never`, así que el mensaje desaparece del error.)
 */

// ───── 1. Cadenas: el mensaje sustituye al tipo ─────
type EtiquetaValida<S extends string> =
  S extends '' ? '⛔ la etiqueta no puede estar vacía'
  : S extends `${string} ${string}` ? '⛔ la etiqueta no puede tener espacios'
  : S;

function definirEtiqueta<const S extends string>(nombre: EtiquetaValida<S>): `#${S}` {
  return `#${nombre}` as `#${S}`;
}

// ───── 2. Tuplas y objetos: el mensaje se interseca ─────
type Exigir<Condicion extends boolean, Mensaje extends string> = Condicion extends true ? unknown : Mensaje;
type Longitud<T extends readonly unknown[]> = T['length'];

function emparejar<const A extends readonly unknown[], const B extends readonly unknown[]>(
  a: A,
  b: B & Exigir<Longitud<A> extends Longitud<B> ? true : false, `⛔ se esperaban ${Longitud<A>} elementos`>,
): [A[number], B[number]][] {
  return a.map((x, i) => [x, (b as readonly B[number][])[i] as B[number]]);
}

function _noCompila(): void {
  // error TS2345: Argument of type '""' is not assignable to parameter of type '"⛔ la etiqueta no puede estar vacía"'.
  // @ts-expect-error
  definirEtiqueta('');
  // error TS2345: … to parameter of type '"⛔ la etiqueta no puede tener espacios"'.
  // @ts-expect-error
  definirEtiqueta('dos palabras');
  // error TS2345: … to parameter of type 'readonly [1, 2] & "⛔ se esperaban 3 elementos"'.
  // @ts-expect-error
  emparejar(['a', 'b', 'c'], [1, 2]);
}

const etiqueta = definirEtiqueta('typescript');   // el tipo es `#typescript`: la inferencia sigue funcionando
console.log(etiqueta, definirEtiqueta('arte-2026'));                          // → #typescript #arte-2026
console.log(JSON.stringify(emparejar(['es', 'mx'], ['España', 'México'])));  // → [["es","España"],["mx","México"]]
