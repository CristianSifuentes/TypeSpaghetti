/**
 * Nivel 4 · Tipos nominales con marcas (branded types)
 *
 * TypeScript es estructural: dos `string` son intercambiables aunque uno sea un id de usuario y
 * otro un id de pedido. Una marca añade una propiedad fantasma que solo se obtiene validando.
 */
declare const marca: unique symbol;
type Marca<T, Nombre extends string> = T & { readonly [marca]: Nombre };

type IdUsuario = Marca<string, 'IdUsuario'>;
type IdPedido = Marca<string, 'IdPedido'>;
type Euros = Marca<number, 'Euros'>;
type Correo = Marca<string, 'Correo'>;

// Los únicos `as` del programa están dentro de constructores que validan.
function idPedido(texto: string): IdPedido {
  if (!/^P-\d+$/.test(texto)) throw new Error(`id de pedido inválido: ${texto}`);
  return texto as IdPedido;
}
function correo(texto: string): Correo {
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(texto)) throw new Error(`correo inválido: ${texto}`);
  return texto.toLowerCase() as Correo;
}
const euros = (cantidad: number): Euros => Math.round(cantidad * 100) / 100 as Euros;

function cancelar(pedido: IdPedido, avisarA: Correo): string {
  return `pedido ${pedido} cancelado; aviso a ${avisarA}`;
}
function sumar(a: Euros, b: Euros): Euros {
  return euros(a + b);
}

function _noCompila(usuario: IdUsuario): void {
  // @ts-expect-error: un IdUsuario no es un IdPedido, aunque ambos sean string
  cancelar(usuario, correo('a@b.dev'));
  // @ts-expect-error: un string cualquiera no es un Correo validado
  cancelar(idPedido('P-1'), 'sin-validar');
  // @ts-expect-error: un number cualquiera no son Euros
  sumar(euros(1), 2);
}

console.log(cancelar(idPedido('P-42'), correo('Ada@Ejemplo.dev')));   // → pedido P-42 cancelado; aviso a ada@ejemplo.dev
console.log(sumar(euros(0.1), euros(0.2)));                            // → 0.3
try {
  idPedido('42');
} catch (e) {
  console.log((e as Error).message);                                   // → id de pedido inválido: 42
}
