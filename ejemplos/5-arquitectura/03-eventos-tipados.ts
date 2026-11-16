/**
 * Nivel 5 · Un bus de eventos tipado
 *
 * Un mapa de eventos → carga útil es el contrato entre módulos que no se conocen. Con él, emitir
 * un evento inexistente, o con la carga equivocada, es un error de compilación; y `on` devuelve
 * un recurso desechable que se puede usar con `using`.
 */

type MapaDeEventos = Record<string, unknown>;

class Bus<E extends MapaDeEventos> {
  #oyentes = new Map<keyof E, Set<(carga: never) => void>>();

  on<K extends keyof E>(evento: K, oyente: (carga: E[K]) => void): Disposable {
    const conjunto = this.#oyentes.get(evento) ?? new Set();
    conjunto.add(oyente);
    this.#oyentes.set(evento, conjunto);
    return { [Symbol.dispose]: () => void conjunto.delete(oyente) };
  }

  emit<K extends keyof E>(evento: K, ...carga: E[K] extends void ? [] : [E[K]]): number {
    const oyentes = [...(this.#oyentes.get(evento) ?? [])] as ((carga: E[K] | undefined) => void)[];
    for (const oyente of oyentes) oyente(carga[0]);
    return oyentes.length;
  }
}

// El contrato de la aplicación, en un solo lugar.
interface EventosDeLaTienda extends MapaDeEventos {
  'carrito:añadido': { sku: string; cantidad: number };
  'pedido:pagado': { id: string; total: number };
  'sesion:cerrada': void;
}

const bus = new Bus<EventosDeLaTienda>();

bus.on('carrito:añadido', ({ sku, cantidad }) => console.log(`+${cantidad} ${sku}`));
bus.on('sesion:cerrada', () => console.log('hasta pronto'));

function _noCompila(): void {
  // @ts-expect-error: el evento no existe
  bus.emit('carrito:vaciado');
  // @ts-expect-error: falta `cantidad`
  bus.emit('carrito:añadido', { sku: 'TS-7' });
  // @ts-expect-error: un evento `void` no lleva carga
  bus.emit('sesion:cerrada', 'adiós');
}

bus.emit('carrito:añadido', { sku: 'TS-7', cantidad: 2 });   // → +2 TS-7

{
  using _suscripcion = bus.on('pedido:pagado', ({ id, total }) => console.log(`pedido ${id}: ${total.toFixed(2)} €`));
  bus.emit('pedido:pagado', { id: 'A-1', total: 49.9 });       // → pedido A-1: 49.90 €
}
// Fuera del bloque, la suscripción se liberó sola:
console.log(bus.emit('pedido:pagado', { id: 'A-2', total: 10 }), 'oyentes');   // → 0 oyentes
bus.emit('sesion:cerrada');                                                      // → hasta pronto
