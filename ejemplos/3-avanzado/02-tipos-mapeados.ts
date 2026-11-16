/**
 * Nivel 3 · Tipos mapeados
 *
 * `{ [K in Claves]: … }` recorre un conjunto de claves y produce una propiedad por cada una.
 * Con `as` (4.1) se pueden renombrar o filtrar.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

interface Usuario {
  readonly id: number;
  nombre: string;
  correo: string;
  activo: boolean;
}

// Modificadores: añadir o quitar `readonly` y `?`.
type Editable<T> = { -readonly [K in keyof T]: T[K] };
type Borrador<T> = { [K in keyof T]?: T[K] };

// Remapeo de claves: getters con nombre calculado.
type Getters<T> = { [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] };

// Filtrar: quedarse con las propiedades de cierto tipo.
type DeTipo<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };

// Unión de eventos a partir de las propiedades: { tipo: 'nombre'; valor: string } | …
type Cambios<T> = { [K in keyof T]: { campo: K; valor: T[K] } }[keyof T];

type _Pruebas = [
  Afirmar<Igual<keyof Getters<Usuario>, 'getId' | 'getNombre' | 'getCorreo' | 'getActivo'>>,
  Afirmar<Igual<DeTipo<Usuario, string>, { nombre: string; correo: string }>>,
  Afirmar<Igual<Cambios<Pick<Usuario, 'nombre' | 'activo'>>, { campo: 'nombre'; valor: string } | { campo: 'activo'; valor: boolean }>>,
];

function crearGetters<T extends object>(objeto: T): Getters<T> {
  const resultado: Record<string, () => unknown> = {};
  for (const [clave, valor] of Object.entries(objeto)) {
    resultado[`get${clave[0]?.toUpperCase()}${clave.slice(1)}`] = () => valor;
  }
  return resultado as Getters<T>;
}

function aplicar<T>(objeto: T, cambio: Cambios<T>): T {
  return { ...objeto, [cambio.campo]: cambio.valor };
}

const ada: Usuario = { id: 1, nombre: 'Ada', correo: 'ada@ejemplo.dev', activo: true };
const g = crearGetters(ada);
const parche: Borrador<Usuario> = { activo: false };
const copia: Editable<Usuario> = { ...ada };
copia.id = 2;

console.log(g.getNombre(), g.getActivo());                                   // → Ada true
console.log(aplicar(ada, { campo: 'correo', valor: 'condesa@ejemplo.dev' }).correo);   // → condesa@ejemplo.dev
console.log(Object.keys(parche).join(), copia.id);                           // → activo 2
