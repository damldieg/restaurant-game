# Table & Tale — Development Milestones

## How to use this document

- Las tareas se ejecutan en orden dentro de cada milestone, y los milestones en orden.
- Trabajar siempre en la primera tarea `[ ]` que esté desbloqueada (sin dependencias `[ ]`/`[-]` sin resolver antes).
- Cada tarea se verifica (test, `tsc --noEmit`, o chequeo visual en el navegador) antes de marcarla `[x]`.
- No saltar milestones ni implementar varias tareas grandes de una sola vez sin necesidad.
- Implementar una sola tarea por sesión, salvo pedido explícito de continuar.
- Estados: `[ ]` pendiente · `[x]` completada y verificada · `[-]` bloqueada (con motivo breve al lado).

## Relación con PROJECT_STATE.md

`docs/PROJECT_STATE.md` = estado actual. `docs/MILESTONES.md` = roadmap. Al completar
una tarea que cambia el estado real del proyecto, actualizar ambos; no duplicar
descripciones largas entre los dos.

---

## Milestone 01 — Asociación explícita mesa-silla

- [x] Agregar `id` a cada elemento de `Furniture`.
- [x] Agregar `tableId` a las sillas, asociándolas a su mesa.
- [x] Crear `getSeatForTable(table)` usando `tableId` (reemplaza el supuesto "fila de abajo").
- [x] Reemplazar `getSeatPosition` por `getSeatForTable` en `restaurant.ts`.
- [x] Actualizar `main.ts` si cambia el tipo de retorno.
- [x] Actualizar tests unitarios de `restaurant.ts` para la nueva asociación.

**Completion criteria:** `pnpm test` y `tsc --noEmit` en verde; el NPC se sienta igual
que antes pero vía asociación explícita, no por posición relativa.

---

## Milestone 02 — Múltiples mesas y sillas

*Depende de: M01.*

- [x] Agregar una segunda mesa + silla a `furniture`, con `id`/`tableId`.
- [x] Confirmar visualmente que ambas mesas y sillas se renderizan.
- [x] Extender test de `findFreeTable` a 2 mesas (una ocupada, otra libre).
- [x] Test: `getSeatForTable` correcto para ambas mesas.

**Completion criteria:** 2 mesas visibles y funcionalmente independientes en el navegador.

---

## Milestone 03 — Múltiples NPCs simultáneos

*Depende de: M02.*

- [ ] Agregar `id` a `Npc`.
- [ ] Reemplazar el spawn único por un timer (`this.time.addEvent`) que spawnee cada N segundos.
- [ ] Reemplazar `this.npc`/`this.npcSprite` por `this.npcs: Npc[]` (+ sprites asociados).
- [ ] `update()` recorre y anima todos los NPCs activos.
- [ ] Confirmar visualmente: 2+ clientes entrando y sentándose en mesas distintas.

**Completion criteria:** con 2 mesas, 2 clientes pueden entrar y sentarse a la vez, visible en pantalla.

---

## Milestone 04 — Espera / cola sin mesas libres

*Depende de: M03.*

- [ ] Agregar estado `waiting` a `NpcState`.
- [ ] Definir posiciones de cola (distintas de `entryTarget`, una por NPC en espera).
- [ ] NPC sin mesa libre pasa a `waiting` en su posición de cola, sin superponerse a otros.
- [ ] Confirmar visualmente: con todas las mesas ocupadas, los NPCs siguientes esperan en fila.

**Completion criteria:** N clientes esperando se ven en fila, ninguno superpuesto.

---

## Milestone 05 — Mejor comportamiento básico de NPCs

*Depende de: M04. Objetivo: endurecer lo construido en M02–M04 antes de seguir.*

- [ ] Extraer reservas a `game/reservations.ts`: `reserveTable`, `releaseTable`, `isTableReserved`.
- [ ] Test: reservar una mesa ya reservada no tiene efecto (evita doble reserva).
- [ ] Reemplazar `occupiedTables` ad hoc en `main.ts` por el nuevo módulo.
- [ ] `findFreeTable` usa el módulo de reservas en vez de recibir la lista por parámetro.
- [ ] Función pura FIFO: siguiente NPC a atender dada la lista de `waiting`.
- [ ] Test de la función FIFO con datos simulados (la liberación real de mesas llega en M11).

**Completion criteria:** `pnpm test` cubre reservas y cola FIFO; no queda lógica de mesas ad hoc en `main.ts`.

---

## Milestone 06 — Pedidos

*Depende de: M05.*

- [ ] Crear `game/menu.ts`: `MenuItem { id, name }`, lista mínima (2–3 platos, sin precio todavía).
- [ ] `pickRandomOrder(menu): MenuItem`, función pura.
- [ ] Test: `pickRandomOrder` siempre devuelve un ítem del menú dado.
- [ ] Agregar `order` a `Npc`, asignado al llegar a `seated`.
- [ ] Indicador visual (texto) sobre el NPC con su pedido.

**Completion criteria:** cada cliente sentado muestra visualmente qué pidió.

---

## Milestone 07 — Cocina y preparación

*Depende de: M06.*

- [ ] Modelar el pedido como estado: `ordered → cooking → ready`.
- [ ] Tiempo de preparación fijo (placeholder, sin mecánicas de cocina reales todavía).
- [ ] Test: función de transición de estado dado el tiempo transcurrido.
- [ ] Indicador visual de "cocinando" / "listo".

**Completion criteria:** el pedido de cada cliente pasa visualmente de cocinando a listo tras un tiempo fijo.

---

## Milestone 08 — Entrega de comida

*Depende de: M07.*

- [ ] Al llegar a `ready`, entrega automática al NPC (sin mesero todavía).
- [ ] Pedido pasa a `delivered`.
- [ ] Indicador visual del cambio (ej. ícono de plato en la mesa).

**Completion criteria:** la comida "servida" es visible en pantalla poco después de estar lista.

---

## Milestone 09 — Consumo de comida

*Depende de: M08.*

- [ ] Agregar estado `eating` a `NpcState`.
- [ ] Al recibir `delivered`, el NPC pasa a `eating`.
- [ ] Temporizador fijo de consumo.
- [ ] Indicador visual de "comiendo".

**Completion criteria:** el cliente pasa visualmente por `seated → eating` tras recibir su comida.

---

## Milestone 10 — Pago

*Depende de: M09.*

- [ ] Agregar `price` a cada `MenuItem`.
- [ ] Función pura que calcula el monto a pagar al terminar `eating`.
- [ ] Test: el monto calculado coincide con el precio del pedido.
- [ ] Mostrar el pago en pantalla (temporal, ej. texto flotante).

**Completion criteria:** al terminar de comer, se calcula y se muestra un monto.

---

## Milestone 11 — Salida del restaurante

*Depende de: M10.*

- [ ] Agregar estado `leaving` a `NpcState`.
- [ ] Tras pagar, el NPC pasa a `leaving` y camina de vuelta a la puerta.
- [ ] El NPC se destruye/despawnea al llegar a la puerta.
- [ ] Llamar a `releaseTable` (M05) al entrar en `leaving`.
- [ ] Confirmar visualmente: la mesa liberada es ocupada por un cliente nuevo.

**Completion criteria:** ciclo mesa ocupada → liberada → reocupada, visible con 2+ clientes.

---

## Milestone 12 — Economía inicial

*Depende de: M11 (necesita pagos reales para tener sentido).*

- [ ] `money` como estado del juego (no solo texto).
- [ ] Sumar el pago de cada cliente al total al entrar en `leaving`.
- [ ] Mostrar `money` en el HUD.

**Completion criteria:** el número de dinero en pantalla sube cada vez que un cliente paga y se va.

---

## Milestone 13 — Reputación inicial

*Depende de: M11.*

- [ ] `reputation` como estado del juego.
- [ ] Regla simple: +1 reputación por cliente que completa el ciclo.
- [ ] Conectar el texto "Reputación: 0" ya existente al valor real.

**Completion criteria:** el número de reputación sube con cada cliente que se va.

---

## Milestone 14 — Primera mejora comprable

*Depende de: M12.*

- [ ] Definir una mejora mínima comprable (ej. mesa+silla adicional) con costo fijo.
- [ ] Interacción mínima para comprarla (tecla o click, sin UI elaborada).
- [ ] Validar que el dinero alcanza antes de descontar.
- [ ] Confirmar visualmente: nueva mesa aparece tras la compra.

**Completion criteria:** se puede gastar `money` para agregar una mesa nueva, jugable en el navegador.

---

## Milestone 15 — Primer empleado

*Depende de: M14 (reutiliza el sistema de compra). Decisión abierta: qué hace exactamente
el primer empleado — a resolver antes de empezar este milestone.*

- [ ] Definir el efecto concreto del empleado (ej. acelera cocina o entrega).
- [ ] Costo fijo de contratación vía el sistema de compra de M14.
- [ ] Aplicar el efecto de forma medible.
- [ ] Confirmar visualmente o por tiempo que el efecto se aplica.

**Completion criteria:** contratar al empleado cambia observablemente el ritmo del loop.

---

## Milestone 16 — Primer loop completo

*Depende de: M06–M13 (integración, no sistemas nuevos).*

- [ ] Playtest manual del ciclo completo: entra → mesa → pide → cocina → recibe → come → paga → se va → dinero+reputación suben.
- [ ] Revisar y arreglar bugs de integración entre milestones (edge cases: cola vacía, mesa liberada dos veces, etc.).
- [ ] Confirmar que 2+ clientes completan el ciclo en paralelo sin bloquear la escena.
- [ ] Actualizar `PROJECT_STATE.md`: loop completo como "Working".

**Completion criteria:** loop jugable de principio a fin, reproducible, sin errores en consola.

---

## Milestones futuros (sin desglosar)

A definir cuando se acerquen: ciclo día/noche, más mejoras y empleados, variedad de
mobiliario/decoración, arte definitivo (reemplazar rectángulos placeholder).
