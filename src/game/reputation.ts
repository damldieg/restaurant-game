// Reputación como estado real del juego (M04). M13 agrega la recompensa
// positiva sobre esta misma base; este módulo sólo define el estado y la
// penalización por abandono.

// Penalización fija aplicada una única vez por abandono (nunca acumulativa
// por frame/segundo). El caller es responsable de invocar esto exactamente
// una vez por evento de abandono (ver NpcController: el guard es el propio
// cambio de estado del NPC a "leaving").
export const REPUTATION_ABANDON_PENALTY = 1;

export interface ReputationState {
  value: number;
}

export function createReputationState(initial = 0): ReputationState {
  return { value: initial };
}

// Función pura: aplica la penalización de abandono una sola vez y devuelve
// un nuevo estado (no muta el que recibe).
export function applyAbandonPenalty(state: ReputationState): ReputationState {
  return { value: state.value - REPUTATION_ABANDON_PENALTY };
}
