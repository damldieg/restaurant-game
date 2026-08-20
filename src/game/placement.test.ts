import { describe, expect, it } from "vitest";
import { isValidPlacement, type PlacementBounds } from "./placement";
import type { Table } from "./restaurant";

const bounds: PlacementBounds = { cols: 20, rows: 14 };

const existingTable: Table = { id: "table-1", type: "table", position: { col: 5, row: 5 } };

describe("isValidPlacement", () => {
  it("is valid within bounds and without collision", () => {
    expect(isValidPlacement({ col: 3, row: 3 }, bounds, [existingTable])).toBe(true);
  });

  it("is invalid outside the grid bounds", () => {
    expect(isValidPlacement({ col: -1, row: 0 }, bounds, [])).toBe(false);
    expect(isValidPlacement({ col: 0, row: -1 }, bounds, [])).toBe(false);
    expect(isValidPlacement({ col: bounds.cols, row: 0 }, bounds, [])).toBe(false);
    expect(isValidPlacement({ col: 0, row: bounds.rows }, bounds, [])).toBe(false);
  });

  it("is invalid when it collides with existing furniture", () => {
    expect(isValidPlacement(existingTable.position, bounds, [existingTable])).toBe(false);
  });
});
