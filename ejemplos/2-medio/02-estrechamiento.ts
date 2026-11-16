/**
 * Nivel 2 · Estrechamiento (narrowing)
 *
 * El compilador sigue el flujo de tu código y reduce el tipo de una variable según las
 * comprobaciones que ya haces: typeof, instanceof, in, igualdad, discriminantes, predicados…
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

type Forma =
  | { tipo: 'circulo'; radio: number }
  | { tipo: 'cuadrado'; lado: number }
  | { tipo: 'triangulo'; base: number; altura: number };

// Unión discriminada + comprobación exhaustiva: añadir una forma nueva obliga a tratarla aquí.
function area(forma: Forma): number {
  switch (forma.tipo) {
    case 'circulo':
      return Math.PI * forma.radio ** 2;
    case 'cuadrado':
      return forma.lado ** 2;
    case 'triangulo':
      return (forma.base * forma.altura) / 2;
    default: {
      const exhaustivo: never = forma;
      return exhaustivo;
    }
  }
}

// typeof, instanceof e `in`.
function describir(valor: string | number | Date | { nombre: string }): string {
  if (typeof valor === 'string') return `texto de ${valor.length}`;
  if (typeof valor === 'number') return `número ${valor.toFixed(1)}`;
  if (valor instanceof Date) return `fecha ${valor.toISOString().slice(0, 10)}`;
  return `objeto ${valor.nombre}`;
}

// Condiciones guardadas en constantes (4.4) y predicados de tipo inferidos (5.5).
function medir(x: string | number): number {
  const esTexto = typeof x === 'string';
  return esTexto ? x.length : x;
}

const mezcla = [3, undefined, 4, undefined, 5];
const numeros = mezcla.filter((n) => n !== undefined);   // 5.5: el compilador deduce `n is number`
type _Pruebas = [Afirmar<Igual<typeof numeros, number[]>>];

console.log(area({ tipo: 'triangulo', base: 4, altura: 3 }), area({ tipo: 'cuadrado', lado: 2 }));   // → 6 4
console.log(describir('hola'), '|', describir(2.345), '|', describir(new Date('2026-07-08')), '|', describir({ nombre: 'Ada' }));
// → texto de 4 | número 2.3 | fecha 2026-07-08 | objeto Ada
console.log(medir('Corsa'), medir(7), numeros.reduce((a, b) => a + b, 0));   // → 5 7 12
