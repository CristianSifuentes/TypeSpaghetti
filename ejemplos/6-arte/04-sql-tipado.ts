/**
 * Nivel 6 · Pieza de exhibición: SQL tipado con plantillas literales
 *
 * El compilador lee la consulta —una cadena— y deduce el tipo de cada fila del resultado.
 * Todo lo que hace falta ya se ha visto: plantillas literales, `infer`, recursión, tipos mapeados.
 * Es una demostración, no una biblioteca: muestra hasta dónde llega el sistema de tipos en 2026.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

interface Esquema {
  usuarios: { id: number; nombre: string; correo: string; activo: boolean };
  pedidos: { id: number; usuario: number; total: number; estado: 'pendiente' | 'enviado' };
}

type Recortar<S extends string> = S extends ` ${infer R}` ? Recortar<R> : S extends `${infer R} ` ? Recortar<R> : S;
type Columnas<S extends string> = S extends `${infer C},${infer R}` ? Recortar<C> | Columnas<R> : Recortar<S>;

type Fila<Q extends string> =
  Q extends `SELECT ${infer Cols} FROM ${infer Tabla}`
    ? Recortar<Tabla> extends infer T extends keyof Esquema
      ? Recortar<Cols> extends '*'
        ? Esquema[T]
        : Columnas<Cols> extends infer C extends keyof Esquema[T] ? { [K in C]: Esquema[T][K] } : `⛔ columna desconocida en ${T}`
      : `⛔ tabla desconocida: ${Recortar<Tabla>}`
    : '⛔ se esperaba SELECT … FROM …';

type _Pruebas = [
  Afirmar<Igual<Fila<'SELECT nombre, activo FROM usuarios'>, { nombre: string; activo: boolean }>>,
  Afirmar<Igual<Fila<'SELECT * FROM pedidos'>, Esquema['pedidos']>>,
  Afirmar<Igual<Fila<'SELECT nombre FROM clientes'>, '⛔ tabla desconocida: clientes'>>,
];

// La parte de ejecución: una base de datos en memoria y un analizador mínimo.
const datos: { [T in keyof Esquema]: Esquema[T][] } = {
  usuarios: [
    { id: 1, nombre: 'Ada', correo: 'ada@ejemplo.dev', activo: true },
    { id: 2, nombre: 'Alan', correo: 'alan@ejemplo.dev', activo: false },
  ],
  pedidos: [{ id: 10, usuario: 1, total: 49.9, estado: 'enviado' }],
};

function consultar<const Q extends string>(sql: Q): Fila<Q> extends string ? never : Fila<Q>[] {
  const [, cols = '', tabla = ''] = /^SELECT (.+) FROM (\w+)$/.exec(sql) ?? [];
  const filas = datos[tabla as keyof Esquema] as Record<string, unknown>[];
  const columnas = cols.trim() === '*' ? null : cols.split(',').map((c) => c.trim());
  return filas.map((f) => (columnas ? Object.fromEntries(columnas.map((c) => [c, f[c]])) : f)) as never;
}

const nombres = consultar('SELECT nombre, activo FROM usuarios');
//    ^ { nombre: string; activo: boolean }[]: deducido leyendo la cadena
type _Fila = Afirmar<Igual<typeof nombres, { nombre: string; activo: boolean }[]>>;

function _noCompila(): void {
  // @ts-expect-error: `correo` no se seleccionó
  nombres[0]?.correo;
  // @ts-expect-error: la tabla no existe (el resultado es never)
  consultar('SELECT nombre FROM clientes').length;
}

for (const u of nombres) console.log(`${u.nombre}: ${u.activo ? 'activo' : 'inactivo'}`);
// → Ada: activo
// → Alan: inactivo
const [pedido] = consultar('SELECT * FROM pedidos');
console.log(`${pedido?.id} → ${pedido?.estado}, ${pedido?.total} €`);   // → 10 → enviado, 49.9 €
