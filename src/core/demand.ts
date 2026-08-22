// M07 — Demand system foundation. Lógica pura de demanda: separada del ciclo
// de vida del customer (core/customers/customer.ts) y de la ejecución
// mecánica del spawn (systems/customer-system.ts) — mismo split ya
// establecido entre core/reputation.ts y ReputationSystem.
//
// M07.1 definió solo el contrato de entrada/salida. M07.2 (este archivo)
// implementa la fórmula real contra la reputación; M07.3 la extenderá con
// capacidad/saturación (isRestaurantFull/getTableQueueSize, core/customers/
// customer.ts, M06.3).
export type DeriveSpawnIntervalMs = (reputation: number) => number;

// Valores de balance confirmados como decisión de producto (M07.2), ver
// .juntia/DECISIONS.md. Reputación <= MIN_REPUTATION_REFERENCE da el
// intervalo más lento (MAX_SPAWN_INTERVAL_MS); reputación >=
// MAX_REPUTATION_REFERENCE da el más rápido (MIN_SPAWN_INTERVAL_MS);
// interpolación lineal entre ambos puntos.
const MIN_SPAWN_INTERVAL_MS = 1200;
const MAX_SPAWN_INTERVAL_MS = 5000;
const MIN_REPUTATION_REFERENCE = -5;
const MAX_REPUTATION_REFERENCE = 15;

export const deriveSpawnIntervalMs: DeriveSpawnIntervalMs = (reputation) => {
  if (reputation <= MIN_REPUTATION_REFERENCE) return MAX_SPAWN_INTERVAL_MS;
  if (reputation >= MAX_REPUTATION_REFERENCE) return MIN_SPAWN_INTERVAL_MS;

  const t =
    (reputation - MIN_REPUTATION_REFERENCE) / (MAX_REPUTATION_REFERENCE - MIN_REPUTATION_REFERENCE);

  return MAX_SPAWN_INTERVAL_MS - t * (MAX_SPAWN_INTERVAL_MS - MIN_SPAWN_INTERVAL_MS);
};
