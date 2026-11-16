/**
 * Nivel 3 · Decoradores estándar (TypeScript 5.0+)
 *
 * Sin `experimentalDecorators`: son los de la propuesta de TC39 (en stage 2.7 desde mayo de 2026).
 * Firma: (valor, contexto). Los experimentales de Angular/NestJS usan otra: (objetivo, clave, descriptor).
 */

// Decorador de método: envuelve la función original.
function medir<This, Args extends unknown[], R>(
  metodo: (this: This, ...args: Args) => R,
  contexto: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
) {
  const nombre = String(contexto.name);
  return function (this: This, ...args: Args): R {
    const resultado = metodo.call(this, ...args);
    console.log(`${nombre}(${args.join(', ')}) = ${String(resultado)}`);
    return resultado;
  };
}

// Decorador de método con inicializador: enlaza `this` para poder pasar el método suelto.
// (`any[]` y no `never[]`: la restricción debe encajar con la de ClassMethodDecoratorContext)
function enlazado<This extends object, F extends (this: This, ...args: any[]) => unknown>(
  metodo: F,
  contexto: ClassMethodDecoratorContext<This, F>,
): void {
  contexto.addInitializer(function (this: This) {
    (this as Record<string | symbol, unknown>)[contexto.name] = metodo.bind(this);
  });
}

// Decorador de accesor automático (4.9 + 5.0): valida cada escritura.
function enRango(min: number, max: number) {
  return function <This>(
    objetivo: ClassAccessorDecoratorTarget<This, number>,
    contexto: ClassAccessorDecoratorContext<This, number>,
  ): ClassAccessorDecoratorResult<This, number> {
    return {
      set(valor) {
        if (valor < min || valor > max) throw new RangeError(`${String(contexto.name)} fuera de [${min}, ${max}]`);
        objetivo.set.call(this, valor);
      },
    };
  };
}

class Termostato {
  @enRango(10, 30) accessor objetivo = 21;
  lecturas = 0;

  @medir
  ajustar(delta: number): number {
    this.objetivo += delta;
    return this.objetivo;
  }

  @enlazado
  leer(): string {
    this.lecturas++;
    return `${this.objetivo} °C`;
  }
}

const t = new Termostato();
t.ajustar(2);                          // → ajustar(2) = 23
const { leer } = t;                    // extraído: sin @enlazado, `this` sería undefined
console.log(leer(), t.lecturas);       // → 23 °C 1

try {
  t.ajustar(20);
} catch (e) {
  console.log((e as Error).message);   // → objetivo fuera de [10, 30]
}
