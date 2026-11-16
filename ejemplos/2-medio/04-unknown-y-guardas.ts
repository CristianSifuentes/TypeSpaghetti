/**
 * Nivel 2 · `unknown`, guardas de tipo y funciones de aserción
 *
 * Todo lo que llega de fuera (JSON, formularios, variables de entorno) es `unknown` hasta que se
 * demuestra lo contrario. Las guardas lo demuestran en ejecución y estrechan en compilación.
 */

interface Producto {
  sku: string;
  precio: number;
  etiquetas: string[];
}

// Guarda de tipo: devuelve boolean y estrecha en el `if`.
function esProducto(x: unknown): x is Producto {
  return (
    typeof x === 'object' && x !== null &&
    'sku' in x && typeof x.sku === 'string' &&
    'precio' in x && typeof x.precio === 'number' &&
    'etiquetas' in x && Array.isArray(x.etiquetas) && x.etiquetas.every((e) => typeof e === 'string')
  );
}

// Función de aserción (3.7): lanza si no se cumple; si vuelve, el tipo queda demostrado.
function afirmarProducto(x: unknown): asserts x is Producto {
  if (!esProducto(x)) throw new TypeError(`no es un producto: ${JSON.stringify(x)}`);
}

// `catch` recibe `unknown` (useUnknownInCatchVariables, dentro de strict).
function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const entradas: unknown[] = [
  JSON.parse('{"sku":"TS-7","precio":0,"etiquetas":["nativo","go"]}'),
  JSON.parse('{"sku":"TS-6","precio":"gratis"}'),
];

for (const entrada of entradas) {
  if (esProducto(entrada)) {
    console.log(`${entrada.sku}: ${entrada.precio} € [${entrada.etiquetas.join(', ')}]`);
  } else {
    console.log('entrada inválida');
  }
}
// → TS-7: 0 € [nativo, go]
// → entrada inválida

try {
  afirmarProducto(entradas[1]);
} catch (e) {
  console.log(mensajeDe(e));   // → no es un producto: {"sku":"TS-6","precio":"gratis"}
}

const primero: unknown = entradas[0];
afirmarProducto(primero);
console.log(primero.etiquetas.length);   // → 2
