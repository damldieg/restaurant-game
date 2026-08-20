import { samePosition, type GridPosition } from "../game/grid";

export const RESTAURANT_COLS = 20;
export const RESTAURANT_ROWS = 14;

export type FurnitureType = "table" | "chair";

export interface Table {
  id: string;
  type: "table";
  position: GridPosition;
}

export interface Chair {
  id: string;
  type: "chair";
  position: GridPosition;
  tableId: string;
}

export type Furniture = Table | Chair;

export const furniture: Furniture[] = [
  { id: "table-1", type: "table", position: { col: 5, row: 5 } },
  { id: "chair-1", type: "chair", position: { col: 5, row: 6 }, tableId: "table-1" },
  { id: "table-2", type: "table", position: { col: 13, row: 5 } },
  { id: "chair-2", type: "chair", position: { col: 13, row: 6 }, tableId: "table-2" },
];

// Busca la primera mesa cuya posición no esté en la lista de ocupadas.
export function findFreeTable(occupied: GridPosition[]): Table | undefined {
  return furniture.find(
    (item): item is Table =>
      item.type === "table" &&
      !occupied.some((position) => samePosition(position, item.position))
  );
}

// Busca la silla asociada a una mesa por `tableId`.
export function getSeatForTable(table: Table): GridPosition {
  const seat = furniture.find(
    (item): item is Chair => item.type === "chair" && item.tableId === table.id
  );

  if (!seat) {
    throw new Error(`No chair found for table "${table.id}"`);
  }

  return seat.position;
}
