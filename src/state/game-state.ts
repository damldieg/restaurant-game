import { furniture, type Furniture } from "../core/restaurant";
import type { Customer } from "../core/customers/customer";

export interface GameState {
  money: number;
  reputation: number;
  // Acumulador de eventos dinámicos de reputación (M05.4) — abandono/ciclo
  // completo de customers. ReputationSystem lo suma a la reputación
  // derivada del mobiliario; nunca inspecciona state.customers (decisión
  // confirmada: "Customer lifecycle events ownership", ver .juntia/DECISIONS.md).
  reputationAdjustments: number;
  furniture: Furniture[];
  customers: Customer[];
}

export function createGameState(initialMoney: number, initialReputation: number): GameState {
  return {
    money: initialMoney,
    reputation: initialReputation,
    reputationAdjustments: 0,
    furniture,
    customers: [],
  };
}
