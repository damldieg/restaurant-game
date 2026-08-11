import { describe, expect, it } from "vitest";
import { TILE_SIZE, gridToWorldCenter, samePosition } from "./grid";

describe("samePosition", () => {
  it("is true for equal col/row", () => {
    expect(samePosition({ col: 3, row: 5 }, { col: 3, row: 5 })).toBe(true);
  });

  it("is false when either coordinate differs", () => {
    expect(samePosition({ col: 3, row: 5 }, { col: 3, row: 6 })).toBe(false);
    expect(samePosition({ col: 3, row: 5 }, { col: 4, row: 5 })).toBe(false);
  });
});

describe("gridToWorldCenter", () => {
  it("centers a cell within the tile, offset by the grid origin", () => {
    const result = gridToWorldCenter({ col: 2, row: 1 }, 100, 200);

    expect(result).toEqual({
      x: 100 + 2 * TILE_SIZE + TILE_SIZE / 2,
      y: 200 + 1 * TILE_SIZE + TILE_SIZE / 2,
    });
  });

  it("uses the origin directly for the (0, 0) cell", () => {
    const result = gridToWorldCenter({ col: 0, row: 0 }, 50, 75);

    expect(result).toEqual({ x: 50 + TILE_SIZE / 2, y: 75 + TILE_SIZE / 2 });
  });
});
