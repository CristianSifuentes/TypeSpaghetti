/**
 * Nivel 1 · Enums y sus alternativas
 *
 * Un `enum` genera un objeto en JavaScript. En 2026, Node ejecuta archivos .ts borrando los tipos,
 * y un enum no se puede borrar: por eso se suele preferir un objeto `as const` o una unión.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

// 1. enum con valores propios: sigue siendo válido, pero emite código.
enum CodigoHttp {
  Ok = 200,
  NoEncontrado = 404,
  Error = 500,
}

// 2. Unión de literales: no emite nada.
type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

// 3. Objeto `as const` + tipo derivado: valores en ejecución y tipo exacto, sin sintaxis especial.
const Estado = {
  Borrador: 'borrador',
  Publicado: 'publicado',
  Archivado: 'archivado',
} as const;
type Estado = (typeof Estado)[keyof typeof Estado];

type _Pruebas = [Afirmar<Igual<Estado, 'borrador' | 'publicado' | 'archivado'>>];

function describir(metodo: Metodo, estado: Estado, codigo: CodigoHttp): string {
  return `${metodo} → ${CodigoHttp[codigo]} (${codigo}) · ${estado}`;
}

console.log(describir('POST', Estado.Publicado, CodigoHttp.Ok));          // → POST → Ok (200) · publicado
console.log(describir('GET', 'archivado', CodigoHttp.NoEncontrado));      // → GET → NoEncontrado (404) · archivado

// Lo que cada opción deja en el JavaScript:
console.log(Object.keys(CodigoHttp).join(','));   // → 200,404,500,Ok,NoEncontrado,Error
console.log(Object.values(Estado).join(','));     // → borrador,publicado,archivado
