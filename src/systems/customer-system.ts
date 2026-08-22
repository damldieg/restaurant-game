import type { GameState } from "../state/game-state";
import type { GameSystem } from "./game-system";
import {
  advanceStay,
  advanceWait,
  assignTables,
  countTransitionsToLeaving,
  moveCustomer,
  removeDepartedCustomers,
  spawnCustomer,
} from "../core/customers/customer";
import { deriveSpawnIntervalMs } from "../core/demand";

// Eventos de reputación por ciclo de vida de customer (M05.4, decisión de
// producto confirmada, ver .juntia/DECISIONS.md). Se aplican exactamente
// una vez por evento de salida, nunca por frame.
const REPUTATION_REWARD_COMPLETED_CYCLE = 1;
const REPUTATION_PENALTY_ABANDONED_WAIT = 2;

export class CustomerSystem implements GameSystem {
  private elapsedSinceLastSpawnMs = 0;
  private nextId = 1;

  update(state: GameState, deltaMs: number): void {
    this.elapsedSinceLastSpawnMs += deltaMs;

    let spawnIntervalMs = deriveSpawnIntervalMs(state.reputation);
    while (this.elapsedSinceLastSpawnMs >= spawnIntervalMs) {
      this.elapsedSinceLastSpawnMs -= spawnIntervalMs;
      state.customers.push(spawnCustomer(`customer-${this.nextId++}`));
      spawnIntervalMs = deriveSpawnIntervalMs(state.reputation);
    }

    state.customers = state.customers.map((customer) => moveCustomer(customer, deltaMs));

    // advanceStay corre antes que assignTables (a diferencia del orden M04)
    // para que una mesa liberada por un stay que se agota este mismo tick
    // quede disponible para el primero en cola en el mismo tick, en vez de
    // esperar al siguiente — evita que advanceWait le cuente ese tick de
    // más a un customer que ya iba a ser asignado.
    const beforeStay = state.customers;
    state.customers = beforeStay.map((customer) => advanceStay(customer, deltaMs));
    state.reputationAdjustments +=
      countTransitionsToLeaving(beforeStay, state.customers, "seated") *
      REPUTATION_REWARD_COMPLETED_CYCLE;

    state.customers = assignTables(state.customers, state.furniture);

    const beforeWait = state.customers;
    state.customers = beforeWait.map((customer) => advanceWait(customer, deltaMs));
    state.reputationAdjustments -=
      countTransitionsToLeaving(beforeWait, state.customers, "waiting") *
      REPUTATION_PENALTY_ABANDONED_WAIT;

    state.customers = removeDepartedCustomers(state.customers);
  }
}
