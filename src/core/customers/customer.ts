import { samePosition, type GridPosition } from "../../game/grid";
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

// Paciencia de un customer "waiting" por mesa antes de abandonar (decisión
// confirmada en M05.3, ver .juntia/DECISIONS.md).
export const WAIT_DURATION_MS = 15_000;

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

// Posición del slot de cola número `index` (0-based) — M05.2. Una línea
// horizontal que arranca 2 columnas a la derecha de ENTRY_TARGET (siempre
// distinta de ENTRY_TARGET por construcción) y se extiende hacia el costado,
// no hacia la puerta — así no bloquea el camino que usan los customers
// recién llegados (DOOR_POSITION → ENTRY_TARGET). Fórmula abierta en vez de
// un array fijo: no hace falta un límite arbitrario de cuántos customers
// pueden esperar a la vez.
export function getQueueSlotPosition(index: number): GridPosition {
  return { col: ENTRY_TARGET.col + 2 + index, row: ENTRY_TARGET.row };
}

// Primer slot de cola libre, dada la lista de posiciones ya ocupadas —
// mismo tipo de búsqueda que `findFreeTable`, pero sobre una secuencia
// abierta en vez de un array fijo de mobiliario.
export function findFreeQueueSlot(occupiedSlots: GridPosition[]): GridPosition {
  let index = 0;

  while (occupiedSlots.some((slot) => samePosition(slot, getQueueSlotPosition(index)))) {
    index += 1;
  }

  return getQueueSlotPosition(index);
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

// Asigna mesa a los customers `idle` o `waiting` (por mesa) sin `tableId`
// todavía, usando `findFreeTable`/`getSeatForTable`. Evita doble asignación
// de la misma mesa dentro de la misma pasada llevando una lista de
// posiciones ya ocupadas (las ya asignadas + las que se van asignando en
// este mismo llamado). No muta los Customer originales.
//
// FIFO entre `waiting` e `idle` (M05.2): procesa `customers` en su orden de
// array — nunca reordenado, ver `spawnCustomer`/`removeDepartedCustomers` —
// así que un customer que ya estaba `waiting` (llegó antes) siempre aparece
// antes que uno recién `idle` en esta misma pasada, y por lo tanto siempre
// se evalúa primero para cualquier mesa que se libere. `resolveTableQueue`
// expresa este mismo criterio como función standalone para que M06 la
// llame desde `releaseTable` (un evento puntual de "esta mesa se liberó",
// fuera del recorrido por frame que ya hace esta función).
//
// Sin mesa libre: un customer `idle` pasa a `waiting` con `waitReason:
// "table"` y `target` al primer slot de cola libre (mismo patrón de
// `occupied`-tracking, ahora también para slots de cola, evitando que dos
// customers que entran a la cola en la misma pasada se superpongan). Un
// customer que ya estaba `waiting` se deja intacto — ya tiene su slot.
//
// Con mesa libre: fija `tableId`, apunta `target` al asiento, limpia
// `waitReason`/`waitRemainingMs` (si venía de la cola) y vuelve a `walking`
// para que `moveCustomer` lo lleve hasta ahí y lo siente al llegar
// (transición `walking → seated`, ver `moveCustomer`) — esta función nunca
// sienta al customer directamente.
export function assignTables(customers: Customer[], furnitureList: Furniture[]): Customer[] {
  const assignedTableIds = new Set(
    customers
      .filter((customer): customer is Customer & { tableId: string } => customer.tableId !== null)
      .map((customer) => customer.tableId)
  );

  const occupiedTables: GridPosition[] = furnitureList
    .filter((item): item is Table => item.type === "table" && assignedTableIds.has(item.id))
    .map((table) => table.position);

  // `target` es la posición del slot mientras el customer todavía camina
  // hacia él; una vez que llega, `moveCustomer` limpia `target` a `null` y
  // el slot pasa a estar en `position` — por eso se usa `target ?? position`
  // acá, y no solo `target` (que dejaría de "ver" como ocupado un slot
  // donde un customer ya está parado esperando).
  const occupiedQueueSlots: GridPosition[] = customers
    .filter((customer) => customer.state === "waiting")
    .map((customer) => customer.target ?? customer.position);

  return customers.map((customer) => {
    const isWaitingForTable = customer.state === "waiting" && customer.waitReason === "table";
    const isIdleWithoutTable = customer.state === "idle" && customer.tableId === null;

    if (!isWaitingForTable && !isIdleWithoutTable) {
      return customer;
    }

    const table = findFreeTable(occupiedTables);

    if (table) {
      occupiedTables.push(table.position);

      return {
        ...customer,
        tableId: table.id,
        target: getSeatForTable(table),
        state: "walking" as CustomerState,
        waitReason: null,
        waitRemainingMs: null,
      };
    }

    if (isWaitingForTable) {
      return customer;
    }

    const slot = findFreeQueueSlot(occupiedQueueSlots);
    occupiedQueueSlots.push(slot);

    return {
      ...customer,
      state: "waiting" as CustomerState,
      waitReason: "table" as WaitReason,
      target: slot,
    };
  });
}

// Cola FIFO (M05.2): dada la lista de customers, determina cuál debe
// ocupar la próxima mesa que se libere. `assignTables` ya logra este mismo
// orden de forma implícita procesando `customers` en su propio orden de
// array; esta función existe como criterio standalone y testeado para que
// M06 la reutilice desde `releaseTable` (evento de una mesa puntual
// liberándose, fuera del recorrido por frame de `assignTables`) sin
// duplicar el criterio de orden.
export function resolveTableQueue(customers: Customer[]): Customer | undefined {
  return customers.find(
    (customer) => customer.state === "waiting" && customer.waitReason === "table"
  );
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
    waitReason: null,
    waitRemainingMs: null,
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

// Cuenta regresiva de paciencia (M05.3) para customers "waiting" — espejo
// exacto de advanceStay. No muta el original. La cuenta arranca en
// WAIT_DURATION_MS la primera vez que ve a un customer "waiting" sin
// `waitRemainingMs` todavía. Al agotarse, envía al customer a la salida vía
// sendToExit (motivo genérico, sin distinguir por qué se va).
export function advanceWait(customer: Customer, deltaMs: number): Customer {
  if (customer.state !== "waiting") {
    return customer;
  }

  const remaining = (customer.waitRemainingMs ?? WAIT_DURATION_MS) - deltaMs;

  if (remaining > 0) {
    return { ...customer, waitRemainingMs: remaining };
  }

  return sendToExit(customer);
}

// Cuenta cuántos customers pasaron de `fromState` a "leaving" entre dos
// snapshots consecutivos del mismo pipeline (mismo orden y longitud — el
// "antes" y el "después" de un único paso como advanceStay/advanceWait).
// Usado por CustomerSystem (M05.4) para atribuir un evento de reputación
// al paso del pipeline que causó la transición, sin que sendToExit deje
// de ser genérico y sin que ReputationSystem necesite conocer a los
// customers (decisión confirmada: "Customer lifecycle events ownership").
export function countTransitionsToLeaving(
  before: Customer[],
  after: Customer[],
  fromState: CustomerState
): number {
  let count = 0;

  for (let i = 0; i < before.length; i += 1) {
    if (before[i].state === fromState && after[i].state === "leaving") {
      count += 1;
    }
  }

  return count;
}

// Elimina del array a cualquier customer que ya llegó a la puerta mientras
// se iba ("leaving" sin target activo — moveCustomer ya lo dejó ahí).
// Genérica: no le importa qué disparó el "leaving" en primer lugar.
export function removeDepartedCustomers(customers: Customer[]): Customer[] {
  return customers.filter(
    (customer) => !(customer.state === "leaving" && customer.target === null)
  );
}
