import { describe, expect, it } from "vitest";
import { CustomerSystem } from "./customer-system";
import { createGameState } from "../state/game-state";

const SPAWN_INTERVAL_MS = 2500;

describe("CustomerSystem", () => {
  it("does not spawn a customer before the interval elapses", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS - 1);

    expect(state.customers).toEqual([]);
  });

  it("spawns a customer once the interval elapses, across multiple update calls", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS - 500);
    expect(state.customers).toHaveLength(0);

    system.update(state, 500);
    expect(state.customers).toHaveLength(1);
    expect(state.customers[0].state).toBe("walking");
  });

  it("spawns multiple customers with unique ids when a lot of time passes at once", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS * 3);

    expect(state.customers).toHaveLength(3);
    const ids = state.customers.map((customer) => customer.id);
    expect(new Set(ids).size).toBe(3);
  });
});
