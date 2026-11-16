/**
 * Nivel 5 · Errores como valores: el tipo Resultado
 *
 * `throw` es invisible en la firma: nadie sabe qué puede fallar ni cómo. Un `Resultado<T, E>`
 * convierte cada error esperado en parte del contrato, y el compilador obliga a tratarlo.
 * Las excepciones quedan para lo verdaderamente inesperado.
 */

type Resultado<T, E> = { ok: true; valor: T } | { ok: false; error: E };
const ok = <T>(valor: T): Resultado<T, never> => ({ ok: true, valor });
const err = <E>(error: E): Resultado<never, E> => ({ ok: false, error });

// Errores de dominio como unión discriminada: cada uno con sus datos.
type ErrorDeRegistro =
  | { tipo: 'correo-invalido'; correo: string }
  | { tipo: 'clave-debil'; motivos: string[] }
  | { tipo: 'ya-existe'; correo: string };

interface Cuenta { id: number; correo: string }
const existentes = new Set(['ada@ejemplo.dev']);

function validarCorreo(correo: string): Resultado<string, ErrorDeRegistro> {
  return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(correo) ? ok(correo.toLowerCase()) : err({ tipo: 'correo-invalido', correo });
}

function validarClave(clave: string): Resultado<string, ErrorDeRegistro> {
  const motivos = [
    clave.length < 12 && 'menos de 12 caracteres',
    !/\d/.test(clave) && 'sin números',
  ].filter((m) => m !== false);
  return motivos.length ? err({ tipo: 'clave-debil', motivos }) : ok(clave);
}

let siguienteId = 1;
function registrar(correo: string, clave: string): Resultado<Cuenta, ErrorDeRegistro> {
  const c = validarCorreo(correo);
  if (!c.ok) return c;
  const k = validarClave(clave);
  if (!k.ok) return k;
  if (existentes.has(c.valor)) return err({ tipo: 'ya-existe', correo: c.valor });
  existentes.add(c.valor);
  return ok({ id: siguienteId++, correo: c.valor });
}

// Tratar cada error: si mañana se añade un tipo nuevo, este switch deja de compilar.
function mensaje(e: ErrorDeRegistro): string {
  switch (e.tipo) {
    case 'correo-invalido': return `«${e.correo}» no es un correo`;
    case 'clave-debil': return `clave débil: ${e.motivos.join(', ')}`;
    case 'ya-existe': return `${e.correo} ya está registrado`;
  }
}

for (const [correo, clave] of [
  ['Grace@Ejemplo.dev', 'compilador-1952'],
  ['grace@ejemplo.dev', 'otra-clave-2026'],
  ['sin-arroba', 'x'],
  ['linus@ejemplo.dev', 'corta'],
] as const) {
  const r = registrar(correo, clave);
  console.log(r.ok ? `✓ cuenta ${r.valor.id}: ${r.valor.correo}` : `✗ ${mensaje(r.error)}`);
}
// → ✓ cuenta 1: grace@ejemplo.dev
// → ✗ grace@ejemplo.dev ya está registrado
// → ✗ «sin-arroba» no es un correo
// → ✗ clave débil: menos de 12 caracteres, sin números
