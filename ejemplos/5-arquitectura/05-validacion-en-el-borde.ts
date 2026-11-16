/**
 * Nivel 5 · Validar en el borde: un esquema que es a la vez validador y tipo
 *
 * Los tipos se borran en ejecución; lo que entra por la red no está comprobado por nadie. La
 * solución arquitectónica: validar UNA vez, en el borde, con un esquema del que se DEDUCE el tipo.
 * Es la idea de Zod, Valibot o ArkType, aquí en 60 líneas para entender cómo funciona.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

type Resultado<T> = { ok: true; valor: T } | { ok: false; errores: string[] };

interface Esquema<T> {
  validar(valor: unknown, ruta?: string): Resultado<T>;
}
type Inferir<E> = E extends Esquema<infer T> ? T : never;

const texto = (opciones: { min?: number } = {}): Esquema<string> => ({
  validar: (v, ruta = 'valor') =>
    typeof v !== 'string' ? { ok: false, errores: [`${ruta}: se esperaba texto`] }
    : v.length < (opciones.min ?? 0) ? { ok: false, errores: [`${ruta}: mínimo ${opciones.min} caracteres`] }
    : { ok: true, valor: v },
});

const numero = (): Esquema<number> => ({
  validar: (v, ruta = 'valor') => (typeof v === 'number' && Number.isFinite(v) ? { ok: true, valor: v } : { ok: false, errores: [`${ruta}: se esperaba un número`] }),
});

const literal = <const L extends string>(...opciones: L[]): Esquema<L> => ({
  validar: (v, ruta = 'valor') => (opciones.includes(v as L) ? { ok: true, valor: v as L } : { ok: false, errores: [`${ruta}: debe ser ${opciones.join(' | ')}`] }),
});

const lista = <T>(elemento: Esquema<T>): Esquema<T[]> => ({
  validar(v, ruta = 'valor') {
    if (!Array.isArray(v)) return { ok: false, errores: [`${ruta}: se esperaba una lista`] };
    const resultados = v.map((x, i) => elemento.validar(x, `${ruta}[${i}]`));
    const errores = resultados.flatMap((r) => (r.ok ? [] : r.errores));
    return errores.length ? { ok: false, errores } : { ok: true, valor: resultados.map((r) => (r as { valor: T }).valor) };
  },
});

const objeto = <F extends Record<string, Esquema<unknown>>>(campos: F): Esquema<{ [K in keyof F]: Inferir<F[K]> }> => ({
  validar(v, ruta = 'valor') {
    if (typeof v !== 'object' || v === null) return { ok: false, errores: [`${ruta}: se esperaba un objeto`] };
    const salida: Record<string, unknown> = {};
    const errores: string[] = [];
    for (const [clave, esquema] of Object.entries(campos)) {
      const r = esquema.validar((v as Record<string, unknown>)[clave], `${ruta}.${clave}`);
      if (r.ok) salida[clave] = r.valor; else errores.push(...r.errores);
    }
    return errores.length ? { ok: false, errores } : { ok: true, valor: salida as { [K in keyof F]: Inferir<F[K]> } };
  },
});

// ───── Uso: el esquema es la única fuente de verdad ─────
const EsquemaUsuario = objeto({
  nombre: texto({ min: 2 }),
  edad: numero(),
  rol: literal('lector', 'editor', 'admin'),
  intereses: lista(texto()),
});
type Usuario = Inferir<typeof EsquemaUsuario>;   // nadie escribió esta interfaz a mano

type _Pruebas = [
  Afirmar<Igual<Usuario, { nombre: string; edad: number; rol: 'lector' | 'editor' | 'admin'; intereses: string[] }>>,
];

function alRecibir(cuerpo: string): string {
  const r = EsquemaUsuario.validar(JSON.parse(cuerpo), 'cuerpo');
  if (!r.ok) return `400: ${r.errores.join('; ')}`;
  const usuario: Usuario = r.valor;   // a partir de aquí, los tipos dicen la verdad
  return `201: ${usuario.nombre} (${usuario.rol}) le interesa ${usuario.intereses.join(' y ')}`;
}

console.log(alRecibir('{"nombre":"Ada","edad":36,"rol":"admin","intereses":["motores","poesía"]}'));
// → 201: Ada (admin) le interesa motores y poesía
console.log(alRecibir('{"nombre":"A","edad":"36","rol":"root","intereses":["ok",7]}'));
// → 400: cuerpo.nombre: mínimo 2 caracteres; cuerpo.edad: se esperaba un número; cuerpo.rol: debe ser lector | editor | admin; cuerpo.intereses[1]: se esperaba texto
