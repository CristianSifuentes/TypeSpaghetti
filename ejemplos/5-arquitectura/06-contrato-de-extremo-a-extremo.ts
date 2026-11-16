/**
 * Nivel 5 · Un contrato de API compartido de extremo a extremo
 *
 * Servidor y cliente importan el MISMO objeto de tipos. Si el servidor cambia una ruta o una
 * respuesta, el cliente deja de compilar: los errores de integración se mueven del día del
 * despliegue al momento de escribir el código. (Es la idea de tRPC, ts-rest o Hono RPC.)
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

// ───── contrato.ts: compartido ─────
interface Contrato {
  'GET /tareas': { consulta: { hechas?: boolean }; respuesta: Tarea[] };
  'POST /tareas': { cuerpo: { titulo: string }; respuesta: Tarea };
  'PATCH /tareas/:id': { cuerpo: { hecha: boolean }; respuesta: Tarea | null };
}
interface Tarea { id: number; titulo: string; hecha: boolean }

type Ruta = keyof Contrato;
type Params<R extends string> = R extends `${string}:${infer P}` ? { [K in P]: string } : {};
type Peticion<R extends Ruta> =
  Params<R> &
  (Contrato[R] extends { cuerpo: infer C } ? { cuerpo: C } : {}) &
  (Contrato[R] extends { consulta: infer Q } ? { consulta: Q } : {});
type Respuesta<R extends Ruta> = Contrato[R]['respuesta'];
type Implementacion = { [R in Ruta]: (peticion: Peticion<R>) => Promise<Respuesta<R>> };

// ───── servidor.ts: TypeScript exige implementar todas las rutas, con sus tipos ─────
const tareas: Tarea[] = [{ id: 1, titulo: 'Leer el nivel 5', hecha: false }];
const servidor: Implementacion = {
  'GET /tareas': async ({ consulta }) => tareas.filter((t) => consulta.hechas === undefined || t.hecha === consulta.hechas),
  'POST /tareas': async ({ cuerpo }) => {
    const nueva = { id: tareas.length + 1, titulo: cuerpo.titulo, hecha: false };
    tareas.push(nueva);
    return nueva;
  },
  'PATCH /tareas/:id': async ({ id, cuerpo }) => {
    const tarea = tareas.find((t) => t.id === Number(id));
    if (!tarea) return null;
    tarea.hecha = cuerpo.hecha;
    return tarea;
  },
};

// ───── cliente.ts: en producción haría fetch; aquí llama al servidor en memoria ─────
function llamar<R extends Ruta>(ruta: R, peticion: Peticion<R>): Promise<Respuesta<R>> {
  return (servidor[ruta] as (p: Peticion<R>) => Promise<Respuesta<R>>)(peticion);
}

type _Pruebas = [
  Afirmar<Igual<Respuesta<'PATCH /tareas/:id'>, Tarea | null>>,
  Afirmar<Igual<keyof Params<'PATCH /tareas/:id'>, 'id'>>,
];

function _noCompila(): void {
  // @ts-expect-error: la ruta no existe en el contrato
  llamar('DELETE /tareas/:id', { id: '1' });
  // @ts-expect-error: falta el parámetro `id`
  llamar('PATCH /tareas/:id', { cuerpo: { hecha: true } });
  // @ts-expect-error: `titulo` debe ser texto
  llamar('POST /tareas', { cuerpo: { titulo: 42 } });
}

const creada = await llamar('POST /tareas', { cuerpo: { titulo: 'Escribir el nivel 6' } });
await llamar('PATCH /tareas/:id', { id: '1', cuerpo: { hecha: true } });
const pendientes = await llamar('GET /tareas', { consulta: { hechas: false } });

console.log(`creada #${creada.id}`);                           // → creada #2
console.log(pendientes.map((t) => t.titulo).join(' | '));     // → Escribir el nivel 6
console.log(await llamar('PATCH /tareas/:id', { id: '99', cuerpo: { hecha: true } }));   // → null
