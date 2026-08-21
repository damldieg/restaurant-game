import type { GameState } from "../state/game-state";
import type { GameSystem } from "./game-system";
import { calculateTotalReputation } from "../core/reputation";
import { FURNITURE_CATALOG } from "../core/furniture-catalog";

export class ReputationSystem implements GameSystem {
  update(state: GameState, _deltaMs: number): void {
    state.reputation =
      calculateTotalReputation(state.furniture, FURNITURE_CATALOG) + state.reputationAdjustments;
  }
}
