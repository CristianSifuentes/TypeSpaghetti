/**
 * Nivel 1 · Funciones
 *
 * Anota los parámetros siempre; el retorno, cuando la función se exporta o cuando quieres que el
 * compilador te avise si el cuerpo devuelve algo distinto de lo que prometiste.
 */

function sumar(a: number, b: number): number {
  return a + b;
}

// Opcionales, valores por defecto y parámetros rest.
function saludar(nombre: string, saludo = 'Hola', ...titulos: string[]): string {
  const prefijo = titulos.length ? `${titulos.join(' ')} ` : '';
  return `${saludo}, ${prefijo}${nombre}`;
}

// Tipo de función como valor: útil para callbacks.
type Operacion = (a: number, b: number) => number;
const operaciones: Record<'suma' | 'producto', Operacion> = {
  suma: sumar,
  producto: (a, b) => a * b,   // a y b se infieren por contexto
};

// Sobrecargas: el tipo de retorno depende del argumento.
function analizar(entrada: string): number;
function analizar(entrada: string[]): number[];
function analizar(entrada: string | string[]): number | number[] {
  return Array.isArray(entrada) ? entrada.map(Number) : Number(entrada);
}

// `void` (no importa lo que devuelva) frente a `never` (nunca devuelve).
function registrar(mensaje: string): void {
  console.log(`[registro] ${mensaje}`);
}
function fallar(mensaje: string): never {
  throw new Error(mensaje);
}

console.log(saludar('Ada'));                                // → Hola, Ada
console.log(saludar('Ada', 'Buenos días', 'Dra.', 'Ing.')); // → Buenos días, Dra. Ing. Ada
console.log(operaciones.producto(6, 7));                    // → 42
console.log(analizar('3.5') + 1, analizar(['1', '2']));     // → 4.5 [ 1, 2 ]
registrar('todo en orden');                                 // → [registro] todo en orden

try {
  fallar('sin retorno');
} catch (e) {
  console.log(e instanceof Error ? e.message : e);          // → sin retorno
}
