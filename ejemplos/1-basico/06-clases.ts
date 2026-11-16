/**
 * Nivel 1 · Clases
 *
 * Campos tipados, `#privado` real (ES2022), `readonly`, accesores, herencia con `override` y
 * clases abstractas.
 */

abstract class Figura {
  static #creadas = 0;
  readonly id: number;

  constructor(readonly nombre: string) {
    this.id = ++Figura.#creadas;
  }

  abstract area(): number;

  describir(): string {
    return `#${this.id} ${this.nombre}: ${this.area().toFixed(2)}`;
  }

  static get creadas(): number {
    return Figura.#creadas;
  }
}

class Circulo extends Figura {
  #radio: number;

  constructor(radio: number) {
    super('círculo');
    this.#radio = radio;
  }

  get radio(): number {
    return this.#radio;
  }
  set radio(valor: number) {
    if (valor <= 0) throw new RangeError('el radio debe ser positivo');
    this.#radio = valor;
  }

  override area(): number {
    return Math.PI * this.#radio ** 2;
  }
}

class Rectangulo extends Figura {
  constructor(readonly ancho: number, readonly alto: number) {
    super('rectángulo');
  }
  override area(): number {
    return this.ancho * this.alto;
  }
}

function _noCompila(): void {
  // @ts-expect-error: no se puede instanciar una clase abstracta
  new Figura('nada');
}

const figuras: Figura[] = [new Circulo(1), new Rectangulo(2, 3)];
for (const f of figuras) console.log(f.describir());
// → #1 círculo: 3.14
// → #2 rectángulo: 6.00

const c = new Circulo(2);
c.radio = 3;
console.log(c.radio, Figura.creadas);              // → 3 3
console.log(JSON.stringify(c), Object.keys(c));    // → {"nombre":"círculo","id":3} [ 'nombre', 'id' ]
