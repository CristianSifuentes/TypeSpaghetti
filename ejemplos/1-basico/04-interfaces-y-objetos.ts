/**
 * Nivel 1 · Interfaces y objetos
 *
 * Una interfaz es un contrato de forma. No existe en el JavaScript: solo la comprueba el compilador.
 */

interface Usuario {
  readonly id: number;        // se fija al crear
  nombre: string;
  correo?: string;            // puede faltar (y, con exactOptionalPropertyTypes, no vale undefined)
}

interface Administrador extends Usuario {
  permisos: readonly ('leer' | 'escribir' | 'borrar')[];
}

const ada: Usuario = { id: 1, nombre: 'Ada' };
const grace: Administrador = { id: 2, nombre: 'Grace', correo: 'grace@ejemplo.dev', permisos: ['leer', 'escribir'] };

function _noCompila(): void {
  // @ts-expect-error: `id` es de solo lectura
  ada.id = 99;

  // Los literales «frescos» se comprueban a fondo: una errata en una propiedad es un error.
  // @ts-expect-error: `nombe` no existe en Usuario (¿quisiste decir `nombre`?)
  const conErrata: Usuario = { id: 3, nombe: 'Linus' };

  // @ts-expect-error: con exactOptionalPropertyTypes, «opcional» no es «puede valer undefined»
  const sinCorreo: Usuario = { id: 4, nombre: 'Barbara', correo: undefined };
}

// Tipado estructural: vale cualquier objeto con la forma, aunque no diga «implements».
function etiqueta(u: Usuario): string {
  return `#${u.id} ${u.nombre}${u.correo ? ` <${u.correo}>` : ''}`;
}

const desdeOtraParte = { id: 5, nombre: 'Margaret', departamento: 'Apolo' };
console.log(etiqueta(ada));              // → #1 Ada
console.log(etiqueta(grace));            // → #2 Grace <grace@ejemplo.dev>
console.log(etiqueta(desdeOtraParte));   // → #5 Margaret

// Firmas de índice: diccionarios con claves desconocidas.
const visitas: Record<string, number> = { inicio: 10, docs: 3 };
console.log(visitas['docs'] ?? 0, visitas['blog'] ?? 0);   // → 3 0

