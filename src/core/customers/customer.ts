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

// Tiempo que un customer permanece "seated" antes de irse — placeholder fijo
// sin comida/pedido real todavía (decisión confirmada en M04.8, ver
// .juntia/DECISIONS.md).
export const STAY_DURATION_MS = 10_000;

// Único motivo de espera implementado por ahora (M05.1) — el pedido
// original lo describe como el único mecanismo de espera del juego, para
// que M09/M11 reutilicen el mismo campo con `"order"`/`"food"` en vez de
// duplicar la infraestructura, sin necesidad de anticiparlos hoy.
export type WaitReason = "table";

export interface Customer {
  id: string;
  position: GridPosition;
  state: CustomerState;
  target: GridPosition | null;
  tableId: string | null;
  // Cuenta regresiva de M04.8 mientras está "seated"; null en cualquier
  // otro estado (todavía no se sentó, o ya se está yendo).
  stayRemainingMs: number | null;
  // M05.1 — motivo de espera; null salvo mientras está "waiting". Todavía
  // no hay ningún código que fije `state: "waiting"` (eso llega en M05.2).
  waitReason: WaitReason | null;
  // M05.1 — cuenta regresiva de paciencia mientras está "waiting", mismo
  // patrón que `stayRemainingMs`; null en cualquier otro estado.
  waitRemainingMs: number | null;
}

export function createCustomer(
  id: string,
  position: GridPosition,
  state: CustomerState = "idle",
  target: GridPosition | null = null,
  tableId: string | null = null,
  stayRemainingMs: number | null = null,
  waitReason: WaitReason | null = null,
  waitRemainingMs: number | null = null
): Customer {
  return {
    id,
    position,
    state,
    target,
    tableId,
    stayRemainingMs,
    waitReason,
    waitRemainingMs,
  };
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
// Al llegar (distancia recorrible en este paso >= distancia restante): la
// posición se ajusta exactamente al target y el target se limpia. Un
// customer "walking" que llega con una mesa asignada (`tableId`, per
// assignTables/M04.6) pasa a "seated" — llegó a su asiento; sin mesa
// asignada (llegó a ENTRY_TARGET) pasa a "idle", en espera de que
// assignTables le encuentre una.
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
      state:
        customer.state === "walking" ? (customer.tableId ? "seated" : "idle") : customer.state,
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
// volviendo a `walking` para que `moveCustomer` lo lleve hasta ahí y lo
// siente al llegar (transición `walking → seated`, ver `moveCustomer`) —
// esta función nunca sienta al customer directamente.
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

// Infraestructura genérica de salida (M04.8) — pone a un customer en camino
// a la puerta. Reutilizable por cualquier motivo futuro de abandono (M05
// paciencia, M09, M15), no solo por el timer de estadía de M04.8: nada acá
// depende de por qué se va. Libera la mesa de inmediato (`tableId: null`)
// para que `assignTables` pueda ofrecérsela a otro customer sin esperar a
// que termine de caminar hasta la puerta. No despawnea por sí sola —
// `moveCustomer` lo lleva a la puerta y `removeDepartedCustomers` lo saca
// de `GameState.customers` al llegar.
export function sendToExit(customer: Customer): Customer {
  return {
    ...customer,
    state: "leaving",
    target: DOOR_POSITION,
    tableId: null,
    stayRemainingMs: null,
  };
}

// Cuenta regresiva del tiempo de estadía (M04.8) para customers "seated".
// No muta el original. La cuenta arranca en STAY_DURATION_MS la primera vez
// que ve a un customer "seated" sin `stayRemainingMs` todavía (se sienta
// justo al llegar a la mesa, per moveCustomer — nunca antes), y no cuenta
// el tiempo que pasó caminando. Al agotarse, envía al customer a la salida
// vía sendToExit.
export function advanceStay(customer: Customer, deltaMs: number): Customer {
  if (customer.state !== "seated") {
    return customer;
  }

  const remaining = (customer.stayRemainingMs ?? STAY_DURATION_MS) - deltaMs;

  if (remaining > 0) {
    return { ...customer, stayRemainingMs: remaining };
  }

  return sendToExit(customer);
}

// Elimina del array a cualquier customer que ya llegó a la puerta mientras
// se iba ("leaving" sin target activo — moveCustomer ya lo dejó ahí).
// Genérica: no le importa qué disparó el "leaving" en primer lugar.
export function removeDepartedCustomers(customers: Customer[]): Customer[] {
  return customers.filter(
    (customer) => !(customer.state === "leaving" && customer.target === null)
  );
}
