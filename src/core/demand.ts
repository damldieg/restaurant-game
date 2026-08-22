// M07 — Demand system foundation. Lógica pura de demanda: separada del ciclo
// de vida del customer (core/customers/customer.ts) y de la ejecución
// mecánica del spawn (systems/customer-system.ts) — mismo split ya
// establecido entre core/reputation.ts y ReputationSystem.
//
// M07.1 (este archivo) define solo el contrato de entrada/salida, sin
// fórmula real todavía. M07.2 implementa `deriveSpawnIntervalMs` contra la
// reputación (con límites mínimo/máximo); M07.3 la extiende con
// capacidad/saturación (isRestaurantFull/getTableQueueSize, core/customers/
// customer.ts, M06.3). El SPAWN_INTERVAL_MS fijo de CustomerSystem
// (systems/customer-system.ts) será reemplazado por el resultado de esta
// función una vez exista — sin tocarlo todavía en este paso.
export type DeriveSpawnIntervalMs = (reputation: number) => number;
