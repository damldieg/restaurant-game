import type { GameState } from "../state/game-state";

export interface GameSystem {
  update(state: GameState, deltaMs: number): void;
}

export function runSystems(state: GameState, deltaMs: number, systems: GameSystem[]): void {
  for (const system of systems) {
    system.update(state, deltaMs);
  }
}
