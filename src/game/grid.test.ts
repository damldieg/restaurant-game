import { describe, expect, it } from "vitest";
import { TILE_SIZE, gridToWorldCenter, samePosition, worldToGridPosition } from "./grid";

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

describe("worldToGridPosition", () => {
  it("is the inverse of gridToWorldCenter for a cell's center", () => {
    const origin = { x: 100, y: 200 };
    const center = gridToWorldCenter({ col: 4, row: 2 }, origin.x, origin.y);

    expect(worldToGridPosition(center.x, center.y, origin.x, origin.y)).toEqual({
      col: 4,
      row: 2,
    });
  });

  it("floors to the containing cell for any point inside it", () => {
    const origin = { x: 0, y: 0 };

    expect(worldToGridPosition(TILE_SIZE * 3 + 5, TILE_SIZE * 1 + 5, origin.x, origin.y)).toEqual(
      { col: 3, row: 1 }
    );
  });
});
