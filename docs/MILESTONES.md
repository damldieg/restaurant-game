# Table & Tale — Development Milestones

## How to use this document

- Las tareas se ejecutan en orden dentro de cada milestone, y los milestones en orden.
- Trabajar siempre en la primera tarea `[ ]` que esté desbloqueada (sin dependencias `[ ]`/`[-]` sin resolver antes).
- Cada tarea se verifica (test, `tsc --noEmit`, o chequeo visual en el navegador) antes de marcarla `[x]`.
- No saltar milestones ni implementar varias tareas grandes de una sola vez sin necesidad.
- Implementar una sola tarea por sesión, salvo pedido explícito de continuar.
- Estados: `[ ]` pendiente · `[x]` completada y verificada · `[-]` bloqueada (con motivo breve al lado).
- M00 es informativo: recapitula lo ya hecho, no tiene checkboxes ni se "trabaja" en él.

## Relación con PROJECT_STATE.md

`.juntia/PROJECT_STATE.md` = estado actual. `docs/MILESTONES.md` = roadmap. Al completar
una tarea que cambia el estado real del proyecto, actualizar ambos; no duplicar
descripciones largas entre los dos.

## Fantasía central del jugador

> Construir, personalizar y gestionar mi propio restaurante.

El orden de este roadmap prioriza que el jugador sienta pertenencia sobre su restaurante
(construir, comprar, decorar) **antes** de profundizar en la simulación de clientes. Cada
milestone describe explícitamente qué puede ver o hacer el jugador al terminarlo
("Player-visible outcome"), para evitar invertir tiempo en sistemas invisibles que no
mejoran la experiencia jugable.

---

## M00 — Foundation

*Informativo únicamente. No crear tareas a partir de esto. No agregar checkboxes.*

Ya implementado:

- Phaser + TypeScript + Vite + pnpm.
- Sistema de grid (`game/grid.ts`) y utilidades de conversión grid↔mundo.
- Escena de restaurante (`main.ts`) con suelo, paredes, puerta y renderizado de muebles.
- Modelo de datos de furniture (`game/restaurant.ts`) con `id`, `type`, `position`,
  `tableId` para sillas asociadas a su mesa.
- Renderizado genérico de muebles a partir de datos (sin sprites definitivos todavía).
- Entidad NPC (`game/npc/npc.ts`) con estados `walking | idle | seated`.
- `NpcController` (`game/npc/controller.ts`): spawn por temporizador, colección de NPCs
  activos, animación de entrada/asiento por NPC.
- Setup de testing con Vitest (`pnpm test`, 13/13 en verde).

---

## M01 — Furniture data and construction

*Primer milestone de trabajo real. Sin dependencias bloqueantes (usa M00).*

- [x] Crear catálogo de muebles comprables: `FurnitureDefinition { type, name, price }`
      (ej. mesa, silla), separado de las instancias ya colocadas en el restaurante.
- [x] Definir el precio de cada tipo de mueble del catálogo. (Mesa 100 / Silla 25 —
      decisión confirmada, ver `.juntia/DECISIONS.md`.)
- [x] Función pura `isValidPlacement(position, grid, existingFurniture)`: valida límites
      del grid y colisión con muebles existentes.
- [x] Test: colocación dentro de límites y sin colisión es válida.
- [x] Test: colocación fuera de límites es inválida.
- [x] Test: colocación sobre un mueble existente es inválida.
- [x] Modo de colocación: seleccionar un tipo de mueble del catálogo (tecla o click
      provisional, sin UI elaborada). (Tecla `1` selecciona Mesa; Silla queda en el
      catálogo con precio definido pero sin modo de colocación propio todavía, porque
      requiere un `tableId` que ninguna tarea de M01 pide recolectar.)
- [x] Preview del mueble siguiendo al cursor/celda antes de confirmar.
- [x] Cancelar colocación (ej. tecla Esc) sin agregar el mueble.
- [x] Confirmar colocación: agrega el mueble al mismo array `furniture` que ya usan
      NPCs/reservas (sin duplicar el modelo de datos existente).
- [x] Confirmar visualmente: el jugador puede previsualizar y colocar una mesa nueva en
      una celda vacía.

**Player-visible outcome:** el jugador elige una mesa del catálogo, ve una previsualización
que sigue al cursor, y la coloca en una celda libre del grid (todavía sin pagar — eso
llega en M02).

**Completion criteria:** `pnpm test` cubre `isValidPlacement`; en el navegador se puede
previsualizar, cancelar y colocar un mueble nuevo sin superponerlo a otros ni sacarlo del
grid.

---

## M02 — Economy foundation

*Depende de: M01 (necesita algo que comprar).*

- [x] `money` como estado real del juego (no solo texto), con un valor inicial. ($500 —
      decisión confirmada, ver `.juntia/DECISIONS.md`.)
- [x] Mostrar `money` en el HUD.
- [x] Función pura `canAfford(money, price)`.
- [x] Test: `canAfford` con fondos suficientes e insuficientes.
- [x] Al confirmar una colocación (M01), descontar el precio del mueble de `money`.
- [x] Impedir la colocación si no alcanza el dinero (usar `canAfford`).
- [x] Confirmar visualmente: comprar una mesa descuenta dinero visible en el HUD; sin
      fondos suficientes, la compra queda bloqueada.

**Player-visible outcome:** el jugador ve su dinero en el HUD, puede comprar y colocar una
mesa gastando ese dinero, y no puede comprarla si no le alcanza.

**Completion criteria:** `pnpm test` cubre `canAfford`; en el navegador el dinero baja al
comprar y la compra se bloquea sin fondos suficientes.

---

## M02.5 — Core simulation foundation

*Depende de: M01 y M02 (reorganiza su código existente). No agrega comportamiento nuevo — es
preparación arquitectónica antes de M03. Ver `.juntia/ARCHITECTURE.md` para el resultado
completo y `.juntia/DECISIONS.md` para la decisión arquitectónica que la origina.*

- [x] Crear la estructura inicial `src/core/`, `src/state/`, `src/systems/` (con un README
      breve cada una describiendo su rol; sin mover código todavía).
- [x] Mover a `src/core/` los módulos que ya no dependían de Phaser: `restaurant.ts`,
      `furniture-catalog.ts`, `economy.ts` (`canAfford`) y `placement.ts`
      (`isValidPlacement`), con sus tests. Actualizar los imports en `main.ts` y
      `game/npc/controller.ts`.
- [x] Test: la suite completa sigue en verde tras el movimiento, sin cambios en las
      aserciones existentes.
- [x] Crear `GameState` inicial (`src/state/game-state.ts`), componiendo únicamente datos ya
      existentes (`money`, `furniture`) — sin inventar campos para sistemas futuros.
- [x] `RestaurantScene` (`main.ts`) reemplaza su campo `money` suelto y el import directo de
      `furniture` por `this.gameState.money` / `this.gameState.furniture`.
- [x] Confirmar que el comportamiento no cambió: comprar una mesa sigue descontando dinero y
      bloqueándose sin fondos, igual que en M02 (verificado en navegador).
- [x] Definir el contrato `GameSystem` (`src/systems/game-system.ts`): `update(state,
      deltaMs)` + `runSystems(state, deltaMs, systems)`, sin implementar ningún sistema real
      todavía.
- [x] Agregar `update(time, delta)` a `RestaurantScene`, que llama a `runSystems` con la lista
      de sistemas vacía en cada frame — el flujo `Phaser update(delta) → Game systems update →
      GameState` queda armado y operativo, aunque no haga nada todavía.
- [x] Documentar la arquitectura resultante en `.juntia/ARCHITECTURE.md` y registrar la
      decisión arquitectónica en `.juntia/DECISIONS.md`.

**Player-visible outcome:** el jugador no verá grandes cambios visuales, pero la arquitectura
queda preparada para añadir reputación, clientes, cocina y empleados sin mezclar lógica de
negocio con Phaser.

**Completion criteria:** `pnpm test` en verde (23/23, misma cobertura de comportamiento que al
cierre de M02 más los tests nuevos de `GameState`/`GameSystem`); `tsc --noEmit` limpio; ningún
archivo de `src/core/` importa `phaser`; en el navegador el juego se comporta igual que al
cierre de M02 (compra de mesas, HUD de dinero, NPCs).

---

## M03 — Reputation foundation

*Depende de: M01 (necesita muebles con valor de reputación).*

- [ ] `reputation` como estado real del juego (no solo texto), con un valor inicial.
- [ ] Agregar un valor de reputación a cada `FurnitureDefinition` del catálogo (M01).
- [ ] Función pura que calcula la reputación total a partir de los muebles colocados.
- [ ] Test: reputación total con 0, 1 y varios muebles colocados.
- [ ] Recalcular la reputación total cada vez que se coloca un mueble nuevo.
- [ ] Conectar el texto "Reputación: 0" del HUD (`main.ts:90`) al valor real, reemplazando
      el placeholder fijo.
- [ ] Confirmar visualmente: colocar un mueble con reputación positiva sube el número en
      el HUD.

**Player-visible outcome:** el jugador ve la reputación del restaurante en el HUD, y
colocar muebles la hace subir.

**Completion criteria:** `pnpm test` cubre el cálculo de reputación total; en el navegador
el número del HUD sube al colocar un mueble.

---

## M04 — Basic customer lifecycle

*Objetivo: cliente entra → encuentra mesa → se sienta → se queda → se va. Depende de M00
(usa el furniture existente, hardcodeado o comprado — no depende de M01/M02 para
funcionar).*

### Ya completado (heredado de los antiguos M01–M03)

- [x] Agregar `id` a cada elemento de `Furniture`.
- [x] Agregar `tableId` a las sillas, asociándolas a su mesa.
- [x] Crear `getSeatForTable(table)` usando `tableId` (reemplaza el supuesto "fila de
      abajo").
- [x] Reemplazar `getSeatPosition` por `getSeatForTable` en `restaurant.ts`.
- [x] Actualizar `main.ts` si cambia el tipo de retorno.
- [x] Actualizar tests unitarios de `restaurant.ts` para la nueva asociación.
- [x] Agregar una segunda mesa + silla a `furniture`, con `id`/`tableId`.
- [x] Confirmar visualmente que ambas mesas y sillas se renderizan.
- [x] Extender test de `findFreeTable` a 2 mesas (una ocupada, otra libre).
- [x] Test: `getSeatForTable` correcto para ambas mesas.
- [x] Agregar `id` a `Npc`.
- [x] Reemplazar el spawn único por un timer (`this.time.addEvent`) que spawnee cada N
      segundos.
- [x] Reemplazar `this.npc`/`this.npcSprite` de la escena por una colección de NPCs
      activos + sprites asociados (extraído a `game/npc/controller.ts`, `NpcController`).
- [x] Animación de múltiples NPCs activos en simultáneo: cada uno recibe su propio tween
      de entrada/asiento al spawnear, gestionado por Phaser.
- [x] Confirmar visualmente: 2+ clientes entrando y sentándose en mesas distintas.

### Pendiente: quedarse y salir

- [ ] Agregar estado `leaving` a `NpcState` y la infraestructura genérica de salida:
      caminar hacia la puerta y despawnear al llegar (reutilizable; M05, M09 y M15 la
      reusan sin duplicarla).
- [ ] Temporizador fijo de "stay" (tiempo que el NPC permanece sentado antes de irse) —
      placeholder mínimo, sin comida/pedido todavía.
- [ ] Al vencer el temporizador de stay, el NPC dispara la transición a `leaving`.
- [ ] Al entrar en `leaving`, liberar la mesa ocupada (placeholder simple; M06 lo
      robustece con el módulo de reservas).
- [ ] Confirmar visualmente: un cliente entra, se sienta, permanece un tiempo fijo, y se
      va por la puerta.

**Player-visible outcome:** el jugador ve un cliente entrar, sentarse en una mesa, quedarse
un rato y luego irse por la puerta.

**Completion criteria:** `pnpm test` en verde (13/13 heredados + nuevos); en el navegador
un cliente completa el ciclo entrar→sentarse→quedarse→salir sin intervención manual.

---

## M05 — Waiting and satisfaction

*Depende de: M04 (necesita mesas, asientos y la infraestructura de `leaving`) y M03
(reutiliza `reputation`).*

- [ ] Agregar estado `waiting` a `NpcState`.
- [ ] Agregar motivo de espera y datos de paciencia reiniciables al `Npc` (p. ej.
      `waitingReason: 'table' | 'order' | 'food'` + inicio/límite de espera). Es el único
      concepto de espera del juego: M09/M11 reutilizan el mismo mecanismo para los otros
      dos motivos.
- [ ] Definir posiciones de cola (distintas de `entryTarget`), una por NPC en espera.
- [ ] NPC sin mesa libre pasa a `waiting` con motivo `table`, ubicado en su posición de
      cola, sin superponerse a otros.
- [ ] Cola FIFO: función pura que, dada la lista de NPCs en `waiting` con motivo `table`,
      determina cuál debe ocupar la próxima mesa disponible.
- [ ] Test unitario puro de la función FIFO.
- [ ] Timeout de espera de mesa: función pura que, dado el inicio de espera, el límite de
      paciencia y el tiempo transcurrido, determina si corresponde abandonar.
- [ ] Test unitario puro del timeout.
- [ ] Abandono enfadado: al vencer el timeout de espera de mesa, el NPC dispara la
      transición a `leaving` (reutiliza la infraestructura de M04, no la duplica).
- [ ] Penalización única de reputación al abandonar por espera de mesa (reutiliza
      `reputation` de M03): se aplica una sola vez al disparar el abandono, nunca de
      forma acumulativa por frame/segundo.
- [ ] Test unitario puro: un abandono resta reputación exactamente una vez.
- [ ] Recompensa de reputación por cliente que completa el ciclo normalmente (llega a
      `leaving` tras quedarse, no por abandono).
- [ ] Test unitario puro: un cliente que se queda y se va suma reputación exactamente una
      vez.
- [ ] Si una mesa se libera y hay NPCs en `waiting` por mesa, el primero de la cola (FIFO)
      la ocupa y deja de esperar (función pura + test con datos simulados).
- [ ] Confirmar visualmente: con todas las mesas ocupadas, los NPCs siguientes esperan en
      fila sin superponerse; un NPC que espera demasiado sale enfadado por la puerta y la
      reputación baja exactamente una vez; un cliente que se queda y se va normalmente
      sube la reputación.

**Player-visible outcome:** el jugador puede llenar el restaurante y ver clientes
esperando en fila; si esperan demasiado se van enfadados y la reputación baja; los que sí
llegan a sentarse y se van normalmente suben la reputación.

**Completion criteria:** `pnpm test` cubre la cola FIFO, el timeout y ambas variaciones de
reputación (penalización y recompensa, cada una aplicada exactamente una vez); en el
navegador, con 2 mesas y 3+ clientes, se ve la cola, el abandono enfadado y ambos cambios
de reputación.

---

## M06 — Reservas robustas (hardening)

*Depende de: M05. Endurece lo construido en M01–M05 antes de seguir; no agrega
comportamiento nuevo visible. Milestone insertado al reordenar (antes vivía justo después
del actual M04); ver nota en el resumen de la sesión que lo agregó.*

- [ ] Extraer reservas a `game/reservations.ts`: `reserveTable`, `releaseTable`,
      `isTableReserved`.
- [ ] Test: reservar una mesa ya reservada no tiene efecto (evita doble reserva).
- [ ] Reemplazar el tracking ad hoc de mesas ocupadas en `game/npc/controller.ts` por el
      nuevo módulo.
- [ ] `findFreeTable` usa el módulo de reservas en vez de recibir la lista por parámetro.
- [ ] `releaseTable` invoca la función FIFO de M05 para que, al liberar una mesa, el
      primer NPC en cola la ocupe automáticamente.
- [ ] Test: liberar una mesa con NPCs en `waiting` (motivo `table`) asigna la mesa al
      primero (FIFO) y lo saca de `waiting`.

**Player-visible outcome:** ninguno nuevo — el comportamiento de M04–M05 se mantiene
igual, pero corre sobre reservas centralizadas sin lógica duplicada, como base sólida para
los milestones siguientes.

**Completion criteria:** `pnpm test` cubre reservas y la integración liberación↔cola FIFO
de M05; no queda lógica de mesas ad hoc en `game/npc/controller.ts`.

---

## M07 — Demand

*Depende de: M03 (reputación) y M06 (reservas estables).*

- [ ] Función pura que, dada la reputación actual, deriva el intervalo de spawn (o tasa
      de llegada) de NPCs.
- [ ] Límite de demanda mínima: intervalo máximo acotado, con llegada mínima garantizada
      incluso con reputación muy baja, para poder recuperarse tras una mala racha.
- [ ] Límite de demanda máxima: el intervalo no baja de un mínimo, para no desbordar el
      juego con NPCs ilimitados.
- [ ] Test: valores límite de reputación (mínimo y máximo) devuelven el intervalo
      mínimo/máximo esperado.
- [ ] Test: valores representativos de reputación intermedia devuelven un intervalo
      coherente.
- [ ] Reemplazar `NPC_SPAWN_INTERVAL_MS` fijo por esta función, evaluada contra la
      reputación actual.
- [ ] Confirmar visualmente: con reputación alta llegan más clientes que con reputación
      baja, sin generar NPCs sin límite.

**Player-visible outcome:** el jugador ve que, a medida que sube la reputación del
restaurante, llegan más clientes con más frecuencia (dentro de un límite).

**Completion criteria:** `pnpm test` cubre los límites y valores representativos de la
función de demanda; en el navegador, el intervalo de spawn responde a la reputación.

---

## M08 — Waiters

*Depende de: M04 (necesita clientes sentados a los que caminar).*

- [ ] Crear entidad `Waiter` con `id`, posición y estado `idle`.
- [ ] Marcar un cliente sentado como "solicita atención" (placeholder simple, sin pedido
      real todavía — M09 lo conecta a pedidos reales).
- [ ] El camarero detecta el primer cliente que solicita atención.
- [ ] Reservar ese cliente (evita que dos camareros lo atiendan a la vez).
- [ ] Test: un cliente ya reservado por un camarero no puede ser reservado por otro.
- [ ] Camarero camina hacia el cliente reservado.
- [ ] Al llegar, "atenderlo" (placeholder: quitar la marca de "solicita atención") y
      volver a `idle`.
- [ ] Confirmar visualmente: un camarero (sprite provisional) camina hacia un cliente
      sentado y vuelve a esperar.

**Player-visible outcome:** el jugador ve un camarero moverse desde su posición inicial
hacia un cliente sentado y volver a esperar.

**Completion criteria:** `pnpm test` cubre la reserva exclusiva de clientes; en el
navegador el camarero recorre hasta un cliente y vuelve a `idle`.

---

## M09 — Orders

*Depende de: M08 (camarero real) y M05 (mecanismo de espera).*

- [ ] Crear `game/menu.ts`: `MenuItem { id, name }`, lista mínima (2–3 platos, sin precio
      todavía).
- [ ] `pickRandomOrder(menu): MenuItem`, función pura.
- [ ] Test: `pickRandomOrder` siempre devuelve un ítem del menú dado.
- [ ] Al llegar a `seated`, el NPC pasa a `waiting` con motivo `order` (mismo mecanismo de
      espera de M05).
- [ ] Cuando el camarero (M08) atiende a un cliente en `waiting`/`order`, le asigna un
      pedido (`pickRandomOrder`) y el cliente pasa a `waiting` con motivo `food`.
- [ ] Indicador visual (texto) sobre el NPC con su pedido.
- [ ] *(Tarea posterior, no imprescindible en este incremento)* Timeout de espera de
      pedido (motivo `order`), reutilizando el timeout de M05.

**Player-visible outcome:** el jugador ve al camarero tomar el pedido de un cliente
sentado, y el pedido aparece como texto sobre el cliente.

**Completion criteria:** cada cliente sentado pasa por `waiting` (motivo `order`), es
atendido por un camarero y muestra visualmente qué pidió; `pnpm test` cubre
`pickRandomOrder`.

---

## M10 — Recipes

*Sin dependencias de gameplay — son datos de definición usados recién en M11.*

- [ ] Crear `RecipeDefinition { id, name, price, preparationTime, quality, station }`.
- [ ] Crear una primera receta de prueba (ej. Hamburguesa) con esos campos.
- [ ] Test: la receta de prueba tiene todos los campos requeridos con valores válidos.

**Player-visible outcome:** ninguno todavía — son datos de definición; preparan el terreno
para que M11 (Cocina) tenga algo real que cocinar.

**Completion criteria:** `pnpm test` cubre la validez de la receta de prueba.

---

## M11 — Kitchen

*Depende de: M09 (pedidos reales) y M10 (recetas). La preparación debe durar segundos, no
minutos — el juego es relajado y con simulación acelerada.*

- [ ] Crear entidad `CookingStation` con `id`, tipo y estado `idle`.
- [ ] Función pura `canCookRecipe(station, recipe)`: valida que la estación soporte la
      receta.
- [ ] Test: `canCookRecipe` con estación compatible e incompatible.
- [ ] Modelar el pedido como estado: `ordered → cooking → ready`.
- [ ] Al recibir un pedido (`waiting`/`food`, de M09), reservar una estación libre e
      iniciar `cooking`.
- [ ] Temporizador de preparación usando `preparationTime` de la receta (M10).
- [ ] Al vencer el temporizador, el pedido pasa a `ready` y la estación vuelve a `idle`.
- [ ] Test: transición `cooking → ready` dado el tiempo transcurrido.
- [ ] Indicador visual de "cocinando" / "listo" sobre la estación o el pedido.
- [ ] Confirmar visualmente: un pedido pasa de cocinando a listo tras un tiempo corto
      (segundos).

**Player-visible outcome:** el jugador ve una estación de cocina pasar de inactiva a
cocinando y luego a lista, en unos pocos segundos.

**Completion criteria:** `pnpm test` cubre `canCookRecipe` y la transición
`cooking → ready`; en el navegador el pedido de cada cliente cambia visualmente de estado.

---

## M12 — Food delivery

*Depende de: M11 (comida lista) y M08 (camarero real).*

- [ ] Camarero detecta un pedido en estado `ready`.
- [ ] Camarero recoge la comida (placeholder: sin animación de "cargar bandeja" todavía).
- [ ] Camarero camina hacia el cliente y entrega la comida; el pedido pasa a `delivered`.
- [ ] Al recibir `delivered`, el NPC sale de `waiting` (motivo `food`).
- [ ] Indicador visual del cambio (ej. ícono de plato en la mesa).
- [ ] *(Tarea posterior, no imprescindible en este incremento)* Timeout de espera de
      comida (motivo `food`), reutilizando el timeout de M05: si se agota antes de
      `delivered`, dispara el mismo abandono enfadado.
- [ ] Confirmar visualmente: el camarero recoge la comida lista y la lleva hasta el
      cliente correspondiente.

**Player-visible outcome:** el jugador ve al camarero llevar la comida lista desde la
cocina hasta el cliente que la pidió.

**Completion criteria:** la comida "servida" es visible en pantalla poco después de estar
lista, transportada por el camarero.

---

## M13 — Eating

*Depende de: M12.*

- [ ] Agregar estado `eating` a `NpcState`.
- [ ] Al recibir `delivered`, el NPC pasa a `eating`.
- [ ] Temporizador fijo de consumo.
- [ ] Indicador visual de "comiendo".

**Player-visible outcome:** el jugador ve al cliente pasar de sentado a "comiendo" tras
recibir su comida.

**Completion criteria:** el cliente pasa visualmente por `seated → eating` tras recibir su
comida.

---

## M14 — Payment

*Depende de: M13 y M02 (necesita `money` ya existente).*

- [ ] Agregar `price` a cada `MenuItem`.
- [ ] Función pura que calcula el monto a pagar al terminar `eating`.
- [ ] Test: el monto calculado coincide con el precio del pedido.
- [ ] Mostrar el pago en pantalla (temporal, ej. texto flotante).
- [ ] Sumar el pago al `money` del jugador (reutiliza el estado de M02).
- [ ] Confirmar visualmente: al terminar de comer, se muestra el monto y el dinero del
      HUD sube.

**Player-visible outcome:** el jugador ve el monto pagado por el cliente y cómo sube el
dinero en el HUD.

**Completion criteria:** `pnpm test` cubre el cálculo del monto; en el navegador el dinero
del HUD sube al terminar de comer un cliente.

---

## M15 — Exit / release table

*Depende de: M14, M06 (reservas) y M04 (infraestructura de `leaving`).*

- [ ] Tras pagar, el NPC dispara la misma transición a `leaving` de M04 y camina de vuelta
      a la puerta.
- [ ] Llamar a `releaseTable` (M06) al entrar en `leaving`.
- [ ] Confirmar visualmente: la mesa liberada es ocupada por el primer NPC en cola
      (M05/M06) o por un cliente nuevo si no hay cola.

**Player-visible outcome:** el jugador ve al cliente salir por la puerta tras pagar, y la
mesa liberada es ocupada por el siguiente cliente en cola.

**Completion criteria:** ciclo mesa ocupada → liberada → reocupada, visible con 2+
clientes.

---

## M16 — First employee

*Depende de: M01/M02 (sistema de compra) y M11/M12 (algo que un empleado pueda acelerar).
Decisión abierta: qué hace exactamente el primer empleado — a resolver antes de empezar
este milestone.*

- [ ] Definir el efecto concreto del empleado (ej. acelera cocina o entrega).
- [ ] Costo fijo de contratación vía el sistema de compra de M01/M02.
- [ ] Aplicar el efecto de forma medible.
- [ ] Confirmar visualmente o por tiempo que el efecto se aplica.

**Player-visible outcome:** el jugador puede contratar a un empleado y notar un cambio
observable en el ritmo del loop (cocina o entrega más rápida).

**Completion criteria:** contratar al empleado cambia observablemente el ritmo del loop.

---

## M17 — First complete loop

*Depende de: M01–M16 (integración, no sistemas nuevos).*

- [ ] Playtest manual del ciclo completo: construir/comprar mesa → cliente entra → mesa →
      camarero → pedido → cocina → recibe → come → paga → se va → dinero+reputación
      suben.
- [ ] Revisar y arreglar bugs de integración entre milestones (edge cases: cola vacía,
      mesa liberada dos veces, etc.).
- [ ] Confirmar que 2+ clientes completan el ciclo en paralelo sin bloquear la escena.
- [ ] Actualizar `PROJECT_STATE.md`: loop completo como "Working".

**Player-visible outcome:** el jugador puede jugar el ciclo completo de principio a fin,
de forma reproducible, sin errores en consola.

**Completion criteria:** loop jugable de principio a fin, reproducible, sin errores en
consola.

---

## Milestones futuros (sin desglosar)

A definir cuando se acerquen: ciclo día/noche, más mejoras y empleados, variedad de
mobiliario/decoración, arte definitivo (reemplazar rectángulos placeholder).
