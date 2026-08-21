import { describe, expect, it } from "vitest";
import { CustomerSystem } from "./customer-system";
import { createGameState } from "../state/game-state";
import {
  getOccupiedTableIds,
  getTableQueuePosition,
  isRestaurantFull,
  resolveTableQueue,
  type Customer,
} from "../core/customers/customer";

const SPAWN_INTERVAL_MS = 2500;

// M06.1 — invariantes por estado documentados junto a CustomerState
// (core/customers/customer-state.ts). A diferencia de los tests por función
// en customer.test.ts, acá se verifican contra Customer reales producidos
// por un tick completo de CustomerSystem.update — el único lugar donde el
// invariante de "seated" (tableId y stayRemainingMs no nulos) está
// garantizado, ya que moveCustomer y advanceStay se reparten esa
// responsabilidad dentro del mismo pipeline.
function expectValidCustomerState(customer: Customer): void {
  switch (customer.state) {
    case "idle":
      expect(customer.tableId).toBeNull();
      break;
    case "seated":
      expect(customer.tableId).not.toBeNull();
      expect(customer.stayRemainingMs).not.toBeNull();
      break;
    case "waiting":
      expect(customer.waitReason).not.toBeNull();
      break;
    case "leaving":
      expect(customer.tableId).toBeNull();
      expect(customer.stayRemainingMs).toBeNull();
      expect(customer.waitReason).toBeNull();
      break;
  }
}

describe("CustomerSystem", () => {
  it("does not spawn a customer before the interval elapses", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS - 1);

    expect(state.customers).toEqual([]);
  });

  it("spawns a customer once the interval elapses, across multiple update calls", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS - 500);
    expect(state.customers).toHaveLength(0);

    system.update(state, 500);
    expect(state.customers).toHaveLength(1);
    expect(state.customers[0].state).toBe("walking");
  });

  it("spawns multiple customers with unique ids when a lot of time passes at once", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS * 3);

    expect(state.customers).toHaveLength(3);
    const ids = state.customers.map((customer) => customer.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("moves a spawned customer toward its target on later updates", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS - 1);
    system.update(state, 1);
    const initialPosition = state.customers[0].position;

    system.update(state, 500);

    expect(state.customers[0].position).not.toEqual(initialPosition);
    expect(state.customers[0].state).toBe("walking");
    expect(state.customers[0].target).not.toBeNull();
  });

  it("assigns a free table once a customer reaches the entry target", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS);

    expect(state.customers[0].tableId).not.toBeNull();
    expect(state.customers[0].target).not.toBeNull();
    expect(state.customers[0].state).toBe("walking");
  });

  it("sits a customer down once it reaches its assigned table", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS);
    system.update(state, 5000);

    expect(state.customers[0].state).toBe("seated");
    expect(state.customers[0].target).toBeNull();
    expect(state.customers[0].tableId).not.toBeNull();
  });

  it("runs the full lifecycle: spawns, walks in, sits, stays, leaves, and despawns", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();
    const findCustomer1 = () => state.customers.find((customer) => customer.id === "customer-1");

    system.update(state, SPAWN_INTERVAL_MS);
    expect(findCustomer1()?.state).toBe("walking");

    system.update(state, 5000);
    expect(findCustomer1()?.state).toBe("seated");

    system.update(state, 4000);
    expect(findCustomer1()?.state).toBe("seated");
    expect(findCustomer1()?.stayRemainingMs).toBeGreaterThan(0);

    system.update(state, 2000);
    expect(findCustomer1()?.state).toBe("leaving");
    expect(findCustomer1()?.tableId).toBeNull();
    expect(findCustomer1()).not.toBeUndefined();

    system.update(state, 60_000);
    expect(findCustomer1()).toBeUndefined();
  });

  it("frees a table once its customer starts leaving, so a waiting customer can take it", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS * 3);
    system.update(state, 5000);

    const waiting = state.customers.find((customer) => customer.tableId === null);
    expect(waiting?.state).toBe("waiting");

    system.update(state, 5000);
    system.update(state, 1);

    const waitingCustomerId = waiting?.id;
    const stillWaiting = state.customers.find((customer) => customer.id === waitingCustomerId);
    expect(stillWaiting?.tableId).not.toBeNull();
  });

  it("assigns distinct tables to multiple customers arriving in the same update", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS * 2);

    expect(state.customers).toHaveLength(2);
    const tableIds = state.customers.map((customer) => customer.tableId);
    expect(tableIds.every((id) => id !== null)).toBe(true);
    expect(new Set(tableIds).size).toBe(2);
  });

  it("sends a customer to the queue once every table is taken", () => {
    const state = createGameState(500, 0);

    new CustomerSystem().update(state, SPAWN_INTERVAL_MS * 3);

    expect(state.customers).toHaveLength(3);
    const withoutTable = state.customers.filter((customer) => customer.tableId === null);
    expect(withoutTable).toHaveLength(1);
    expect(withoutTable[0].state).toBe("waiting");
    expect(withoutTable[0].waitReason).toBe("table");
    expect(withoutTable[0].target).not.toBeNull();
  });

  it("rewards reputation exactly once when a customer completes a full seated cycle", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();
    const findCustomer1 = () => state.customers.find((customer) => customer.id === "customer-1");

    system.update(state, SPAWN_INTERVAL_MS);
    // Distancia real de ENTRY_TARGET al asiento de table-1 (~6.4 tiles a
    // 1.5 tiles/seg) — recién con este segundo tick customer-1 llega a
    // sentarse.
    system.update(state, 4300);
    expect(findCustomer1()?.state).toBe("seated");
    expect(state.reputationAdjustments).toBe(0);

    // Agota el stayRemainingMs recién iniciado de customer-1 (5700) sin
    // llegar a los 10000ms (STAY_DURATION_MS) que también expirarían de
    // movida al segundo customer que se sienta en este mismo tick.
    system.update(state, 6000);
    expect(findCustomer1()?.state).toBe("leaving");
    expect(state.reputationAdjustments).toBe(1);

    system.update(state, 1000);
    expect(state.reputationAdjustments).toBe(1);
  });

  it("penalizes reputation exactly once when a customer abandons after patience runs out", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS * 3);
    const waiting = state.customers.find((customer) => customer.state === "waiting");
    expect(waiting).toBeDefined();
    expect(state.reputationAdjustments).toBe(0);

    // Entre 7500ms (paciencia restante tras el primer tick) y 10000ms
    // (STAY_DURATION_MS) — agota la paciencia del customer en cola sin
    // agotar también el stay recién iniciado de los que se acaban de
    // sentar en este mismo tick.
    system.update(state, 8000);

    const waitingCustomerId = waiting?.id;
    const stillThere = state.customers.find((customer) => customer.id === waitingCustomerId);
    expect(stillThere?.state).toBe("leaving");
    expect(state.reputationAdjustments).toBe(-2);

    system.update(state, 1000);
    expect(state.reputationAdjustments).toBe(-2);
  });

  it("every customer satisfies its state invariant at every tick, across a run with queueing, seating, and patience abandonment (M06.1)", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    for (let tick = 0; tick < 20; tick += 1) {
      system.update(state, 1000);
      state.customers.forEach(expectValidCustomerState);
    }
  });

  // M06.4 — confirma que el sistema de paciencia (M05.3/M05.4) sigue
  // integrado correctamente con los invariantes de M06.1 y las queries de
  // dominio de M06.3, sin que ninguno de esos pasos haya cambiado su
  // comportamiento.
  it("patience abandonment removes the customer from the logical queue and leaves it state-invariant-consistent (M06.1/M06.3 integration)", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS * 3);
    const waitingCustomerId = state.customers.find((customer) => customer.state === "waiting")?.id;
    expect(waitingCustomerId).toBeDefined();
    expect(getTableQueuePosition(waitingCustomerId!, state.customers)).toBe(0);

    // Mismo timing que el test de M05.4 más abajo: agota la paciencia del
    // customer en cola sin agotar también el stay recién iniciado de los
    // que se acaban de sentar en este mismo tick. No se compara el tamaño
    // de cola contra un valor absoluto porque en esta ventana también
    // siguen llegando customers nuevos (cada SPAWN_INTERVAL_MS) que se
    // suman a la cola — se verifica en cambio que este customer puntual ya
    // no forma parte de ella.
    system.update(state, 8000);

    const abandoned = state.customers.find((customer) => customer.id === waitingCustomerId);
    expect(abandoned?.state).toBe("leaving");
    expect(abandoned?.tableId).toBeNull();
    expect(abandoned?.stayRemainingMs).toBeNull();
    expect(abandoned?.waitReason).toBeNull();
    expect(getTableQueuePosition(waitingCustomerId!, state.customers)).toBeNull();
  });

  it("isRestaurantFull correctly tracks table occupancy through a real run, empty to full (M06.3 integration)", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    expect(isRestaurantFull(state.customers, state.furniture)).toBe(false);

    system.update(state, SPAWN_INTERVAL_MS * 3);

    expect(state.customers).toHaveLength(3);
    expect(isRestaurantFull(state.customers, state.furniture)).toBe(true);
  });

  it("isRestaurantFull stays true when a table freed by a completed stay is immediately reclaimed by the queue in the same tick (M06.3 integration)", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS * 3);
    system.update(state, 5000);

    const waiting = state.customers.find((customer) => customer.tableId === null);
    expect(waiting?.state).toBe("waiting");
    expect(isRestaurantFull(state.customers, state.furniture)).toBe(true);

    system.update(state, 5000);
    system.update(state, 1);

    // La mesa liberada por advanceStay se reasigna al customer en cola
    // dentro del mismo tick (M05.3) — isRestaurantFull nunca "ve" el hueco;
    // por eso M06.3's "restaurant full" solo baja cuando nadie está en
    // cola para reclamar la mesa liberada (ver test anterior, y
    // customer.test.ts para el caso aislado con una mesa libre).
    expect(isRestaurantFull(state.customers, state.furniture)).toBe(true);
    const stillWaiting = state.customers.find((customer) => customer.id === waiting?.id);
    expect(stillWaiting?.tableId).not.toBeNull();
  });

  it("still penalizes reputation exactly once for a patience abandonment, with every customer state-invariant-consistent throughout (M06.1-M06.3 integration)", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS * 3);
    const waiting = state.customers.find((customer) => customer.state === "waiting");
    expect(waiting).toBeDefined();
    expect(state.reputationAdjustments).toBe(0);

    system.update(state, 8000);
    state.customers.forEach(expectValidCustomerState);

    const stillThere = state.customers.find((customer) => customer.id === waiting?.id);
    expect(stillThere?.state).toBe("leaving");
    expect(state.reputationAdjustments).toBe(-2);

    system.update(state, 1000);
    expect(state.reputationAdjustments).toBe(-2);
  });

  // M06.5 — cierra el ciclo mesa ocupada → liberada → reasignada como una
  // secuencia explícita de punta a punta, usando las funciones de dominio
  // de M06.1–M06.4 en vez de inferirlo de tests parciales. Ejercita
  // resolveTableQueue (existente desde M05.2) fuera de sus propios tests
  // por primera vez, cumpliendo el propósito para el que se creó: predecir
  // contra el estado real quién debe ocupar la próxima mesa que se libere.
  //
  // Nota: el checklist original de M06.5 menciona "customer abandona
  // (paciencia) o termina su ciclo normal" como disparadores equivalentes
  // de "la mesa aparece libre" — pero el hallazgo de M06.4 ya estableció
  // que un abandono por paciencia libera un slot de cola, no una mesa (el
  // customer en espera nunca tuvo una). Este test cubre el disparador que
  // sí libera una mesa real: el fin de una estadía (advanceStay →
  // sendToExit).
  it("resolveTableQueue predicts exactly who gets a table freed by a completed stay, and it happens in the same tick (M06.5)", () => {
    const state = createGameState(500, 0);
    const system = new CustomerSystem();

    system.update(state, SPAWN_INTERVAL_MS * 3);
    system.update(state, 5000);

    const waitingBeforeRelease = state.customers.find((customer) => customer.state === "waiting");
    expect(waitingBeforeRelease).toBeDefined();
    expect(getOccupiedTableIds(state.customers).size).toBe(2);

    // Predicción contra el estado real, justo antes de que se libere
    // ninguna mesa: quién debería ocuparla a continuación.
    const predictedNext = resolveTableQueue(state.customers);
    expect(predictedNext?.id).toBe(waitingBeforeRelease?.id);

    // Agota el stayRemainingMs de los customers sentados (mismo timing que
    // el resto de los tests de este archivo) — la mesa se libera y se
    // reasigna dentro de este mismo tick (M05.3), sin intervención manual.
    system.update(state, 5000);
    system.update(state, 1);

    const reassigned = state.customers.find((customer) => customer.id === predictedNext?.id);
    expect(reassigned?.tableId).not.toBeNull();
    expect(getOccupiedTableIds(state.customers).has(reassigned!.tableId!)).toBe(true);
  });
});
