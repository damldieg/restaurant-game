import type { GameState } from "../state/game-state";
import type { GameSystem } from "./game-system";
import { assignTables, moveCustomer, spawnCustomer } from "../core/customers/customer";

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
    state.customers = assignTables(state.customers, state.furniture);
  }
}
