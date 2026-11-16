/**
 * Nivel 3 · Los utilitarios de la biblioteca estándar
 *
 * Partial, Required, Readonly, Record, Pick, Omit, Exclude, Extract, NonNullable, ReturnType,
 * Parameters, InstanceType, Awaited, NoInfer… Todos están escritos con lo de este nivel.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

interface Tarea {
  id: number;
  titulo: string;
  hecha: boolean;
  notas?: string;
  etiquetas: string[];
}

type NuevaTarea = Omit<Tarea, 'id'>;                              // crear: sin id
type CambiosDeTarea = Partial<Pick<Tarea, 'titulo' | 'hecha'>>;    // actualizar: solo algunos campos
type TareaCompleta = Required<Tarea>;                             // notas ya no es opcional
type IndicePorId = Record<Tarea['id'], Readonly<Tarea>>;

type Prioridad = 'baja' | 'media' | 'alta' | 'urgente';
type Tranquila = Exclude<Prioridad, 'urgente'>;
type Alarmante = Extract<Prioridad, 'alta' | 'urgente' | 'inventada'>;

class Repositorio {
  #datos: IndicePorId = {};
  #siguiente = 1;

  async crear(nueva: NuevaTarea): Promise<Tarea> {
    const tarea = { ...nueva, id: this.#siguiente++ };
    this.#datos[tarea.id] = tarea;
    return tarea;
  }
  actualizar(id: number, cambios: CambiosDeTarea): Tarea | undefined {
    const actual = this.#datos[id];
    if (!actual) return undefined;
    const nueva = { ...actual, ...cambios };
    this.#datos[id] = nueva;
    return nueva;
  }
}

type _Pruebas = [
  Afirmar<Igual<Tranquila, 'baja' | 'media' | 'alta'>>,
  Afirmar<Igual<Alarmante, 'alta' | 'urgente'>>,
  Afirmar<Igual<TareaCompleta['notas'], string>>,
  Afirmar<Igual<Awaited<ReturnType<Repositorio['crear']>>, Tarea>>,
  Afirmar<Igual<Parameters<Repositorio['actualizar']>, [id: number, cambios: CambiosDeTarea]>>,
  Afirmar<Igual<InstanceType<typeof Repositorio>, Repositorio>>,
];

const repo = new Repositorio();
const t = await repo.crear({ titulo: 'Leer el nivel 3', hecha: false, etiquetas: ['estudio'] });
const hecha = repo.actualizar(t.id, { hecha: true });
console.log(t.id, hecha?.titulo, hecha?.hecha);   // → 1 Leer el nivel 3 true
console.log(repo.actualizar(99, { hecha: true }) ?? 'no existe');   // → no existe
