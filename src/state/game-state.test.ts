import { describe, expect, it } from "vitest";
import { createGameState } from "./game-state";
import { furniture } from "../core/restaurant";

describe("createGameState", () => {
  it("composes an initial money value with the existing furniture data", () => {
    const state = createGameState(500);

    expect(state.money).toBe(500);
    expect(state.furniture).toBe(furniture);
  });
});
