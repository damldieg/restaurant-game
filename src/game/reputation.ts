// `reputation` como estado real del juego (M04). M13 sólo agrega la
// recompensa positiva por cliente que completa el ciclo; este módulo ya
// existe desde M04 para la penalización por abandono.

// Valor por defecto marcado como propuesta de Producto en .juntia/pending.json
// (docs/MILESTONES.md no fija una magnitud concreta). Ajustable sin tocar el
// resto del sistema de reputación.
export const ABANDONMENT_REPUTATION_PENALTY = 1;

// Penalización única de reputación al abandonar por espera. Es responsabilidad
// del llamador invocar esto exactamente una vez por abandono (al disparar la
// transición a 'leaving'), nunca por frame/segundo.
export function applyAbandonmentPenalty(reputation: number): number {
  return reputation - ABANDONMENT_REPUTATION_PENALTY;
}
