import type { GridPosition } from "../../game/grid";
import type { CustomerState } from "./customer-state";

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
