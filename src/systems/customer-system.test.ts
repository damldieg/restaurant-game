import { describe, expect, it } from "vitest";
import { CustomerSystem } from "./customer-system";
import { createGameState } from "../state/game-state";
import type { Customer } from "../core/customers/customer";

const SPAWN_INTERVAL_MS = 2500;

// M06.1 — invariantes por estado documentados junto a CustomerState
// (core/customers/customer-state.ts). A diferencia de los tests por función
// en customer.test.ts, acá se verifican contra Customer reales producidos
// por un tick completo de CustomerSystem.update — el único lugar donde el
// invariante de "seated" (tableId y stayRemainingMs no nulos) está
// garantizado, ya que moveCustomer y advanceStay se reparten esa
// responsabilidad dentro del mismo pipeline.
function expectValidCustomerState(customer: Customer): void {
  switch (customer.state) {
    case "idle":
      expect(customer.tableId).toBeNull();
      break;
    case "seated":
      expect(customer.tableId).not.toBeNull();
      expect(customer.stayRemainingMs).not.toBeNull();
      break;
    case "waiting":
      expect(customer.waitReason).not.toBeNull();
      break;
    case "leaving":
      expect(customer.tableId).toBeNull();
      expect(customer.stayRemainingMs).toBeNull();
      expect(customer.waitReason).toBeNull();
      break;
  }
}

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

  it("sits a customer down once it reaches its assigned table", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS);
    system.update(state, 5000);

    expect(state.customers[0].state).toBe("seated");
    expect(state.customers[0].target).toBeNull();
    expect(state.customers[0].tableId).not.toBeNull();
  });

  it("runs the full lifecycle: spawns, walks in, sits, stays, leaves, and despawns", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();
    const findCustomer1 = () => state.customers.find((customer) => customer.id === "customer-1");

    system.update(state, SPAWN_INTERVAL_MS);
    expect(findCustomer1()?.state).toBe("walking");

    system.update(state, 5000);
    expect(findCustomer1()?.state).toBe("seated");

    system.update(state, 4000);
    expect(findCustomer1()?.state).toBe("seated");
    expect(findCustomer1()?.stayRemainingMs).toBeGreaterThan(0);

    system.update(state, 2000);
    expect(findCustomer1()?.state).toBe("leaving");
    expect(findCustomer1()?.tableId).toBeNull();
    expect(findCustomer1()).not.toBeUndefined();

    system.update(state, 60_000);
    expect(findCustomer1()).toBeUndefined();
  });

  it("frees a table once its customer starts leaving, so a waiting customer can take it", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS * 3);
    system.update(state, 5000);

    const waiting = state.customers.find((customer) => customer.tableId === null);
    expect(waiting?.state).toBe("waiting");

    system.update(state, 5000);
    system.update(state, 1);

    const waitingCustomerId = waiting?.id;
    const stillWaiting = state.customers.find((customer) => customer.id === waitingCustomerId);
    expect(stillWaiting?.tableId).not.toBeNull();
  });

  it("assigns distinct tables to multiple customers arriving in the same update", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS * 2);

    expect(state.customers).toHaveLength(2);
    const tableIds = state.customers.map((customer) => customer.tableId);
    expect(tableIds.every((id) => id !== null)).toBe(true);
    expect(new Set(tableIds).size).toBe(2);
  });

  it("sends a customer to the queue once every table is taken", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS * 3);

    expect(state.customers).toHaveLength(3);
    const withoutTable = state.customers.filter((customer) => customer.tableId === null);
    expect(withoutTable).toHaveLength(1);
    expect(withoutTable[0].state).toBe("waiting");
    expect(withoutTable[0].waitReason).toBe("table");
    expect(withoutTable[0].target).not.toBeNull();
  });

  it("rewards reputation exactly once when a customer completes a full seated cycle", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();
    const findCustomer1 = () => state.customers.find((customer) => customer.id === "customer-1");

    system.update(state, SPAWN_INTERVAL_MS);
    // Distancia real de ENTRY_TARGET al asiento de table-1 (~6.4 tiles a
    // 1.5 tiles/seg) — recién con este segundo tick customer-1 llega a
    // sentarse.
    system.update(state, 4300);
    expect(findCustomer1()?.state).toBe("seated");
    expect(state.reputationAdjustments).toBe(0);

    // Agota el stayRemainingMs recién iniciado de customer-1 (5700) sin
    // llegar a los 10000ms (STAY_DURATION_MS) que también expirarían de
    // movida al segundo customer que se sienta en este mismo tick.
    system.update(state, 6000);
    expect(findCustomer1()?.state).toBe("leaving");
    expect(state.reputationAdjustments).toBe(1);

    system.update(state, 1000);
    expect(state.reputationAdjustments).toBe(1);
  });

  it("penalizes reputation exactly once when a customer abandons after patience runs out", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS * 3);
    const waiting = state.customers.find((customer) => customer.state === "waiting");
    expect(waiting).toBeDefined();
    expect(state.reputationAdjustments).toBe(0);

    // Entre 7500ms (paciencia restante tras el primer tick) y 10000ms
    // (STAY_DURATION_MS) — agota la paciencia del customer en cola sin
    // agotar también el stay recién iniciado de los que se acaban de
    // sentar en este mismo tick.
    system.update(state, 8000);

    const waitingCustomerId = waiting?.id;
    const stillThere = state.customers.find((customer) => customer.id === waitingCustomerId);
    expect(stillThere?.state).toBe("leaving");
    expect(state.reputationAdjustments).toBe(-2);

    system.update(state, 1000);
    expect(state.reputationAdjustments).toBe(-2);
  });

  it("every customer satisfies its state invariant at every tick, across a run with queueing, seating, and patience abandonment (M06.1)", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    for (let tick = 0; tick < 20; tick += 1) {
      system.update(state, 1000);
      state.customers.forEach(expectValidCustomerState);
    }
  });
});
