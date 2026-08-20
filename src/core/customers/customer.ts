import type { GridPosition } from "../../game/grid";
import type { CustomerState } from "./customer-state";
import { RESTAURANT_COLS, RESTAURANT_ROWS } from "../restaurant";

// `target` (destino de movimiento) y `tableId` (mesa asignada) se agregan cuando
// CustomerSystem implemente movimiento y asignación de mesa (M04, tareas siguientes) —
// ver la forma conceptual confirmada en .juntia/ARCHITECTURE.md.
export interface Customer {
  id: string;
  position: GridPosition;
  state: CustomerState;
}

export function createCustomer(
  id: string,
  position: GridPosition,
  state: CustomerState = "idle"
): Customer {
  return { id, position, state };
}

// Posición lógica de la puerta del restaurante — mismo cálculo que usa
// NpcController.spawnNpc() para el spawn de Npc, ahora puro y sin Phaser.
export const DOOR_POSITION: GridPosition = {
  col: RESTAURANT_COLS / 2,
  row: RESTAURANT_ROWS - 1,
};

export function spawnCustomer(id: string): Customer {
  return createCustomer(id, DOOR_POSITION, "walking");
}
