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

  it("moves a spawned customer toward its target on later updates", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS - 1);
    system.update(state, 1);
    const initialPosition = state.customers[0].position;

    system.update(state, 500);

    expect(state.customers[0].position).not.toEqual(initialPosition);
    expect(state.customers[0].state).toBe("walking");
    expect(state.customers[0].target).not.toBeNull();
  });

  it("assigns a free table once a customer reaches the entry target", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS);

    expect(state.customers[0].tableId).not.toBeNull();
    expect(state.customers[0].target).not.toBeNull();
    expect(state.customers[0].state).toBe("walking");
  });

  it("assigns distinct tables to multiple customers arriving in the same update", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS * 2);

    expect(state.customers).toHaveLength(2);
    const tableIds = state.customers.map((customer) => customer.tableId);
    expect(tableIds.every((id) => id !== null)).toBe(true);
    expect(new Set(tableIds).size).toBe(2);
  });

  it("leaves a customer idle without a table once every table is taken", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS * 3);

    expect(state.customers).toHaveLength(3);
    const withoutTable = state.customers.filter((customer) => customer.tableId === null);
    expect(withoutTable).toHaveLength(1);
    expect(withoutTable[0].state).toBe("idle");
    expect(withoutTable[0].target).toBeNull();
  });
});
