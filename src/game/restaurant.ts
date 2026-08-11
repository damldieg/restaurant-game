import { samePosition, type GridPosition } from "./grid";

export const RESTAURANT_COLS = 20;
export const RESTAURANT_ROWS = 14;

export type FurnitureType = "table" | "chair";

export interface Furniture {
  type: FurnitureType;
  position: GridPosition;
}

export const furniture: Furniture[] = [
  { type: "table", position: { col: 5, row: 5 } },
  { type: "chair", position: { col: 5, row: 6 } },
];

// Busca la primera mesa cuya posición no esté en la lista de ocupadas.
export function findFreeTable(occupied: GridPosition[]): Furniture | undefined {
  return furniture.find(
    (item) =>
      item.type === "table" &&
      !occupied.some((position) => samePosition(position, item.position))
  );
}

// Por ahora asumimos que la silla de una mesa está en la casilla justo debajo.
// Cuando haya múltiples mesas/sillas esto deberá asociarlas explícitamente.
export function getSeatPosition(table: Furniture): GridPosition {
  return { col: table.position.col, row: table.position.row + 1 };
}
