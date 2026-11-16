/**
 * Nivel 6 · Desenredar el espagueti
 *
 * El nombre de este repositorio viene de aquí. Un tipo «espagueti» es uno donde todo es opcional,
 * todo es booleano o todo es `any`: compila siempre y no protege nunca. Desenredarlo es convertir
 * las reglas del negocio en la forma del tipo.
 */

// ───── ANTES: compila con cualquier combinación, incluidas las imposibles ─────
interface NotificacionEspagueti {
  tipo?: string;
  email?: string;
  telefono?: string;
  url?: string;
  urgente?: boolean;
  silenciosa?: boolean;     // ¿urgente y silenciosa a la vez?
  datos?: any;              // cualquier cosa
}
const absurda: NotificacionEspagueti = { tipo: 'sms', email: 'x@y.z', urgente: true, silenciosa: true };

// ───── DESPUÉS: cada canal exige exactamente lo suyo; la prioridad es una sola cosa ─────
type Prioridad = 'silenciosa' | 'normal' | 'urgente';
type Notificacion =
  | { canal: 'correo'; para: `${string}@${string}`; asunto: string; prioridad: Prioridad }
  | { canal: 'sms'; para: `+${number}`; prioridad: Exclude<Prioridad, 'silenciosa'> }
  | { canal: 'webhook'; url: `https://${string}`; carga: Record<string, string | number> };

function enviar(n: Notificacion): string {
  switch (n.canal) {
    case 'correo': return `✉ ${n.para} «${n.asunto}» (${n.prioridad})`;
    case 'sms': return `✆ ${n.para}${n.prioridad === 'urgente' ? ' ‼' : ''}`;
    case 'webhook': return `⇢ POST ${n.url} ${JSON.stringify(n.carga)}`;
  }
}

function _noCompila(): void {
  // @ts-expect-error: un SMS no puede ser silencioso
  enviar({ canal: 'sms', para: '+34600000000', prioridad: 'silenciosa' });
  // @ts-expect-error: un webhook exige https
  enviar({ canal: 'webhook', url: 'http://inseguro.dev', carga: {} });
  // @ts-expect-error: un correo sin asunto
  enviar({ canal: 'correo', para: 'ada@ejemplo.dev', prioridad: 'normal' });
}

console.log(enviar({ canal: 'correo', para: 'ada@ejemplo.dev', asunto: 'Bienvenida', prioridad: 'normal' }));
// → ✉ ada@ejemplo.dev «Bienvenida» (normal)
console.log(enviar({ canal: 'sms', para: '+34600000000', prioridad: 'urgente' }));
// → ✆ +34600000000 ‼
console.log(enviar({ canal: 'webhook', url: 'https://hooks.ejemplo.dev/pedidos', carga: { id: 42 } }));
// → ⇢ POST https://hooks.ejemplo.dev/pedidos {"id":42}
console.log(`la versión espagueti aceptó: ${Object.keys(absurda).join(', ')}`);
// → la versión espagueti aceptó: tipo, email, urgente, silenciosa
