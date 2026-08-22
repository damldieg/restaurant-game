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

// Decisión confirmada en M04.3, ver .juntia/DECISIONS.md. Sigue el principio
// confirmado en M03.5 (la simulación es la fuente de verdad; Phaser solo
// representa lo que este sistema escriba en GameState). Será reemplazada por
// el resultado de core/demand.ts:DeriveSpawnIntervalMs una vez M07.2 la
// implemente (ver M07.1, docs/MILESTONES.md) — CustomerSystem seguirá
// responsable solo de *ejecutar* el spawn, nunca de calcular el intervalo.
const SPAWN_INTERVAL_MS = 2500;

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

    while (this.elapsedSinceLastSpawnMs >= SPAWN_INTERVAL_MS) {
      this.elapsedSinceLastSpawnMs -= SPAWN_INTERVAL_MS;
      state.customers.push(spawnCustomer(`customer-${this.nextId++}`));
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
