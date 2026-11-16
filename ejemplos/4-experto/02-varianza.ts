/**
 * Nivel 4 · Varianza
 *
 * Si Gato es un Animal, ¿un Contenedor<Gato> es un Contenedor<Animal>? Depende de cómo use el
 * contenedor su parámetro:
 *   covariante      → T solo sale  (devuelve T):  F<Gato> se usa como F<Animal>
 *   contravariante  → T solo entra (recibe T):    F<Animal> se usa como F<Gato>
 *   invariante      → entra y sale: ninguna de las dos
 *
 * (La primera edición de esta guía confundía la contravarianza con «no poder llamar a un método
 * del subtipo». La contravarianza trata de los PARÁMETROS de las funciones.)
 */

class Animal {
  constructor(readonly nombre: string) {}
}
class Gato extends Animal {
  maullar(): string {
    return `${this.nombre}: miau`;
  }
}

type Productor<T> = () => T;            // covariante
type Consumidor<T> = (valor: T) => void; // contravariante

const produceGatos: Productor<Gato> = () => new Gato('Michi');
const produceAnimales: Productor<Animal> = produceGatos;          // ✅ un gato es un animal

const registraAnimales: Consumidor<Animal> = (a) => console.log(`registrado: ${a.nombre}`);
const registraGatos: Consumidor<Gato> = registraAnimales;         // ✅ quien atiende a cualquier animal atiende a un gato

function _noCompila(): void {
  const soloGatos: Consumidor<Gato> = (g) => console.log(g.maullar());
  // @ts-expect-error: contravarianza: le llegaría un perro y llamaría a maullar()
  const paraAnimales: Consumidor<Animal> = soloGatos;
}

// Anotaciones explícitas (4.7): documentan la intención y el compilador comprueba que sea cierta.
interface Fuente<out T> { leer(): T }
interface Sumidero<in T> { escribir: (valor: T) => void }

function _tampoco(): void {
  // @ts-expect-error: `out T` pero T aparece como entrada
  interface Mal<out T> { escribir: (valor: T) => void }
}

// La trampa: los arreglos son covariantes aunque se puedan escribir (un agujero deliberado).
const gatos: Gato[] = [new Gato('Michi')];
const animales: Animal[] = gatos;
animales.push(new Animal('Firulais'));
try {
  for (const g of gatos) g.maullar();
} catch {
  console.log('TypeError: el perro se coló en la lista de gatos');
}
// → TypeError: el perro se coló en la lista de gatos

const fuente: Fuente<Animal> = { leer: produceAnimales };
const sumidero: Sumidero<Gato> = { escribir: registraGatos };
sumidero.escribir(new Gato('Garfield'));        // → registrado: Garfield
console.log(fuente.leer().nombre);             // → Michi
