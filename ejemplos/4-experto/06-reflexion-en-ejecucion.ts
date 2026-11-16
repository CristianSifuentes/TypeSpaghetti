/**
 * Nivel 4 · Lo que existe en ejecución (y lo que no)
 *
 * Los tipos se borran: en ejecución no hay interfaces, ni genéricos, ni uniones. Lo que queda es
 * JavaScript: `typeof`, `instanceof`, `in`, las clases, los símbolos y `Symbol.hasInstance`.
 */

interface Vehiculo { ruedas: number }            // no existe en ejecución
class Coche implements Vehiculo {                // la clase sí existe
  ruedas = 4;
  pitar(): string { return 'pi-pi'; }
}

// `instanceof` personalizado (5.3): el compilador entiende el predicado de Symbol.hasInstance.
class ConRuedas {
  static [Symbol.hasInstance](valor: unknown): valor is Vehiculo {
    return typeof valor === 'object' && valor !== null && 'ruedas' in valor && typeof valor.ruedas === 'number';
  }
}

const cosas: unknown[] = [new Coche(), { ruedas: 2 }, 'bici', 7n, Symbol('s'), () => {}];

for (const cosa of cosas) {
  const tipo = typeof cosa;
  const etiqueta = cosa instanceof Coche ? `Coche (${cosa.pitar()})`
    : cosa instanceof ConRuedas ? `vehículo de ${cosa.ruedas} ruedas`
    : tipo;
  console.log(etiqueta);
}
// → Coche (pi-pi)
// → vehículo de 2 ruedas
// → string
// → bigint
// → symbol
// → function

// Lo que el compilador sabía y el programa ya no:
function ruedasDe<T extends Vehiculo>(v: T): number {
  // T no existe aquí: no se puede preguntar «¿es T?». Solo se puede inspeccionar el valor.
  return v.ruedas;
}
console.log(ruedasDe(new Coche()), typeof (globalThis as Record<string, unknown>)['Vehiculo']);   // → 4 undefined
