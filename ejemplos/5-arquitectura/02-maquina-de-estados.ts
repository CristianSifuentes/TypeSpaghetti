/**
 * Nivel 5 · Estados imposibles, imposibles de representar
 *
 * Un objeto con `cargando: boolean; datos?: T; error?: string` admite combinaciones absurdas
 * (cargando y con error a la vez). Una unión discriminada solo admite los estados reales, y una
 * tabla de transiciones tipada solo admite los pasos válidos entre ellos.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

type Pedido =
  | { estado: 'borrador'; lineas: string[] }
  | { estado: 'pagado'; lineas: string[]; pago: string }
  | { estado: 'enviado'; lineas: string[]; pago: string; seguimiento: string }
  | { estado: 'cancelado'; motivo: string };

type Estado = Pedido['estado'];

// Qué transiciones existen desde cada estado: el mapa ES la especificación.
type Transiciones = {
  borrador: 'pagado' | 'cancelado';
  pagado: 'enviado' | 'cancelado';
  enviado: never;
  cancelado: never;
};

type En<E extends Estado> = Extract<Pedido, { estado: E }>;

// La firma solo admite pasar a un estado permitido desde el actual.
type Paso<De extends Estado> = {
  [A in Transiciones[De]]: (pedido: En<De>, ...datos: Datos<A>) => En<A>;
};
type Datos<A extends Estado> =
  A extends 'pagado' ? [pago: string]
  : A extends 'enviado' ? [seguimiento: string]
  : A extends 'cancelado' ? [motivo: string]
  : [];

const pagar: Paso<'borrador'>['pagado'] = (p, pago) => ({ estado: 'pagado', lineas: p.lineas, pago });
const enviar: Paso<'pagado'>['enviado'] = (p, seguimiento) => ({ ...p, estado: 'enviado', seguimiento });
const cancelar = (_p: En<'borrador' | 'pagado'>, motivo: string): En<'cancelado'> => ({ estado: 'cancelado', motivo });

type _Pruebas = [
  Afirmar<Igual<Transiciones['enviado'], never>>,          // un pedido enviado ya no cambia
  Afirmar<Igual<keyof Paso<'pagado'>, 'enviado' | 'cancelado'>>,
];

function describir(p: Pedido): string {
  switch (p.estado) {
    case 'borrador': return `borrador con ${p.lineas.length} línea(s)`;
    case 'pagado': return `pagado (${p.pago})`;
    case 'enviado': return `enviado, seguimiento ${p.seguimiento}`;
    case 'cancelado': return `cancelado: ${p.motivo}`;
  }
}

const borrador: En<'borrador'> = { estado: 'borrador', lineas: ['libro', 'taza'] };
const pagado = pagar(borrador, 'tarjeta ···4242');
const enviado = enviar(pagado, 'ES-2026-0042');

function _noCompila(): void {
  // @ts-expect-error: no se puede enviar un borrador sin pagar
  enviar(borrador, 'ES-0');
  // @ts-expect-error: un pedido enviado no se puede cancelar
  cancelar(enviado, 'tarde');
}

for (const p of [borrador, pagado, enviado, cancelar(pagado, 'cliente arrepentido')]) console.log(describir(p));
// → borrador con 2 línea(s)
// → pagado (tarjeta ···4242)
// → enviado, seguimiento ES-2026-0042
// → cancelado: cliente arrepentido
