/**
 * Nivel 3 · keyof, typeof y accesos indexados
 *
 * Escribe los datos una vez y deriva los tipos de ellos: una sola fuente de verdad.
 */
import type { Afirmar, Igual } from '../_comun/pruebas-de-tipos.js';

const PLANES = {
  gratis: { precio: 0, proyectos: 3, soporte: 'comunidad' },
  pro: { precio: 12, proyectos: 50, soporte: 'correo' },
  equipo: { precio: 40, proyectos: Infinity, soporte: 'prioritario' },
} as const;

type Planes = typeof PLANES;                          // de valor a tipo
type NombrePlan = keyof Planes;                       // las claves
type Soporte = Planes[NombrePlan]['soporte'];         // indexar con una unión da una unión

const ROLES = ['lector', 'editor', 'admin'] as const;
type Rol = (typeof ROLES)[number];                    // los elementos de una tupla

type _Pruebas = [
  Afirmar<Igual<NombrePlan, 'gratis' | 'pro' | 'equipo'>>,
  Afirmar<Igual<Soporte, 'comunidad' | 'correo' | 'prioritario'>>,
  Afirmar<Igual<Rol, 'lector' | 'editor' | 'admin'>>,
];

function precioAnual(plan: NombrePlan): number {
  return PLANES[plan].precio * 12;
}

function esRol(valor: string): valor is Rol {
  return (ROLES as readonly string[]).includes(valor);
}

console.log(precioAnual('pro'), precioAnual('equipo'));          // → 144 480
console.log(esRol('editor'), esRol('dueño'));                   // → true false
console.log((Object.keys(PLANES) as NombrePlan[]).join(' < '));  // → gratis < pro < equipo
