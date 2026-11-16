/**
 * Nivel 2 · Genéricos
 *
 * Un genérico es una variable de tipo: se fija en cada uso y conecta entradas con salidas.
 * Regla de oro: un parámetro de tipo debería aparecer al menos dos veces en la firma.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

// La identidad conserva el tipo exacto (y el literal).
function identidad<T>(valor: T): T {
  return valor;
}
const hola = identidad('hola');

// Restricciones: `extends` limita lo que se acepta y permite usar lo que garantiza.
function masLargo<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

// `keyof`: la clave debe existir, y el retorno es el tipo exacto de esa propiedad.
function propiedad<T, K extends keyof T>(objeto: T, clave: K): T[K] {
  return objeto[clave];
}
const config = { puerto: 8080, host: 'localhost', seguro: false };
const puerto = propiedad(config, 'puerto');

// Parámetros de tipo por defecto (2.3) y `const` (5.0).
interface Respuesta<T = unknown> { estado: number; cuerpo: T }
function rutas<const T extends readonly string[]>(lista: T): T {
  return lista;
}
const misRutas = rutas(['/', '/docs', '/blog']);

// NoInfer (5.4): esta posición no participa en la inferencia.
function elegir<C extends string>(opciones: readonly C[], porDefecto: NoInfer<C>): C {
  return opciones.includes(porDefecto) ? porDefecto : (opciones[0] ?? porDefecto);
}

type _Pruebas = [
  Afirmar<Igual<typeof hola, 'hola'>>,
  Afirmar<Igual<typeof puerto, number>>,
  Afirmar<Igual<typeof misRutas, readonly ['/', '/docs', '/blog']>>,
];

function _noCompila(): void {
  // @ts-expect-error: 'usuario' no es una clave de config
  propiedad(config, 'usuario');
  // @ts-expect-error: con NoInfer, 'azul' no amplía C: debe ser 'rojo' | 'verde'
  elegir(['rojo', 'verde'], 'azul');
}

const respuesta: Respuesta<string[]> = { estado: 200, cuerpo: ['a', 'b'] };
console.log(masLargo('corto', 'larguísimo'), masLargo([1, 2, 3], [4]).length);   // → larguísimo 3
console.log(puerto + 1, misRutas.join(' '), respuesta.cuerpo.length);             // → 8081 / /docs /blog 2
console.log(elegir(['rojo', 'verde'], 'verde'));                                  // → verde
