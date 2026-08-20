import { describe, expect, it } from "vitest";
import { createGameState } from "./game-state";
import { furniture } from "../core/restaurant";

describe("createGameState", () => {
  it("composes initial money and reputation values with the existing furniture data", () => {
    const state = createGameState(500, 0);

    expect(state.money).toBe(500);
    expect(state.reputation).toBe(0);
    expect(state.furniture).toBe(furniture);
    expect(state.customers).toEqual([]);
  });
});
