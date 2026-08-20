import type { GameState } from "../state/game-state";
import type { GameSystem } from "./game-system";
import {
  advanceStay,
  advanceWait,
  assignTables,
  moveCustomer,
  removeDepartedCustomers,
  spawnCustomer,
} from "../core/customers/customer";

// Mismo ritmo que NPC_SPAWN_INTERVAL_MS en main.ts (NpcController) — decisión
// confirmada en M04.3, ver .juntia/DECISIONS.md. Sigue el principio
// confirmado en M03.5 (la simulación es la fuente de verdad; Phaser solo
// representa lo que este sistema escriba en GameState).
const SPAWN_INTERVAL_MS = 2500;

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
    state.customers = state.customers.map((customer) => advanceStay(customer, deltaMs));
    state.customers = assignTables(state.customers, state.furniture);
    state.customers = state.customers.map((customer) => advanceWait(customer, deltaMs));
    state.customers = removeDepartedCustomers(state.customers);
  }
}
