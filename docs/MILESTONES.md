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

- [x] Agregar `id` a `Npc`.
- [x] Reemplazar el spawn único por un timer (`this.time.addEvent`) que spawnee cada N segundos.
- [x] Reemplazar `this.npc`/`this.npcSprite` de la escena por una colección de NPCs activos + sprites asociados
      (extraído a `game/npc/controller.ts`, `NpcController`, en vez de vivir como campos sueltos en `RestaurantScene`).
- [x] Animación de múltiples NPCs activos en simultáneo: cada uno recibe su propio tween de entrada/asiento al
      spawnear, gestionado por Phaser (no hace falta un loop manual por frame en `update()`).
- [x] Confirmar visualmente: 2+ clientes entrando y sentándose en mesas distintas.

**Completion criteria:** con 2 mesas, 2 clientes pueden entrar y sentarse a la vez, visible en pantalla.

---

## Milestone 04 — Espera / cola sin mesas libres, abandono y reputación

*Depende de: M03.*

- [ ] Agregar estado `waiting` a `NpcState`.
- [ ] Agregar motivo de espera y datos de paciencia reiniciables al `Npc` (p. ej.
      `waitingReason: 'table' | 'order' | 'food'` + inicio/límite de espera). Es el único concepto de espera
      del juego: M06–M08 reutilizan el mismo mecanismo para los otros dos motivos.
- [ ] Definir posiciones de cola (distintas de `entryTarget`), una por NPC en espera.
- [ ] NPC sin mesa libre pasa a `waiting` con motivo `table`, ubicado en su posición de cola, sin superponerse
      a otros.
- [ ] Cola FIFO: función pura que, dada la lista de NPCs en `waiting` con motivo `table`, determina cuál debe
      ocupar la próxima mesa disponible.
- [ ] Test unitario puro de la función FIFO.
- [ ] Timeout de espera de mesa: función pura que, dado el inicio de espera, el límite de paciencia y el tiempo
      transcurrido, determina si corresponde abandonar.
- [ ] Test unitario puro del timeout.
- [ ] Agregar estado `leaving` a `NpcState` y la infraestructura genérica de salida: caminar hacia la puerta y
      despawnear al llegar (reutilizable; M11 la reusa para la salida tras pagar, sin duplicarla).
- [ ] Abandono enfadado: al vencer el timeout de espera de mesa, el NPC dispara la transición a `leaving` de
      arriba.
- [ ] Agregar `reputation` como estado real del juego (M13 sólo agrega la recompensa positiva, no la crea).
- [ ] Penalización única de reputación al abandonar por espera de mesa: se aplica una sola vez al disparar el
      abandono, nunca de forma acumulativa por frame/segundo.
- [ ] Test unitario puro: un abandono resta reputación exactamente una vez.
- [ ] Si una mesa se libera y hay NPCs en `waiting` por mesa, el primero de la cola (FIFO) la ocupa y deja de
      esperar (función pura + test con datos simulados; la liberación real de una mesa ocupada llega recién en
      M11, ver también M05).
- [ ] Confirmar visualmente: con todas las mesas ocupadas, los NPCs siguientes esperan en fila sin superponerse;
      un NPC que espera demasiado sale enfadado por la puerta y la reputación baja exactamente una vez.

**Completion criteria:** `pnpm test` cubre la cola FIFO, el timeout y la penalización única de reputación; en el
navegador, con 2 mesas y 3+ clientes, se ve la cola, el abandono enfadado y la baja de reputación.

---

## Milestone 05 — Mejor comportamiento básico de NPCs

*Depende de: M04. Objetivo: endurecer lo construido en M02–M04 antes de seguir.*

- [ ] Extraer reservas a `game/reservations.ts`: `reserveTable`, `releaseTable`, `isTableReserved`.
- [ ] Test: reservar una mesa ya reservada no tiene efecto (evita doble reserva).
- [ ] Reemplazar el tracking ad hoc de mesas ocupadas en `game/npc/controller.ts` por el nuevo módulo.
- [ ] `findFreeTable` usa el módulo de reservas en vez de recibir la lista por parámetro.
- [ ] `releaseTable` invoca la función FIFO de M04 para que, al liberar una mesa, el primer NPC en cola la
      ocupe automáticamente.
- [ ] Test: liberar una mesa con NPCs en `waiting` (motivo `table`) asigna la mesa al primero (FIFO) y lo saca
      de `waiting`.

**Completion criteria:** `pnpm test` cubre reservas y la integración liberación↔cola FIFO de M04; no queda
lógica de mesas ad hoc en `game/npc/controller.ts`.

---

## Milestone 06 — Pedidos

*Depende de: M05.*

- [ ] Crear `game/menu.ts`: `MenuItem { id, name }`, lista mínima (2–3 platos, sin precio todavía).
- [ ] `pickRandomOrder(menu): MenuItem`, función pura.
- [ ] Test: `pickRandomOrder` siempre devuelve un ítem del menú dado.
- [ ] Al llegar a `seated`, el NPC pasa a `waiting` con motivo `order` (mismo mecanismo de espera de M04).
- [ ] Toma de pedido automática/placeholder (sin camarero real todavía): asigna `order` al NPC y reinicia la
      espera con motivo `food`.
- [ ] Indicador visual (texto) sobre el NPC con su pedido.
- [ ] *(Tarea posterior, no imprescindible en este incremento)* Timeout de espera de pedido (motivo `order`),
      reutilizando el timeout de M04.

**Completion criteria:** cada cliente sentado pasa por `waiting` (motivo `order`) y luego muestra visualmente
qué pidió; `pnpm test` cubre `pickRandomOrder`.

---

## Milestone 07 — Cocina y preparación

*Depende de: M06. El NPC está en `waiting` con motivo `food` durante todo este milestone.*

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
- [ ] Al recibir `delivered`, el NPC sale de `waiting` (motivo `food`).
- [ ] Indicador visual del cambio (ej. ícono de plato en la mesa).
- [ ] *(Tarea posterior, no imprescindible en este incremento)* Timeout de espera de comida (motivo `food`),
      reutilizando el timeout de M04: si se agota antes de `delivered`, dispara el mismo abandono enfadado.

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

*Depende de: M10. Reutiliza la infraestructura de salida (`leaving`, caminar a la puerta, despawn) agregada en
M04 para el abandono por espera; no la duplica.*

- [ ] Tras pagar, el NPC dispara la misma transición a `leaving` de M04 y camina de vuelta a la puerta.
- [ ] Llamar a `releaseTable` (M05) al entrar en `leaving`.
- [ ] Confirmar visualmente: la mesa liberada es ocupada por el primer NPC en cola (M04/M05) o por un cliente
      nuevo si no hay cola.

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

*Depende de: M11. `reputation` ya existe como estado del juego desde M04 (penalización por abandono); este
milestone agrega la recompensa positiva y confirma el HUD.*

- [ ] Regla simple: +1 reputación por cliente que completa el ciclo (llega a `leaving` tras pagar, no por
      abandono).
- [ ] Conectar el texto "Reputación: 0" ya existente al valor real.

**Completion criteria:** el número de reputación sube con cada cliente que se va tras pagar (y ya bajaba,
desde M04, con cada abandono por espera).

---

## Milestone 14 — Demanda basada en reputación

*Depende de: M13 (necesita recompensa y penalización de reputación funcionando para tener sentido).*

- [ ] Función pura que, dada la reputación actual, deriva el intervalo de spawn (o tasa de llegada) de NPCs.
- [ ] Límite de demanda mínima: intervalo máximo acotado, con llegada mínima garantizada incluso con
      reputación muy baja, para poder recuperarse tras una mala racha.
- [ ] Límite de demanda máxima: el intervalo no baja de un mínimo, para no desbordar el juego con NPCs
      ilimitados.
- [ ] Test: valores límite de reputación (mínimo y máximo) devuelven el intervalo mínimo/máximo esperado.
- [ ] Test: valores representativos de reputación intermedia devuelven un intervalo coherente.
- [ ] Reemplazar `NPC_SPAWN_INTERVAL_MS` fijo por esta función, evaluada contra la reputación actual.
- [ ] Confirmar visualmente: con reputación alta llegan más clientes que con reputación baja, sin generar
      NPCs sin límite.

**Completion criteria:** `pnpm test` cubre los límites y valores representativos de la función de demanda; en
el navegador, el intervalo de spawn responde a la reputación, siempre dentro de los límites definidos.

---

## Milestone 15 — Primera mejora comprable

*Depende de: M12. Con M14 (demanda basada en reputación) ya en pie, comprar mesas es la forma natural de
absorber la presión de la cola cuando la reputación sube.*

- [ ] Definir una mejora mínima comprable (ej. mesa+silla adicional) con costo fijo.
- [ ] Interacción mínima para comprarla (tecla o click, sin UI elaborada).
- [ ] Validar que el dinero alcanza antes de descontar.
- [ ] Confirmar visualmente: nueva mesa aparece tras la compra.

**Completion criteria:** se puede gastar `money` para agregar una mesa nueva, jugable en el navegador.

---

## Milestone 16 — Primer empleado

*Depende de: M15 (reutiliza el sistema de compra). Decisión abierta: qué hace exactamente
el primer empleado — a resolver antes de empezar este milestone.*

- [ ] Definir el efecto concreto del empleado (ej. acelera cocina o entrega).
- [ ] Costo fijo de contratación vía el sistema de compra de M15.
- [ ] Aplicar el efecto de forma medible.
- [ ] Confirmar visualmente o por tiempo que el efecto se aplica.

**Completion criteria:** contratar al empleado cambia observablemente el ritmo del loop.

---

## Milestone 17 — Primer loop completo

*Depende de: M06–M14 (integración, no sistemas nuevos).*

- [ ] Playtest manual del ciclo completo: entra → mesa → pide → cocina → recibe → come → paga → se va → dinero+reputación suben.
- [ ] Revisar y arreglar bugs de integración entre milestones (edge cases: cola vacía, mesa liberada dos veces, etc.).
- [ ] Confirmar que 2+ clientes completan el ciclo en paralelo sin bloquear la escena.
- [ ] Actualizar `PROJECT_STATE.md`: loop completo como "Working".

**Completion criteria:** loop jugable de principio a fin, reproducible, sin errores en consola.

---

## Milestones futuros (sin desglosar)

A definir cuando se acerquen: ciclo día/noche, más mejoras y empleados, variedad de
mobiliario/decoración, arte definitivo (reemplazar rectángulos placeholder).
