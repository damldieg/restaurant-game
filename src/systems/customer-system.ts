import type { GameState } from "../state/game-state";
import type { GameSystem } from "./game-system";
import { spawnCustomer } from "../core/customers/customer";

// Mismo ritmo que NPC_SPAWN_INTERVAL_MS en main.ts (NpcController) — decisión
// confirmada en M04.3, ver .juntia/DECISIONS.md. Todavía sin movimiento, mesas
// ni transiciones de estado más allá de "walking" — eso llega en los próximos
// pasos de M04, siguiendo el principio confirmado en M03.5 (la simulación es
// la fuente de verdad; Phaser solo representa lo que este sistema escriba en
// GameState).
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
  }
}
