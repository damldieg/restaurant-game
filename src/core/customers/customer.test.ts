import { describe, expect, it } from "vitest";
import { createCustomer, spawnCustomer, DOOR_POSITION } from "./customer";
import type { CustomerState } from "./customer-state";

describe("createCustomer", () => {
  it("builds a customer with the given id, position, and state", () => {
    const position = { col: 3, row: 4 };

    expect(createCustomer("customer-1", position, "walking")).toEqual({
      id: "customer-1",
      position,
      state: "walking",
    });
  });

  it("defaults state to idle when not provided", () => {
    const position = { col: 0, row: 0 };

    expect(createCustomer("customer-2", position).state).toBe("idle");
  });

  it.each<CustomerState>(["walking", "idle", "seated"])(
    "accepts %s as an initial state",
    (state) => {
      expect(createCustomer("customer-3", { col: 1, row: 1 }, state).state).toBe(state);
    }
  );
});

describe("spawnCustomer", () => {
  it("creates a customer at the door, walking in", () => {
    expect(spawnCustomer("customer-4")).toEqual({
      id: "customer-4",
      position: DOOR_POSITION,
      state: "walking",
    });
  });
});
