import { samePosition, type GridPosition } from "./grid";

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

// Posición de la puerta en el grid (reutilizada tanto para el spawn como
// para la salida genérica de M04/M11).
export function getDoorPosition(): GridPosition {
  return { col: RESTAURANT_COLS / 2, row: RESTAURANT_ROWS - 1 };
}

// Punto de entrada al que camina un NPC recién llegado, antes de que se le
// asigne mesa o pase a la cola.
export function getEntryPosition(): GridPosition {
  return { col: RESTAURANT_COLS / 2, row: RESTAURANT_ROWS - 4 };
}

// Fila de la cola: entre el punto de entrada y la puerta, para no
// superponerse con ninguno de los dos.
// Layout marcado como propuesta de Producto en .juntia/pending.json
// (docs/MILESTONES.md no fija un layout concreto).
const QUEUE_ROW = RESTAURANT_ROWS - 3;
const QUEUE_CENTER_COL = RESTAURANT_COLS / 2;

// Posición de cola pura: cada índice (orden de llegada a la cola) obtiene
// una celda distinta, alternando a izquierda/derecha del centro, sin
// superponerse a `entryTarget` ni entre sí.
export function getQueuePosition(index: number): GridPosition {
  const side = index % 2 === 0 ? 1 : -1;
  const distance = Math.floor(index / 2) + 1;

  return { col: QUEUE_CENTER_COL + side * distance, row: QUEUE_ROW };
}
