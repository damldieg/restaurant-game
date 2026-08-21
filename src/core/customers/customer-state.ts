// Estados posibles de un Customer y sus transiciones válidas — formalizado en
// M06.1 a partir de lo que ya era cierto por construcción, hoy repartido
// implícitamente entre moveCustomer, assignTables, advanceStay, advanceWait
// y sendToExit (customer.ts). No cambia ningún comportamiento existente,
// solo lo hace citable en un solo lugar.
//
// Transiciones válidas:
//
//   walking  --moveCustomer, llega sin mesa asignada-->      idle
//   walking  --moveCustomer, llega con mesa asignada-->      seated
//   idle     --assignTables, mesa libre-->                   walking
//   idle     --assignTables, sin mesa libre-->                waiting
//   waiting  --assignTables, mesa libre-->                   walking
//   *        --sendToExit (vía advanceStay o advanceWait)--> leaving
//   leaving  --removeDepartedCustomers, llega a la puerta--> (eliminado de GameState.customers)
//
// `sendToExit` es genérico y no valida el estado de origen — hoy solo lo
// disparan `advanceStay` (seated, se agota STAY_DURATION_MS) y `advanceWait`
// (waiting, se agota WAIT_DURATION_MS).
//
// Invariantes por estado — verdaderas para todo Customer que el pipeline real
// de CustomerSystem produce (no necesariamente para un Customer construido a
// mano en un test con una combinación de campos que la simulación nunca
// genera, p.ej. un `idle` creado directamente con un `tableId`):
//
//   idle    => tableId === null
//   seated  => tableId !== null && stayRemainingMs !== null
//   waiting => waitReason !== null
//   leaving => tableId === null && stayRemainingMs === null && waitReason === null
//   walking => sin invariante propio más allá del estado
//
// Nota: el invariante de "seated" solo queda garantizado al final de un tick
// completo de CustomerSystem.update. moveCustomer, por sí solo, deja
// stayRemainingMs en null al hacer walking → seated — inicializarlo no es su
// responsabilidad; advanceStay lo hace inmediatamente después, en el mismo
// pipeline (ver systems/customer-system.ts). Verificado por función en
// customer.test.ts y como invariante completo tras ticks reales en
// customer-system.test.ts.
export type CustomerState = "walking" | "idle" | "seated" | "leaving" | "waiting";
