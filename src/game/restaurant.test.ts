import { describe, expect, it } from "vitest";
import { findFreeTable, furniture, getSeatPosition, type Furniture } from "./restaurant";

const table = furniture.find((item) => item.type === "table") as Furniture;

describe("findFreeTable", () => {
  it("returns the table when it is not in the occupied list", () => {
    expect(findFreeTable([])).toBe(table);
  });

  it("returns undefined once the table's position is occupied", () => {
    expect(findFreeTable([table.position])).toBeUndefined();
  });

  it("ignores occupied positions that don't match any table", () => {
    expect(findFreeTable([{ col: 99, row: 99 }])).toBe(table);
  });
});

describe("getSeatPosition", () => {
  it("returns the tile directly below the table", () => {
    expect(getSeatPosition(table)).toEqual({
      col: table.position.col,
      row: table.position.row + 1,
    });
  });
});
