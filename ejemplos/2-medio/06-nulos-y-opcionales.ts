/**
 * Nivel 2 · `null`, `undefined` y lo opcional
 *
 * Con strictNullChecks (dentro de strict, y por defecto desde TypeScript 6.0), `null` y
 * `undefined` son tipos propios: el compilador te obliga a contemplarlos.
 */

interface Perfil {
  nombre: string;
  apodo?: string;
  direccion?: { ciudad?: string; codigo?: string };
  contactos: string[];
  ultimoAcceso: Date | null;
}

const perfiles: Perfil[] = [
  { nombre: 'Ada', apodo: 'la Condesa', contactos: ['Charles'], ultimoAcceso: new Date('2026-11-01') },
  { nombre: 'Alan', direccion: { ciudad: 'Manchester' }, contactos: [], ultimoAcceso: null },
];

for (const p of perfiles) {
  const comoLlamarle = p.apodo ?? p.nombre;                      // ?? solo sustituye null/undefined
  const ciudad = p.direccion?.ciudad ?? 'ciudad desconocida';    // ?. se detiene si falta algo
  const primerContacto = p.contactos[0] ?? 'nadie';              // con noUncheckedIndexedAccess, [0] puede faltar
  const acceso = p.ultimoAcceso?.toISOString().slice(0, 10) ?? 'nunca';
  console.log(`${comoLlamarle} · ${ciudad} · ${primerContacto} · ${acceso}`);
}
// → la Condesa · ciudad desconocida · Charles · 2026-11-01
// → Alan · Manchester · nadie · nunca

// ?? frente a ||: con valores «falsos» legítimos, la diferencia importa.
const ajustes = { volumen: 0, titulo: '' };
console.log(ajustes.volumen || 50, ajustes.volumen ?? 50);   // → 50 0
console.log(`[${ajustes.titulo || 'sin título'}] [${ajustes.titulo ?? 'sin título'}]`);   // → [sin título] []

// Asignación lógica (4.0): inicializar solo si falta.
const cache: { datos?: string[] } = {};
(cache.datos ??= []).push('primero');
console.log(cache.datos.length);   // → 1

function _noCompila(p: Perfil): void {
  // @ts-expect-error: ultimoAcceso puede ser null
  p.ultimoAcceso.getTime();
}
