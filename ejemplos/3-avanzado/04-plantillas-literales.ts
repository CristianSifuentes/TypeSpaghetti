/**
 * Nivel 3 · Tipos de plantilla literal (4.1)
 *
 * La misma sintaxis de las plantillas de JavaScript, en el nivel de los tipos: construir y analizar
 * cadenas con el compilador.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

type Evento = 'click' | 'foco' | 'tecla';
type Manejador = `on${Capitalize<Evento>}`;

type Talla = 's' | 'm' | 'l';
type Tono = 'claro' | 'oscuro';
type Variante = `${Talla}-${Tono}`;   // producto cartesiano: 6 combinaciones

type Css = `${number}${'px' | 'rem' | '%'}`;

// Analizar: los parámetros de una ruta estilo Express.
type Parametros<R extends string> =
  R extends `${string}:${infer P}/${infer Resto}` ? P | Parametros<`/${Resto}`>
  : R extends `${string}:${infer P}` ? P
  : never;

type _Pruebas = [
  Afirmar<Igual<Manejador, 'onClick' | 'onFoco' | 'onTecla'>>,
  Afirmar<Igual<Parametros<'/usuarios/:id/pedidos/:pedido'>, 'id' | 'pedido'>>,
];

function enlazar<R extends string>(ruta: R, valores: Record<Parametros<R>, string | number>): string {
  return ruta.replace(/:(\w+)/g, (_, clave: string) => String((valores as Record<string, string | number>)[clave]));
}

function tamano(valor: Css): Css {
  return valor;
}

function _noCompila(): void {
  // @ts-expect-error: falta el parámetro `pedido`
  enlazar('/usuarios/:id/pedidos/:pedido', { id: 1 });
  // @ts-expect-error: 'ancho' no encaja en `${number}px`
  tamano('anchopx');
}

const variantes: Variante[] = ['s-claro', 'l-oscuro'];
console.log(enlazar('/usuarios/:id/pedidos/:pedido', { id: 7, pedido: 'A-42' }));   // → /usuarios/7/pedidos/A-42
console.log(tamano('1.5rem'), variantes.join(' '));                                 // → 1.5rem s-claro l-oscuro
