import { describe, expect, it } from "vitest";
import {
  createCustomer,
  spawnCustomer,
  moveCustomer,
  assignTables,
  DOOR_POSITION,
  ENTRY_TARGET,
  CUSTOMER_SPEED_TILES_PER_SEC,
} from "./customer";
import type { CustomerState } from "./customer-state";
import { furniture, getSeatForTable, type Table } from "../restaurant";

describe("createCustomer", () => {
  it("builds a customer with the given id, position, and state", () => {
    const position = { col: 3, row: 4 };

    expect(createCustomer("customer-1", position, "walking")).toEqual({
      id: "customer-1",
      position,
      state: "walking",
      target: null,
      tableId: null,
    });
  });

  it("defaults state to idle, target to null, and tableId to null when not provided", () => {
    const position = { col: 0, row: 0 };

    expect(createCustomer("customer-2", position).state).toBe("idle");
    expect(createCustomer("customer-2", position).target).toBeNull();
    expect(createCustomer("customer-2", position).tableId).toBeNull();
  });

  it.each<CustomerState>(["walking", "idle", "seated"])(
    "accepts %s as an initial state",
    (state) => {
      expect(createCustomer("customer-3", { col: 1, row: 1 }, state).state).toBe(state);
    }
  );

  it("accepts an explicit target", () => {
    const target = { col: 5, row: 5 };

    expect(createCustomer("customer-5", { col: 1, row: 1 }, "walking", target).target).toEqual(
      target
    );
  });

  it("accepts an explicit tableId", () => {
    expect(createCustomer("customer-6", { col: 1, row: 1 }, "idle", null, "table-1").tableId).toBe(
      "table-1"
    );
  });
});

describe("spawnCustomer", () => {
  it("creates a customer at the door, walking in toward the entry target", () => {
    expect(spawnCustomer("customer-4")).toEqual({
      id: "customer-4",
      position: DOOR_POSITION,
      state: "walking",
      target: ENTRY_TARGET,
      tableId: null,
    });
  });
});

describe("moveCustomer", () => {
  it("returns the same customer unchanged when there is no target", () => {
    const customer = createCustomer("customer-1", { col: 2, row: 2 }, "idle", null);

    expect(moveCustomer(customer, 1000)).toEqual(customer);
  });

  it("moves the customer toward its target by speed * deltaMs, without arriving", () => {
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "walking", {
      col: 10,
      row: 0,
    });

    const moved = moveCustomer(customer, 1000);

    expect(moved.position).toEqual({ col: CUSTOMER_SPEED_TILES_PER_SEC, row: 0 });
    expect(moved.target).toEqual({ col: 10, row: 0 });
    expect(moved.state).toBe("walking");
  });

  it("snaps to the target and clears it once the step would overshoot", () => {
    const target = { col: 1, row: 0 };
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "walking", target);

    const moved = moveCustomer(customer, 10_000);

    expect(moved.position).toEqual(target);
    expect(moved.target).toBeNull();
  });

  it("transitions walking to idle on arrival", () => {
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "walking", {
      col: 0,
      row: 0,
    });

    expect(moveCustomer(customer, 100).state).toBe("idle");
  });

  it("does not change a non-walking state on arrival", () => {
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "seated", {
      col: 0,
      row: 0,
    });

    expect(moveCustomer(customer, 100).state).toBe("seated");
  });

  it("does not mutate the original customer", () => {
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "walking", {
      col: 10,
      row: 0,
    });
    const snapshot = structuredClone(customer);

    moveCustomer(customer, 1000);

    expect(customer).toEqual(snapshot);
  });
});

describe("assignTables", () => {
  const [table1, table2] = furniture.filter((item): item is Table => item.type === "table");

  it("assigns the first free table to an idle customer without one", () => {
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "idle");

    const [assigned] = assignTables([customer], furniture);

    expect(assigned.tableId).toBe(table1.id);
    expect(assigned.target).toEqual(getSeatForTable(table1));
    expect(assigned.state).toBe("walking");
  });

  it("leaves a non-idle customer untouched", () => {
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "walking", {
      col: 5,
      row: 5,
    });

    expect(assignTables([customer], furniture)).toEqual([customer]);
  });

  it("leaves a customer that already has a table untouched", () => {
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "idle", null, table1.id);

    expect(assignTables([customer], furniture)).toEqual([customer]);
  });

  it("does not assign the same table to two idle customers in the same call", () => {
    const first = createCustomer("customer-1", { col: 0, row: 0 }, "idle");
    const second = createCustomer("customer-2", { col: 0, row: 0 }, "idle");

    const [assignedFirst, assignedSecond] = assignTables([first, second], furniture);

    expect(assignedFirst.tableId).toBe(table1.id);
    expect(assignedSecond.tableId).toBe(table2.id);
  });

  it("treats a table already assigned to another customer as occupied", () => {
    const seated = createCustomer("customer-1", { col: 0, row: 0 }, "idle", null, table1.id);
    const waiting = createCustomer("customer-2", { col: 0, row: 0 }, "idle");

    const [, assignedWaiting] = assignTables([seated, waiting], furniture);

    expect(assignedWaiting.tableId).toBe(table2.id);
  });

  it("leaves an idle customer without a table when none is free", () => {
    const first = createCustomer("customer-1", { col: 0, row: 0 }, "idle", null, table1.id);
    const second = createCustomer("customer-2", { col: 0, row: 0 }, "idle", null, table2.id);
    const third = createCustomer("customer-3", { col: 0, row: 0 }, "idle");

    const [, , assignedThird] = assignTables([first, second, third], furniture);

    expect(assignedThird.tableId).toBeNull();
    expect(assignedThird.target).toBeNull();
    expect(assignedThird.state).toBe("idle");
  });

  it("does not mutate the original customers", () => {
    const customer = createCustomer("customer-1", { col: 0, row: 0 }, "idle");
    const snapshot = structuredClone(customer);

    assignTables([customer], furniture);

    expect(customer).toEqual(snapshot);
  });
});
