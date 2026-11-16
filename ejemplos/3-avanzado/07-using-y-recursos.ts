/**
 * Nivel 3 · `using`: gestión explícita de recursos (TypeScript 5.2, ES2027)
 *
 * Lo declarado con `using` se libera al salir del bloque —pase lo que pase— llamando a
 * `[Symbol.dispose]()`, en orden inverso al de creación.
 */

class Conexion implements Disposable {
  static abiertas = 0;
  constructor(readonly nombre: string) {
    Conexion.abiertas++;
    console.log(`abre ${nombre}`);
  }
  consultar(sql: string): string {
    return `${this.nombre}: ${sql}`;
  }
  [Symbol.dispose](): void {
    Conexion.abiertas--;
    console.log(`cierra ${this.nombre}`);
  }
}

function informe(): string {
  using principal = new Conexion('principal');
  using replica = new Conexion('réplica');
  return [principal.consultar('SELECT 1'), replica.consultar('SELECT 2')].join(' | ');
}

console.log(informe());
// → abre principal
// → abre réplica
// → cierra réplica
// → cierra principal
// → principal: SELECT 1 | réplica: SELECT 2

// Aunque haya una excepción, se libera.
function conError(): void {
  using _c = new Conexion('temporal');
  throw new Error('fallo a mitad');
}
try {
  conError();
} catch (e) {
  console.log(`${(e as Error).message}; abiertas: ${Conexion.abiertas}`);
}
// → abre temporal
// → cierra temporal
// → fallo a mitad; abiertas: 0

// DisposableStack: agrupar limpiezas de cosas que no implementan el protocolo.
function conTemporizador(): void {
  using pila = new DisposableStack();
  const id = setInterval(() => {}, 1000);
  pila.defer(() => {
    clearInterval(id);
    console.log('temporizador detenido');
  });
}
conTemporizador();   // → temporizador detenido
