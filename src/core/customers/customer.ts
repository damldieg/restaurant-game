import type { GridPosition } from "../../game/grid";
import type { CustomerState } from "./customer-state";
import { RESTAURANT_COLS, RESTAURANT_ROWS } from "../restaurant";

// Velocidad de caminata — tiles/segundo (decisión confirmada en M04.5, ver
// .juntia/DECISIONS.md).
export const CUSTOMER_SPEED_TILES_PER_SEC = 1.5;

// `tableId` (mesa asignada) se agrega cuando CustomerSystem implemente la
// asignación de mesa (M04.6) — ver la forma conceptual confirmada en
// .juntia/ARCHITECTURE.md.
export interface Customer {
  id: string;
  position: GridPosition;
  state: CustomerState;
  target: GridPosition | null;
}

export function createCustomer(
  id: string,
  position: GridPosition,
  state: CustomerState = "idle",
  target: GridPosition | null = null
): Customer {
  return { id, position, state, target };
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
