/**
 * Nivel 5 · Inyección de dependencias sin decoradores ni reflexión
 *
 * La primera edición inyectaba una interfaz a mano en un constructor: correcto, y sigue siéndolo.
 * Aquí el paso siguiente: un contenedor mínimo con *tokens* tipados, sin `reflect-metadata`, sin
 * decoradores experimentales y compatible con la eliminación de tipos de Node.
 */

// Un token lleva el tipo del servicio que identifica, aunque en ejecución solo sea un símbolo.
interface Token<T> { readonly id: symbol; readonly _tipo?: T }
const token = <T>(descripcion: string): Token<T> => ({ id: Symbol(descripcion) });

type Fabrica<T> = (c: Contenedor) => T;

class Contenedor {
  #fabricas = new Map<symbol, Fabrica<unknown>>();
  #instancias = new Map<symbol, unknown>();

  registrar<T>(t: Token<T>, fabrica: Fabrica<T>): this {
    this.#fabricas.set(t.id, fabrica);
    return this;
  }

  resolver<T>(t: Token<T>): T {
    if (this.#instancias.has(t.id)) return this.#instancias.get(t.id) as T;
    const fabrica = this.#fabricas.get(t.id);
    if (!fabrica) throw new Error(`sin registrar: ${t.id.description}`);
    const instancia = fabrica(this) as T;
    this.#instancias.set(t.id, instancia);     // una instancia por contenedor (singleton)
    return instancia;
  }
}

// Contratos.
interface Reloj { ahora(): Date }
interface Registro { info(mensaje: string): void }
interface ServicioDeSalud { consejo(): string }

const RELOJ = token<Reloj>('Reloj');
const REGISTRO = token<Registro>('Registro');
const SALUD = token<ServicioDeSalud>('ServicioDeSalud');

// Implementación: depende de contratos, no de clases concretas.
class ConsejosDeBienestar implements ServicioDeSalud {
  constructor(private readonly reloj: Reloj, private readonly registro: Registro) {}
  consejo(): string {
    const hora = this.reloj.ahora().getUTCHours();
    this.registro.info(`consejo pedido a las ${hora} h`);
    return hora < 12 ? 'Empieza con diez minutos de meditación.' : 'Haz una pausa y sal a caminar.';
  }
}

function crearContenedor(reloj: Reloj): Contenedor {
  return new Contenedor()
    .registrar(RELOJ, () => reloj)
    .registrar(REGISTRO, () => ({ info: (m) => console.log(`[info] ${m}`) }))
    .registrar(SALUD, (c) => new ConsejosDeBienestar(c.resolver(RELOJ), c.resolver(REGISTRO)));
}

function _noCompila(c: Contenedor): void {
  // @ts-expect-error: el token de RELOJ produce un Reloj, no un Registro
  const r: Registro = c.resolver(RELOJ);
  // @ts-expect-error: la fábrica debe devolver un Reloj
  c.registrar(RELOJ, () => ({ hora: 9 }));
}

// En las pruebas basta con inyectar un reloj falso: nada de mocks globales.
const deManana = crearContenedor({ ahora: () => new Date('2026-11-16T08:00:00Z') });
const deTarde = crearContenedor({ ahora: () => new Date('2026-11-16T17:00:00Z') });

console.log(deManana.resolver(SALUD).consejo());
// → [info] consejo pedido a las 8 h
// → Empieza con diez minutos de meditación.
console.log(deTarde.resolver(SALUD).consejo());
// → [info] consejo pedido a las 17 h
// → Haz una pausa y sal a caminar.
console.log(deManana.resolver(SALUD) === deManana.resolver(SALUD));   // → true
