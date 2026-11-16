/**
 * Nivel 6 · Tipos que se leen
 *
 * Un tipo se escribe una vez y se lee cientos: en el editor, al pasar el cursor, en cada mensaje de
 * error. El arte está en que lo que el usuario ve sea corto, con nombre y sin ruido.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

// 1. Aplanar intersecciones para que el editor muestre un objeto, no «A & B & C».
type Simplificar<T> = { [K in keyof T]: T[K] } & {};

interface ConId { id: number }
interface ConFechas { creado: Date; actualizado: Date }
type ArticuloFeo = ConId & ConFechas & { titulo: string };   // al pasar el cursor: ConId & ConFechas & {…}
type Articulo = Simplificar<ArticuloFeo>;                    // al pasar el cursor: { id; creado; actualizado; titulo }

// 2. Nombrar los conceptos: un alias con nombre aparece en los errores en lugar de su expansión.
type Centimos = number;
type CodigoPais = 'ES' | 'MX' | 'AR' | 'CO' | 'CL' | 'PE';
interface Precio { cantidad: Centimos; moneda: 'EUR' | 'MXN' | 'ARS' | 'COP' | 'CLP' | 'PEN' }

// 3. Etiquetar las tuplas: [inicio: number, fin: number] se documenta solo.
type Intervalo = [inicio: Date, fin: Date];

// 4. Preferir uniones de literales a booleanos que se combinan mal.
type Alineacion = 'inicio' | 'centro' | 'fin';               // en vez de { izquierda?: boolean; centrado?: boolean }

type _Pruebas = [Afirmar<Igual<Articulo, { id: number; creado: Date; actualizado: Date; titulo: string }>>];

function formatear(precio: Precio, pais: CodigoPais): string {
  const texto = new Intl.NumberFormat(`es-${pais}`, { style: 'currency', currency: precio.moneda }).format(precio.cantidad / 100);
  return texto.replace(/ /g, ' ');   // Intl separa con un espacio no separable

}

function duracionEnDias([inicio, fin]: Intervalo): number {
  return Math.round((fin.getTime() - inicio.getTime()) / 86_400_000);
}

function alinear(texto: string, ancho: number, como: Alineacion): string {
  const hueco = Math.max(0, ancho - texto.length);
  const izquierda = como === 'inicio' ? 0 : como === 'fin' ? hueco : Math.floor(hueco / 2);
  return `[${' '.repeat(izquierda)}${texto}${' '.repeat(hueco - izquierda)}]`;
}

console.log(formatear({ cantidad: 129900, moneda: 'EUR' }, 'ES'));                         // → 1299,00 €
console.log(duracionEnDias([new Date('2026-03-23'), new Date('2026-07-08')]), 'días');    // → 107 días
console.log(alinear('arte', 10, 'centro'));                                                 // → [   arte   ]
