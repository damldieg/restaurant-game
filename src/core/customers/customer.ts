import type { GridPosition } from "../../game/grid";
import type { CustomerState } from "./customer-state";
import {
  RESTAURANT_COLS,
  RESTAURANT_ROWS,
  findFreeTable,
  getSeatForTable,
  type Furniture,
  type Table,
} from "../restaurant";

// Velocidad de caminata — tiles/segundo (decisión confirmada en M04.5, ver
// .juntia/DECISIONS.md).
export const CUSTOMER_SPEED_TILES_PER_SEC = 1.5;

export interface Customer {
  id: string;
  position: GridPosition;
  state: CustomerState;
  target: GridPosition | null;
  tableId: string | null;
}

export function createCustomer(
  id: string,
  position: GridPosition,
  state: CustomerState = "idle",
  target: GridPosition | null = null,
  tableId: string | null = null
): Customer {
  return { id, position, state, target, tableId };
}

// Posición lógica de la puerta del restaurante — mismo cálculo que usa
// NpcController.spawnNpc() para el spawn de Npc, ahora puro y sin Phaser.
export const DOOR_POSITION: GridPosition = {
  col: RESTAURANT_COLS / 2,
  row: RESTAURANT_ROWS - 1,
};

// Punto de entrada al salón — mismo `entryTarget` que usaba
// NpcController.spawnNpc() como destino del primer tramo de camino, ahora
// como target real de la simulación en vez de un tween de Phaser.
export const ENTRY_TARGET: GridPosition = {
  col: RESTAURANT_COLS / 2,
  row: RESTAURANT_ROWS - 4,
};

export function spawnCustomer(id: string): Customer {
  return createCustomer(id, DOOR_POSITION, "walking", ENTRY_TARGET);
}

// Mueve un customer hacia su target según deltaMs, dentro de la simulación
// (nunca vía tween de Phaser — decisión confirmada en M03.5). Devuelve un
// nuevo Customer; no muta el original. Sin target, no hay movimiento.
// Al llegar (distancia recorrible en este paso >= distancia restante):
// la posición se ajusta exactamente al target, el target se limpia, y un
// customer "walking" pasa a "idle" (sin mesa asignada todavía — eso llega
// en M04.6/M04.7).
export function moveCustomer(customer: Customer, deltaMs: number): Customer {
  if (!customer.target) {
    return customer;
  }

  const dx = customer.target.col - customer.position.col;
  const dy = customer.target.row - customer.position.row;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const stepDistance = CUSTOMER_SPEED_TILES_PER_SEC * (deltaMs / 1000);

  if (stepDistance >= distance) {
    return {
      ...customer,
      position: customer.target,
      target: null,
      state: customer.state === "walking" ? "idle" : customer.state,
    };
  }

  const ratio = stepDistance / distance;

  return {
    ...customer,
    position: {
      col: customer.position.col + dx * ratio,
      row: customer.position.row + dy * ratio,
    },
  };
}

// Asigna mesa a los customers `idle` sin `tableId` todavía, en el orden del
// array (FIFO natural — el orden de spawn), usando `findFreeTable`/
// `getSeatForTable`. Evita doble asignación de la misma mesa dentro de la
// misma pasada llevando una lista de posiciones ya ocupadas (las ya
// asignadas + las que se van asignando en este mismo llamado). No muta los
// Customer originales. Solo fija `tableId` y apunta `target` al asiento,
// volviendo a `walking` para que `moveCustomer` lo lleve hasta ahí — la
// transición `walking → seated` al llegar es responsabilidad de M04.7, no
// de esta función.
export function assignTables(customers: Customer[], furnitureList: Furniture[]): Customer[] {
  const assignedTableIds = new Set(
    customers
      .filter((customer): customer is Customer & { tableId: string } => customer.tableId !== null)
      .map((customer) => customer.tableId)
  );

  const occupied: GridPosition[] = furnitureList
    .filter((item): item is Table => item.type === "table" && assignedTableIds.has(item.id))
    .map((table) => table.position);

  return customers.map((customer) => {
    if (customer.state !== "idle" || customer.tableId !== null) {
      return customer;
    }

    const table = findFreeTable(occupied);

    if (!table) {
      return customer;
    }

    occupied.push(table.position);

    return {
      ...customer,
      tableId: table.id,
      target: getSeatForTable(table),
      state: "walking" as CustomerState,
    };
  });
}
