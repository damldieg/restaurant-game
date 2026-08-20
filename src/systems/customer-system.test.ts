import { describe, expect, it } from "vitest";
import { CustomerSystem } from "./customer-system";
import { createGameState } from "../state/game-state";

describe("CustomerSystem", () => {
  it("is a no-op extension point: it doesn't change state.customers yet", () => {
    const state = createGameState(500, 0);

    expect(() => new CustomerSystem().update(state, 16)).not.toThrow();
    expect(state.customers).toEqual([]);
  });
});
