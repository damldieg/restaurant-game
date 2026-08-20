import { describe, expect, it } from "vitest";
import { ReputationSystem } from "./reputation-system";
import { createGameState } from "../state/game-state";
import { calculateTotalReputation } from "../core/reputation";
import { FURNITURE_CATALOG } from "../core/furniture-catalog";

describe("ReputationSystem", () => {
  it("sets state.reputation to the total reputation of the placed furniture", () => {
    const state = createGameState(500, 0);

    new ReputationSystem().update(state, 16);

    expect(state.reputation).toBe(calculateTotalReputation(state.furniture, FURNITURE_CATALOG));
  });
});
