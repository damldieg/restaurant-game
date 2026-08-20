import { describe, expect, it } from "vitest";
import { calculateTotalReputation } from "./reputation";
import type { FurnitureDefinition } from "./furniture-catalog";
import type { Chair, Table } from "./restaurant";

const catalog: FurnitureDefinition[] = [
  { type: "table", name: "Mesa", price: 100, reputation: 3 },
  { type: "chair", name: "Silla", price: 25, reputation: 1 },
];

const table: Table = { id: "table-1", type: "table", position: { col: 0, row: 0 } };
const chair: Chair = { id: "chair-1", type: "chair", position: { col: 0, row: 1 }, tableId: "table-1" };

describe("calculateTotalReputation", () => {
  it("is 0 with no furniture placed", () => {
    expect(calculateTotalReputation([], catalog)).toBe(0);
  });

  it("matches the catalog value with a single item placed", () => {
    expect(calculateTotalReputation([table], catalog)).toBe(3);
  });

  it("sums the catalog value of every item placed", () => {
    expect(calculateTotalReputation([table, chair, table], catalog)).toBe(7);
  });
});
