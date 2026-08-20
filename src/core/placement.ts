import { samePosition, type GridPosition } from "./grid";
import type { Furniture } from "./restaurant";

export interface PlacementBounds {
  cols: number;
  rows: number;
}

export function isValidPlacement(
  position: GridPosition,
  bounds: PlacementBounds,
  existingFurniture: Furniture[]
): boolean {
  const withinBounds =
    position.col >= 0 &&
    position.row >= 0 &&
    position.col < bounds.cols &&
    position.row < bounds.rows;

  if (!withinBounds) {
    return false;
  }

  return !existingFurniture.some((item) => samePosition(item.position, position));
}
