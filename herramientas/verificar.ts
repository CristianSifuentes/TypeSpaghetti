/**
 * Verificador de TypeSpaghetti.
 *
 * Requisito previo: `tsc -p .` (compila los ejemplos a dist/ y, de paso, comprueba sus tipos:
 * cada `// @ts-expect-error` que deje de fallar rompe la compilación).
 *
 * Después, este script ejecuta cada ejemplo compilado y compara lo que imprime con los
 * comentarios `// → salida esperada` del archivo .ts original, en el mismo orden.
 *
 * Uso:  npm run ejemplos           (compila y verifica)
 *       node herramientas/verificar.ts [filtro]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const EJEMPLOS = join(RAIZ, 'ejemplos');
const SALIDA = join(RAIZ, 'dist', 'ejemplos');

function archivos(dir: string): string[] {
  return readdirSync(dir)
    .sort()
    .flatMap((nombre) => {
      const ruta = join(dir, nombre);
      return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta];
    });
}

function esperado(fuente: string): string[] {
  return [...readFileSync(fuente, 'utf8').matchAll(/\/\/ → ?(.*)$/gm)].map((m) => (m[1] ?? '').trimEnd());
}

if (!existsSync(SALIDA)) {
  console.error('No existe dist/ejemplos: ejecuta antes `npx tsc -p .` (o `npm run ejemplos`).');
  process.exit(2);
}

const filtro = process.argv[2] ?? '';
const fuentes = archivos(EJEMPLOS).filter((f) => f.endsWith('.ts') && !f.includes(`${join('ejemplos', '_comun')}`) && f.includes(filtro));

let fallos = 0;
let lineas = 0;
for (const fuente of fuentes) {
  const nombre = relative(EJEMPLOS, fuente);
  const js = join(SALIDA, nombre.replace(/\.ts$/, '.js'));
  const r = spawnSync(process.execPath, ['--enable-source-maps', js], { encoding: 'utf8', timeout: 30_000 });
  const salida = r.stdout.split('\n').map((l) => l.trimEnd());
  if (salida.at(-1) === '') salida.pop();
  const esperada = esperado(fuente);
  lineas += esperada.length;

  const problemas: string[] = [];
  if (r.status !== 0) problemas.push(`terminó con código ${r.status}:\n      ${(r.stderr || '').trim().split('\n').slice(0, 4).join('\n      ')}`);
  if (esperada.length === 0) problemas.push('no tiene ninguna línea `// →` que comprobar');
  esperada.forEach((linea, i) => {
    if (salida[i] !== linea) problemas.push(`línea ${i + 1}: se esperaba «${linea}» y se obtuvo «${salida[i] ?? '(nada)'}»`);
  });
  if (salida.length > esperada.length) problemas.push(`imprimió ${salida.length - esperada.length} línea(s) de más: «${salida.slice(esperada.length).join(' | ')}»`);

  if (problemas.length) {
    fallos++;
    console.log(`✗ ${nombre}\n    ${problemas.join('\n    ')}`);
  } else {
    console.log(`✓ ${nombre} (${esperada.length})`);
  }
}

console.log(`\n${fuentes.length - fallos}/${fuentes.length} ejemplos correctos · ${lineas} líneas de salida comprobadas · Node ${process.version}`);
process.exitCode = fallos ? 1 : 0;
