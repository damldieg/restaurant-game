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

- [x] `reputation` como estado real del juego (no solo texto), con un valor inicial. (0 —
      decisión confirmada, ver `.juntia/DECISIONS.md`.)
- [x] Agregar un valor de reputación a cada `FurnitureDefinition` del catálogo (M01). (Mesa
      +3 / Silla +1 — decisión confirmada, ver `.juntia/DECISIONS.md`.)
- [x] Función pura que calcula la reputación total a partir de los muebles colocados.
- [x] Test: reputación total con 0, 1 y varios muebles colocados.
- [x] Recalcular la reputación total cada vez que se coloca un mueble nuevo. (Vía
      `ReputationSystem`, el primer `GameSystem` real, evaluado cada frame.)
- [x] Conectar el texto "Reputación: 0" del HUD (`main.ts:90`) al valor real, reemplazando
      el placeholder fijo.
- [x] Confirmar visualmente: colocar un mueble con reputación positiva sube el número en
      el HUD.

**Player-visible outcome:** el jugador ve la reputación del restaurante en el HUD, y
colocar muebles la hace subir.

**Completion criteria:** `pnpm test` cubre el cálculo de reputación total; en el navegador
el número del HUD sube al colocar un mueble.

---

## M03.5 — Customer architecture review

*Depende de: M03. No agrega funcionalidad de juego — es análisis y planificación antes de M04,
para reducir el riesgo de introducir la primera entidad simulada compleja (clientes) sin mezclar
lógica de negocio con Phaser. Ver `.juntia/ARCHITECTURE.md` (sección "Próxima extensión:
Customer") para el análisis completo y `.juntia/DECISIONS.md` para la decisión arquitectónica
que produce.*

- [x] Analizar `game/npc/npc.ts` y `game/npc/controller.ts`: qué es lógica de simulación pura,
      qué es renderizado Phaser, qué está mezclado, y qué riesgos concretos tiene separarlos.
- [x] Documentar la separación entre Customer simulation y Customer rendering (ver
      `.juntia/ARCHITECTURE.md`, sección "Principio de propiedad del estado").
- [x] Definir la forma conceptual futura de `CustomerState` — sin implementarla todavía:
      ```
      Customer:
        - id
        - position
        - state
        - target
        - tableId
      ```
- [x] Definir la responsabilidad futura de `CustomerSystem`: estados, transiciones, timers y
      movimiento lógico. NO sprites, tweens ni animaciones.
- [x] Definir la responsabilidad futura de `CustomerRenderer` (hoy `game/npc/controller.ts`):
      representar posición, animaciones e interpolación visual. NO estados, transiciones ni
      timers.
- [x] Definir una estrategia incremental de pasos pequeños y testeables para M04 (sin big-bang
      refactor).
- [x] Identificar qué partes del NPC actual quedan intactas por ahora (`occupiedTables`,
      constantes de presentación, `findFreeTable` leyendo el export de módulo) y por qué.
- [x] Confirmar la decisión de arquitectura para `Customer` (`data_model_change`, ver
      `.juntia/DECISIONS.md`): `core/customers/` (`customer.ts` + `customer-state.ts`) +
      `GameState.customers[]` + `systems/customer-system.ts` + `game/npc/controller.ts` reducido
      a lector puro de `state.customers`.
- [x] Confirmar el principio de propiedad del estado (ver `.juntia/DECISIONS.md`): la simulación
      es la fuente de verdad; Phaser no controla transiciones de estado mediante tweens,
      callbacks ni eventos visuales.

**Player-visible outcome:** el jugador no verá cambios visuales. Esta fase prepara la base para
que los clientes puedan existir como entidades simuladas independientes de Phaser.

**Completion criteria:** `.juntia/ARCHITECTURE.md` documenta la extensión propuesta para
`Customer`; `.juntia/DECISIONS.md` registra la decisión arquitectónica confirmada; ningún archivo
de `src/` cambia de comportamiento; `pnpm test` sigue en verde sin modificaciones.

---

## M04 — Basic customer lifecycle

*Depende de M00 (usa el furniture existente, hardcodeado o comprado) y de M03.5 (arquitectura
de `Customer` confirmada: la simulación es la fuente de verdad del estado del cliente; Phaser
solo renderiza, anima e interpola visualmente — nunca dispara una transición de estado desde un
tween o un callback).*

**Player-visible outcome (milestone completo):** el jugador podrá ver clientes entrar al
restaurante, encontrar una mesa, sentarse y abandonar el restaurante. La implementación es
progresiva (M04.1–M04.8) y la simulación está separada de Phaser en cada paso.

M04 es un plan incremental de tareas pequeñas, cada una testeable y verificable por separado —
trabajar siempre en la primera `M04.x` con estado pendiente, sin saltar pasos.

---

### M04.1 — Customer entity

**Estado: completado.**

- [x] Crear `Customer` en `core/` (`core/customers/customer.ts` + `customer-state.ts`).
- [x] `Customer` independiente de Phaser.
- [x] Estados iniciales definidos (`CustomerState = "walking" | "idle" | "seated"`).
- [x] Tests creados (`customer.test.ts`: creación + los tres estados iniciales).

Verificado: `pnpm test` (32/32) y `tsc --noEmit` limpios; `Npc`/`NpcState`/`NpcController`/
`RestaurantScene`/rendering/`occupiedTables`/`findFreeTable` sin cambios.

---

### M04.2 — CustomerSystem base

**Estado: completado.**

**Objetivo:** crear el sistema de simulación de clientes.

- [x] Crear `CustomerSystem` siguiendo el contrato `GameSystem` (`update(state, deltaMs)`,
      sin depender de Phaser).
- [x] Añadir `GameState.customers[]` (vacío en `createGameState`, mismo patrón que
      `reputation`).
- [x] Integrar `CustomerSystem` en `runSystems` (registrado en `RestaurantScene.systems`,
      `main.ts`).
- [x] No añadir todavía comportamiento — `CustomerSystem.update` es un no-op intencional, el
      punto de extensión correcto para M04.3.

**Player-visible outcome:** sin cambios visibles. La arquitectura queda preparada.

Verificado: `pnpm test` (33/33) y `tsc --noEmit` limpios; `NpcController` intacto;
`RestaurantScene` solo cambia para registrar el sistema.

---

### M04.3 — Customer spawning lógico

**Estado: completado.**

**Objetivo:** crear clientes dentro de la simulación.

- [x] Crear función `spawnCustomer(id)` (`core/customers/customer.ts`) — construye un
      `Customer` en la puerta, estado `walking`.
- [x] Añadir cliente a `GameState.customers` — `CustomerSystem.update` acumula `deltaMs` y
      llama `spawnCustomer` cada `SPAWN_INTERVAL_MS` (2500ms, mismo ritmo que
      `NpcController`/`NPC_SPAWN_INTERVAL_MS` — decisión confirmada, ver `.juntia/DECISIONS.md`).
- [x] Definir posición inicial lógica (`DOOR_POSITION`, derivada de `RESTAURANT_COLS`/
      `RESTAURANT_ROWS`, mismo cálculo que usaba `NpcController.spawnNpc()`, ahora puro).
- [x] Crear tests de spawn (`customer.test.ts`: `spawnCustomer`; `customer-system.test.ts`: no
      spawnea antes del intervalo, spawnea al alcanzarlo entre llamadas, spawnea varios con ids
      únicos si pasa mucho `deltaMs` de una vez).

**No:** sprites; Phaser; movimiento visual. (Ninguno de los dos se tocó.)

**Player-visible outcome:** sin cambio visual — verificado en navegador (Playwright, 6s / 2+
intervalos de spawn): mismo HUD, mismo NPC visible, sin errores de consola. `Customer` no se
renderiza todavía (no existe `CustomerRenderer`), así que los clientes simulados son invisibles
por diseño.

Verificado: `pnpm test` (36/36) y `tsc --noEmit` limpios; `NpcController`/`RestaurantScene`/
`GameState`/`main.ts` sin cambios.

---

### M04.4 — Customer rendering

**Estado: completado.**

**Objetivo:** representar clientes existentes en Phaser.

- [x] Crear renderer separado (`CustomerRenderer`, o `game/npc/controller.ts` reducido a esto).
- [x] Leer `GameState.customers`.
- [x] Crear sprite cuando existe un `Customer` nuevo.
- [x] Actualizar posición visual desde el estado.

**Regla:** el renderer nunca modifica `CustomerState` — solo lee `GameState` y dibuja.

`game/npc/` (`Npc`/`NpcState`/`NpcController`) se eliminó por completo — decisión de arquitectura
ya confirmada en M03.5 (ver `.juntia/DECISIONS.md`: "`game/npc/controller.ts` reducido a lector
puro de `state.customers`"). `CustomerRenderer` (`game/customers/customer-renderer.ts`) es su
reemplazo directo: mismo estilo visual (rectángulo 22×28, color `0xc97a5b`), sin tweens ni
`occupiedTables`/`findFreeTable` (esa lógica de asignación de mesa vuelve en M04.6, ya dentro de
`CustomerSystem`). `main.ts` ya no instancia `NpcController` ni tiene su propio timer de spawn
(`NPC_SPAWN_INTERVAL_MS`) — `RestaurantScene.update` llama `customerRenderer.update(state.
customers)` cada frame, después de `runSystems`.

**Player-visible outcome:** el jugador puede ver clientes generados — verificado en navegador
(Playwright, 6s / 2+ intervalos de spawn): aparece un sprite de cliente sobre la puerta (todos
los clientes se apilan en la misma posición, ya que `CustomerSystem` todavía no simula movimiento
— eso llega en M04.5), HUD y muebles sin cambios, sin errores de consola. El caminar/sentarse
animado que antes daba `NpcController` desaparece intencionalmente hasta que M04.5–M04.7 lo
repongan simulado.

`CustomerRenderer.update` también destruye y descarta el sprite de cualquier id que ya no esté
en `state.customers` (evita memory leaks una vez que M04.8 empiece a despawnear clientes), y
nunca muta los objetos `Customer` que lee. Tests en `customer-renderer.test.ts` (mock de
`Phaser.Scene`, sin canvas/WebGL real): crea sprite nuevo, no duplica uno existente, actualiza
posición, destruye el sprite de un cliente que desaparece, no lo recrea después, no muta
`Customer`.

Verificado: `pnpm test` (40/40 — 36 - 2 de `npc.test.ts` eliminado + 6 de
`customer-renderer.test.ts`) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M04.5 — Customer movement simulation

**Estado: completado.**

**Objetivo:** mover clientes mediante simulación.

- [x] Añadir `target: GridPosition | null` al `Customer` (`core/customers/customer.ts`).
- [x] Añadir velocidad — `CUSTOMER_SPEED_TILES_PER_SEC = 1.5` tiles/seg (decisión confirmada,
      ver `.juntia/DECISIONS.md`).
- [x] Actualizar posición mediante `deltaMs` en `CustomerSystem` — `moveCustomer(customer,
      deltaMs)`, función pura que interpola la posición hacia `target` según velocidad y
      `deltaMs`, sin mutar el `Customer` original.
- [x] Detectar llegada al objetivo dentro de la simulación: cuando el paso alcanzable en este
      `deltaMs` cubre o supera la distancia restante, la posición se ajusta exactamente al
      `target`, `target` se limpia (`null`), y un `Customer` en `walking` pasa a `idle` (sin
      mesa asignada todavía — eso llega en M04.6/M04.7).
- [x] Tests de movimiento lógico (`customer.test.ts`: sin target no se mueve, se mueve
      proporcionalmente sin llegar, hace snap exacto al target y lo limpia al llegar, pasa de
      `walking` a `idle` al llegar, no muta el `Customer` original; `customer-system.test.ts`:
      un cliente recién spawneado se mueve en updates posteriores, llega a `idle` con `target`
      en `null`).

`spawnCustomer` ahora fija `target: ENTRY_TARGET` (mismo punto que usaba
`NpcController.spawnNpc()` como `entryTarget`, ahora como destino real de la simulación en vez
de un tween de Phaser). `CustomerRenderer` (M04.4) no cambió — ya reposicionaba el sprite desde
`Customer.position` cada frame.

**No usar:** tween de Phaser como fuente de verdad de la posición. (No se usó — `moveCustomer`
es una función pura sin dependencia de Phaser.)

**Player-visible outcome:** los clientes se desplazan correctamente — verificado en navegador
(Playwright, screenshots a 1s/3s/6s/8s): un cliente aparece cerca de la puerta y se lo ve
avanzar claramente hacia el mostrador entre capturas consecutivas antes de quedar quieto
(llegada + transición a `idle`); HUD y muebles sin cambios; sin errores de consola.

Verificado: `pnpm test` (49/49) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M04.6 — Find and reserve table

**Estado: completado.**

**Objetivo:** un cliente puede encontrar mesa.

- [x] Integrar `findFreeTable`/`getSeatForTable` en `CustomerSystem` — vía la nueva función pura
      `assignTables(customers, furnitureList)` (`core/customers/customer.ts`), llamada desde
      `CustomerSystem.update` justo después de `moveCustomer`.
- [x] Asignar `tableId` al `Customer` — `Customer` gana `tableId: string | null`. Un customer
      `idle` sin mesa (recién llegado a `ENTRY_TARGET`, per M04.5) recibe la primera mesa libre;
      `target` pasa al asiento (`getSeatForTable`) y `state` vuelve a `walking` para que
      `moveCustomer` lo lleve hasta ahí. Sin mesa libre, el customer se queda `idle` sin mesa.
- [x] Evitar doble asignación de la misma mesa — `assignTables` lleva una lista de posiciones ya
      ocupadas (semillada desde los `tableId` ya asignados) y la va extendiendo en la misma
      pasada, así que dos customers que llegan en el mismo frame nunca reciben la misma mesa.
- [x] Mantener reservas consistentes con el `occupiedTables` actual — no existe ya un
      `occupiedTables` propio (se eliminó junto con `NpcController` en M04.4); la ocupación se
      deriva de `state.customers` (qué `tableId` ya está tomado) cada frame, sin lista aparte que
      pueda desincronizarse.

**No solucionar todavía:** sistema completo de reservas; la transición `walking → seated` al
llegar al asiento (M04.7) — un customer que llega a su mesa hoy vuelve a `idle`, parado en el
asiento, no `seated`.

**Player-visible outcome:** el cliente tiene una mesa asignada — verificado en navegador
(Playwright, screenshots espaciados en una corrida de ~13s): los clientes llegan a la entrada y
luego se los ve dividirse visiblemente hacia una de las dos mesas del layout inicial, sin
superponerse en la misma mesa; HUD y muebles sin cambios; sin errores de consola.

Verificado: `pnpm test` (59/59) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M04.7 — Sit down state

**Estado: completado.**

**Objetivo:** cliente sentado.

- [x] Añadir transición `walking → seated` en la simulación — dentro de la rama de llegada de
      `moveCustomer` (`core/customers/customer.ts`), no en un `onComplete` de tween. `Asociar
      el cliente con su mesa (tableId)` y `liberar el movimiento (target a null)` ya estaban
      resueltos por M04.6/M04.5 respectivamente, así que el único cambio real fue distinguir,
      en esa rama de llegada, a qué llegó el customer: con `tableId` ya asignado (llegó a su
      asiento, per `assignTables`/M04.6) pasa a `seated`; sin `tableId` (llegó a
      `ENTRY_TARGET`) sigue pasando a `idle`, como antes.
- [x] Asociar el cliente con su mesa (`tableId`) — ya resuelto en M04.6, sin cambios aquí.
- [x] Liberar el movimiento (`target` a `null` al llegar) — ya resuelto en M04.5, sin cambios
      aquí.
- [x] Preparar el terreno para estados futuros (`waiting`, `eating`, etc.) — `CustomerState`
      ya soporta `seated` desde M04.1; ningún cambio de forma de datos fue necesario.

Ningún archivo fuera de `moveCustomer` cambió de comportamiento — `CustomerSystem`,
`assignTables` y `CustomerRenderer` quedaron intactos; el pipeline `spawn → move →
assignTables` de `CustomerSystem.update` no se tocó.

**Player-visible outcome:** el cliente llega y se sienta — verificado en navegador (Playwright,
screenshots espaciados en una corrida de ~18s): los sprites de los clientes llegan a una de las
dos sillas del layout inicial y se quedan quietos ahí (sin seguir desplazándose ni superponerse
más allá de ese punto); HUD y muebles sin cambios; sin errores de consola.

Verificado: `pnpm test` (61/61) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M04.8 — Stay timer and leaving

**Estado: completado.** Cierra el plan incremental M04.1–M04.8 (milestone M04 completo).

**Objetivo:** cliente permanece un tiempo y abandona.

- [x] Añadir timer de "stay" — `STAY_DURATION_MS = 10_000` (10s, placeholder fijo sin
      comida/pedido todavía; decisión confirmada, ver `.juntia/DECISIONS.md`). Vive en
      `Customer.stayRemainingMs: number | null`, arrancando en `STAY_DURATION_MS` la primera
      vez que `advanceStay` ve a un customer `seated` (no cuenta el tiempo caminando).
- [x] Agregar estado `leaving` (`CustomerState`) y la infraestructura genérica de salida —
      `sendToExit(customer)` (`core/customers/customer.ts`): pone `state: "leaving"`,
      `target: DOOR_POSITION`, libera la mesa (`tableId: null`) de inmediato. No depende de por
      qué se va, así que M05/M09/M15 pueden reutilizarla para sus propios motivos de abandono
      sin duplicar esta lógica.
- [x] Movimiento lógico hacia la salida — reutiliza `moveCustomer` (M04.5) tal cual, sin
      ninguna modificación: ya movía hacia cualquier `target` sin importar el `state`, y ya
      dejaba un `state` no-`walking` intacto al llegar.
- [x] Eliminación del cliente de `GameState.customers` cuando sale —
      `removeDepartedCustomers(customers)`: filtra cualquier customer `leaving` con
      `target: null` (ya caminó hasta la puerta). `CustomerRenderer` no necesitó cambios — ya
      destruía el sprite de cualquier id que desapareciera de la lista, desde M04.4.

Pipeline de `CustomerSystem.update` (`systems/customer-system.ts`), cada frame: `spawn → move
→ assignTables → advanceStay → removeDepartedCustomers`.

**No implementar todavía:** pedidos; comida; pagos; satisfacción.

**Player-visible outcome:** el restaurante tiene clientes que entran, usan una mesa y salen —
verificado en navegador (Playwright, ~32s de corrida real dado el timer de 10s): clientes
entran, dos se sientan (posición fija en pantalla mientras están sentados), y entre los
screenshots de 20s y 26s la cantidad de clientes en pantalla bajó de 5 a 4 — evidencia directa
de un ciclo completo sentarse → levantarse → caminar a la puerta → despawnear; HUD y muebles
sin cambios; sin errores de consola en toda la corrida.

Verificado: `pnpm test` (72/72) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M04 scope boundaries

Fuera de alcance — pertenecen a milestones posteriores:

- pedidos;
- camareros;
- cocina;
- recetas;
- pagos;
- paciencia;
- colas;
- reputación dinámica;
- `occupiedTables` refactor completo.

**Completion criteria (milestone completo):** `pnpm test` en verde con los tests de cada
subpaso M04.1–M04.8; en el navegador un cliente completa el ciclo entra → encuentra mesa → se
sienta → se queda → se va, sin intervención manual.

---

### Historial heredado (pre-reordenamiento, ya en producción)

*Trabajo de infraestructura ya completado antes de que M03.5 definiera el plan M04.1–M04.8 de
arriba — no forma parte de esa secuencia, se mantiene como registro histórico.*

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

---

## M05 — Waiting and satisfaction

*Depende de: M04 (necesita mesas, asientos y la infraestructura de `leaving`/`sendToExit`) y
M03 (reutiliza `reputation`). Arquitectura confirmada en `.juntia/DECISIONS.md` antes de
empezar: `GameState.reputationAdjustments` como acumulador, y el principio de propiedad
"Customer lifecycle events ownership" (`CustomerSystem` emite los eventos del ciclo de vida;
`ReputationSystem` nunca inspecciona `state.customers`).*

**Player-visible outcome (milestone completo):** el jugador puede llenar el restaurante y ver
clientes esperando en fila; si esperan demasiado se van enfadados y la reputación baja; los que
sí llegan a sentarse y se van normalmente suben la reputación.

M05 es un plan incremental de tareas pequeñas, cada una testeable y verificable por separado —
mismo patrón que M04 — trabajar siempre en la primera `M05.x` con estado pendiente, sin saltar
pasos.

---

### M05.1 — Customer waiting state

**Estado: completado.**

**Objetivo:** preparar los datos de espera en `Customer`, sin activar todavía ninguna
transición real.

- [x] Añadir `"waiting"` a `CustomerState` (`core/customers/customer-state.ts`).
- [x] Añadir `waitReason: WaitReason | null` a `Customer`, con `WaitReason = "table"` — único
      motivo implementado por ahora; el tipo queda listo para que M09/M11 le agreguen
      `"order"`/`"food"` sin duplicar la infraestructura, sin anticiparlos hoy.
- [x] Añadir `waitRemainingMs: number | null` a `Customer` — mismo patrón que
      `stayRemainingMs` (M04.8): cuenta regresiva reiniciable por `deltaMs`, no un timestamp de
      inicio + límite por separado.
- [x] Tests unitarios puros de creación y valores por defecto (`customer.test.ts`, mismo patrón
      que `target`/`tableId`/`stayRemainingMs`; incluye `"waiting"` en el test parametrizado de
      estados iniciales).

**No implementar todavía:** la transición real `idle → waiting` (necesita las posiciones de
cola de M05.2 para tener un `target` a dónde ir); posiciones de cola; FIFO; timeout de
paciencia. Nota para M05.3: `sendToExit` hoy no limpia `waitReason`/`waitRemainingMs` al enviar
a un customer a la salida (solo limpia `stayRemainingMs`) — inofensivo ahora porque ningún
customer llega a tener `waitReason` no nulo todavía, pero hay que revisarlo antes de que M05.3
haga que eso deje de ser cierto.

**Player-visible outcome:** ninguno — mismo tipo de paso que M04.1/M04.2, solo prepara el
terreno de datos.

Verificado: `pnpm test` (74/74) y `tsc --noEmit` limpios; `pnpm build` limpio. Sin verificación
en navegador — no hay ningún camino de código que produzca `state: "waiting"` todavía, así que
no hay nada nuevo que observar (mismo criterio que M04.2).

---

### M05.2 — Table queue system

**Estado: completado.**

**Objetivo:** un customer sin mesa libre espera en fila, sin superponerse a otros.

- [x] Definir posiciones de cola (`getQueueSlotPosition(index): GridPosition`, distintas de
      `ENTRY_TARGET` por construcción) — junto a `DOOR_POSITION`/`ENTRY_TARGET` en
      `core/customers/customer.ts`. Fórmula abierta (línea horizontal a un costado de
      `ENTRY_TARGET`, sin bloquear el camino de entrada) en vez de un array fijo, para no
      necesitar un límite arbitrario de tamaño de cola. `findFreeQueueSlot(occupiedSlots)`
      encuentra el primer slot libre, mismo tipo de búsqueda que `findFreeTable`.
- [x] Implementar `resolveTableQueue` — función pura y FIFO, deliberadamente separada de
      `assignTables` para que M06 la reutilice desde `releaseTable` sin duplicarla.
- [x] Extender `assignTables` para intentar primero a los customers `waiting` y recién después
      a los `idle` sin mesa — logrado procesando `customers` en su orden de array existente
      (nunca reordenado), así que un customer que ya esperaba siempre aparece antes que uno
      recién `idle` en la misma pasada.
- [x] Activar la transición `idle → waiting`: un customer `idle` sin mesa libre pasa a
      `waiting` con `waitReason: "table"`, `target` al primer slot de cola libre, sin
      superponerse a otros (mismo patrón de `occupied`-tracking que ya usa `assignTables` para
      mesas, ahora también para slots de cola).
- [x] Tests unitarios puros (`customer.test.ts`): `resolveTableQueue` respeta el orden FIFO del
      array; `findFreeQueueSlot` salta slots ocupados; `assignTables` prioriza a un customer ya
      `waiting` sobre uno recién `idle` para una mesa liberada, no asigna el mismo slot de cola
      a dos customers en la misma pasada, limpia `waitReason`/`waitRemainingMs` al conseguir
      mesa, y deja intacto a un customer `waiting` sin mesa todavía disponible.

Bug real encontrado y corregido durante la implementación: el cálculo de slots de cola ocupados
inicialmente solo miraba `customer.target`, pero un customer que ya llegó a su slot tiene
`target: null` (igual que cualquier arribo) aunque siga parado ahí — así que un slot ocupado
podía "verse" libre para el siguiente customer que entra a la cola. Corregido usando
`customer.target ?? customer.position`.

**No implementar todavía:** timeout de paciencia (M05.3); eventos de reputación (M05.4).

**Player-visible outcome:** con las mesas ocupadas, los customers siguientes esperan en fila
sin superponerse, y el primero en cola ocupa la próxima mesa que se libera — verificado en
navegador (Playwright, ~18-20s de corrida): con más de 2 customers compitiendo por las 2 mesas
del layout inicial, los excedentes caminan a posiciones de cola distintas entre sí y de
`ENTRY_TARGET`, sin superponerse; HUD y muebles sin cambios; sin errores de consola.

Verificado: `pnpm test` (82/82) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M05.3 — Waiting patience

**Estado: completado.**

**Objetivo:** un customer que espera demasiado abandona.

- [x] Implementar `advanceWait(customer, deltaMs)` — espejo exacto de `advanceStay` (M04.8):
      cuenta regresiva de `waitRemainingMs` por `deltaMs`, sin mutar el original. Paciencia
      inicial `WAIT_DURATION_MS = 15_000` (decisión de producto confirmada, ver
      `.juntia/DECISIONS.md`).
- [x] Transición `waiting → leaving` al agotar la paciencia — vía `sendToExit`, reutilizada como
      infraestructura genérica de salida. Con una excepción respecto al plan original: `sendToExit`
      ahora también limpia `waitReason`/`waitRemainingMs` (antes solo limpiaba `stayRemainingMs`) —
      era el follow-up ya anotado al cerrar M05.2 ("inofensivo mientras nada llegue a `waiting` con
      esos campos no nulos y pase por `sendToExit`"; M05.3 es exactamente el primer caso que sí lo
      hace), no un cambio de comportamiento por caso especial: `sendToExit` ya limpiaba
      incondicionalmente el campo equivalente del otro motivo de salida (`stayRemainingMs`), esto
      solo completa la simetría.
- [x] Registrar `advanceWait` en el pipeline de `CustomerSystem.update`.
- [x] Tests unitarios puros: cuenta regresiva correcta, transición a `leaving` con `target` a
      la puerta al agotarse, no muta el `Customer` original (mismo patrón que los tests ya
      existentes de `advanceStay`), más un caso nuevo en `sendToExit` que verifica la limpieza de
      `waitReason`/`waitRemainingMs`.

**Bug real encontrado y corregido durante la implementación:** con paciencia finita, el orden de
pipeline heredado de M04 (`assignTables` antes que `advanceStay`) crea una condición de carrera:
si el stay de un customer sentado se agota en el mismo tick en que un customer en cola agota su
paciencia, `assignTables` ya corrió al principio del tick (con la mesa todavía ocupada) y no
reasigna la mesa recién liberada hasta el tick siguiente — un tick de más que, con paciencia
limitada, puede alcanzar para que `advanceWait` mande a ese mismo customer a la salida antes de
que le toque la mesa. Corregido reordenando el pipeline a `moveCustomer → advanceStay →
assignTables → advanceWait → removeDepartedCustomers`: las mesas liberadas por un stay agotado se
reasignan en el mismo tick, y `advanceWait` solo cuenta paciencia contra quien siga efectivamente
`waiting` después de esa reasignación. Detectado por un test ya existente de M05.2
(`customer-system.test.ts`, "frees a table once its customer starts leaving...") que empezó a
fallar al agregar la paciencia — no hizo falta cambiar el test, el reorden de pipeline lo corrige.

**Player-visible outcome:** un customer que queda en cola sin que se libere una mesa a tiempo
camina a la puerta y desaparece en vez de esperar para siempre — verificado en navegador
(Playwright, ~28s de corrida, capturas cada 3-8s): cero errores de consola; la cola sigue
formándose sin superposición (comportamiento de M05.2 intacto); HUD y dinero sin cambios; el
tamaño de la cola se mantiene acotado (no crece de forma ininterrumpida pese a que la tasa de
llegada de customers supera la de liberación de mesas en este layout de 2 mesas), consistente con
que el abandono por paciencia efectivamente remueve customers de la cola. La corrida de 28s no
permite aislar con certeza visual el trayecto completo puerta-a-puerta de un customer individual
(varios customers comparten el mismo corredor vertical en direcciones opuestas); el timing exacto
está cubierto de forma directa por los tests unitarios de `advanceWait`/`sendToExit`.

Verificado: `pnpm test` (88/88) y `tsc --noEmit` limpios; `pnpm build` limpio.

**Player-visible outcome:** un customer que espera demasiado abandona por la puerta, igual que
un customer que termina su `stayRemainingMs` en M04.8.

---

### M05.4 — Customer reputation events

**Estado: completado.**

**Objetivo:** el abandono penaliza reputación y el ciclo completo la recompensa, una sola vez
cada uno.

- [x] Añadir `GameState.reputationAdjustments: number` (decisión de arquitectura confirmada,
      ver `.juntia/DECISIONS.md`). Inicial `0` en `createGameState`.
- [x] `ReputationSystem.update` pasa a `state.reputation = calculateTotalReputation(furniture,
      catalog) + state.reputationAdjustments` — sin inspeccionar `state.customers` en ningún
      momento (decisión confirmada: "Customer lifecycle events ownership").
- [x] `CustomerSystem.update` aplica el delta a `reputationAdjustments` exactamente una vez por
      evento de salida. En vez de que `advanceStay`/`advanceWait`/`sendToExit` distingan el
      motivo (que los volvería menos genéricos), `CustomerSystem` compara el snapshot de
      `state.customers` antes y después de cada paso del pipeline vía la nueva función pura
      `countTransitionsToLeaving(before, after, fromState)` (`core/customers/customer.ts`):
      recompensa `+1` por cada `seated → leaving` detectado justo después de `advanceStay`
      (ciclo completo), penalización `-2` por cada `waiting → leaving` detectado justo después
      de `advanceWait` (abandono por paciencia) — valores confirmados como decisión de producto.
- [x] Tests unitarios puros: `countTransitionsToLeaving` (cuenta transiciones que matchean,
      ignora las que no, cuenta múltiples en el mismo batch); `CustomerSystem` — un abandono
      resta reputación exactamente una vez (no de nuevo en el tick siguiente), un ciclo
      completado suma reputación exactamente una vez; `ReputationSystem` suma
      `reputationAdjustments` al total derivado del mobiliario sin que `state.customers` influya
      en el resultado.

**No se implementó nada nuevo del lado de clientes** — esta pieza es puramente la conexión entre
las transiciones ya construidas en M05.2/M05.3 y la reputación; `sendToExit`, `advanceStay` y
`advanceWait` quedan sin cambios respecto a M05.3.

**Player-visible outcome:** la reputación del HUD baja cuando un customer abandona por espera y
sube cuando un customer completa el ciclo normalmente — verificado en navegador (Playwright,
~36s de corrida, capturas cada 3-5s): reputación 8 → 9 (ciclo completo) → 10 (otro ciclo
completo) → 8 (abandono, baja exactamente 2), visible directamente en el texto del HUD; cero
errores de consola en toda la corrida.

Verificado: `pnpm test` (95/95) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M05.5 — Validation and integration

**Objetivo:** cerrar M05 verificando el ciclo completo y la ausencia de responsabilidades
duplicadas, mismo tipo de revisión que cerró M04 (ver PR #17).

- [x] Validar en navegador el ciclo completo con cola: `entering → walking → waiting → seated →
      leaving → removed`, con 2 mesas y 3+ customers.
- [x] Validar que no existen responsabilidades duplicadas entre `CustomerSystem`,
      `ReputationSystem` y `CustomerRenderer` — en particular, que `ReputationSystem` sigue sin
      conocer clientes y que `CustomerRenderer` sigue sin conocer `state`/`waitReason`/
      `reputationAdjustments`.
- [x] Confirmar visualmente: con todas las mesas ocupadas, los customers siguientes esperan en
      fila sin superponerse; un customer que espera demasiado sale enfadado por la puerta y la
      reputación baja exactamente una vez; un customer que se queda y se va normalmente sube la
      reputación.

**No se implementó nada nuevo** — paso de validación e integración pura. Código fuente sin
cambios; solo se leyeron `reputation-system.ts`, `customer-renderer.ts` y `customer-system.ts`
para confirmar los límites de responsabilidad, y se corrió la app en navegador.

**Player-visible outcome:** el mismo del milestone completo (ver arriba) — confirmado en
navegador (Playwright, corrida de 45s, capturas cada 3s): reputación 8 → 9 → 10 (dos ciclos
completos, +1 cada uno) → 8 → 3 (abandonos por paciencia, -2 cada uno, cola de espera visible
como línea horizontal de customers en posiciones distintas sin superponerse); cero errores de
consola en toda la corrida; `Dinero: $500` sin cambios. Lectura de código confirmó los límites:
`ReputationSystem` solo lee `state.furniture`/`state.reputationAdjustments`, nunca
`state.customers`; `CustomerRenderer` solo lee `id`/`position` de cada `Customer`; toda la
lógica de eventos de reputación vive únicamente en `CustomerSystem`.

---

**Completion criteria (milestone completo):** `pnpm test` cubre la cola FIFO, el timeout de
paciencia y ambas variaciones de reputación (penalización y recompensa, cada una aplicada
exactamente una vez); en el navegador, con 2 mesas y 3+ customers, se ve la cola, el abandono
enfadado y ambos cambios de reputación.

---

## M06 — Customer flow robustness

*Depende de: M05 (estados `waiting`/`leaving`, cola FIFO y paciencia ya construidos) y M04
(ciclo básico `walking → idle/seated → leaving`). Endurece y consolida lo construido en
M04–M05 antes de seguir; no agrega comportamiento nuevo visible en la mayoría de sus pasos.
Redefinido por completo el 2026-08-21 — la versión anterior de este milestone ("Reservas
robustas") predataba la arquitectura actual y se apoyaba en archivos que ya no existen
(`game/reservations.ts`, nunca creado; `game/npc/controller.ts`, eliminado en M04.4). No es
un sistema de reservas tradicional: el objetivo real es gestionar correctamente el flujo de
clientes y la capacidad del restaurante sobre la arquitectura ya vigente —
`core/customers/` (dominio puro) + `state/GameState.customers[]` + `systems/CustomerSystem`
— sin introducir una estructura de ocupación separada (`occupiedTables` o similar): la
ocupación de mesas sigue derivándose de `state.customers` en cada lectura, como ya decidió
M04.4/M04.6 (ver `.juntia/ARCHITECTURE.md`).*

**Player-visible outcome (milestone completo):** en su mayoría, ninguno nuevo — el
comportamiento visible ya construido en M04–M05 (clientes que entran, encuentran mesa,
esperan en fila, abandonan por paciencia o completan su ciclo) se mantiene idéntico. M06 lo
consolida y lo cubre con invariantes explícitas para que M07 (demanda) y milestones
posteriores puedan construir sobre una base sin ambigüedades ni estados imposibles.

M06 es un plan incremental de tareas pequeñas, mismo patrón que M04/M05 — trabajar siempre
en la primera `M06.x` con estado pendiente, sin saltar pasos. Cada paso es ejecutable de
forma autónoma: objetivo, tareas concretas contra archivos/funciones que ya existen, límites
explícitos de qué no tocar, y un resultado verificable (test, `tsc --noEmit`, o chequeo
visual) antes de marcarlo `[x]`.

---

### M06.1 — Customer lifecycle state hardening

**Estado: completado.**

**Objetivo:** consolidar `CustomerState` (`core/customers/customer-state.ts`:
`"walking" | "idle" | "seated" | "leaving" | "waiting"`) y sus transiciones — hoy repartidas
implícitamente entre `moveCustomer`, `assignTables`, `advanceStay`, `advanceWait` y
`sendToExit` (`core/customers/customer.ts`) — en una fuente única, documentada y testeada.

- [x] Documentar explícitamente, junto a `CustomerState`, la tabla de transiciones válidas
      hoy vigentes (`walking → idle`, `walking → seated`, `idle → waiting`, `waiting →
      walking`, cualquier estado no-`leaving` → `leaving` vía `sendToExit`, `leaving →`
      eliminado por `removeDepartedCustomers`) — sin cambiar ninguna transición existente,
      solo hacerla citable en un solo lugar.
- [x] Documentar los invariantes que cada estado sostiene hoy por construcción pero nunca de
      forma explícita: `idle` ⇒ `tableId === null`; `seated` ⇒ `tableId !== null` &&
      `stayRemainingMs !== null`; `waiting` ⇒ `waitReason !== null`; `leaving` ⇒
      `tableId === null` && `stayRemainingMs === null` && `waitReason === null`.
- [x] Test: cada función pura de transición (`moveCustomer`, `assignTables`, `advanceStay`,
      `advanceWait`, `sendToExit`) devuelve siempre un `Customer` que cumple estos
      invariantes, no solo el campo puntual que ya cubre su test actual.
- [x] Test: una transición imposible no ocurre — p.ej. `waiting` nunca pasa directo a
      `seated` sin pasar por `walking`; ningún `idle` queda con `tableId` no nulo.

Toda la documentación vive como comentario junto a `CustomerState`
(`core/customers/customer-state.ts`) — sin ningún nuevo tipo, validador en tiempo de
ejecución ni cambio de forma de datos; `CustomerState` sigue siendo el mismo union de 5
strings. Hallazgo real durante la implementación, ya documentado explícitamente: el
invariante de `seated` (`tableId !== null && stayRemainingMs !== null`) **no** lo garantiza
`moveCustomer` por sí solo — al hacer `walking → seated` en la llegada, deja
`stayRemainingMs` en `null` (inicializarlo no es su responsabilidad); es `advanceStay`,
corriendo inmediatamente después en el mismo pipeline de `CustomerSystem.update`, quien lo
completa en el mismo tick. Por eso los tests quedaron en dos niveles: por función, en
`customer.test.ts` (`describe("state invariants")`) — cada invariante contra la función que
realmente lo produce, incluyendo el caso imposible explícito (`waiting` que llega a su slot
de cola nunca pasa a `seated` vía `moveCustomer`); y como invariante completo tras un tick
real, en `customer-system.test.ts` — 20 ticks de 1s con cola, asignación, estadía y
abandono por paciencia, verificando que todo `Customer` en `state.customers` cumple el
invariante de su estado en cada checkpoint (el único lugar donde el invariante de `seated`
está garantizado). El caso "ningún `idle` queda con `tableId` no nulo" no se testeó como
unit test aislado porque no es una transición que ningún camino real de `assignTables`
pueda producir (`idle` solo lo produce `moveCustomer`, siempre con `tableId` en `null` por
construcción de su propio ternario) — queda cubierto igual por el invariante completo del
test de sistema, que solo observa `Customer` reales.

**No implementar:** pedidos; camareros; cocina; ningún estado nuevo. Este paso es hardening
y tests — no cambia ninguna transición ni ningún archivo fuera de tests/documentación
inline. Ningún archivo de `core/customers/customer.ts`, `systems/customer-system.ts` ni
Phaser cambió.

**Player-visible outcome:** sin cambios visuales. Mejora la estabilidad interna del sistema
de clientes.

Verificado: `pnpm test` (104/104 — 95 + 9 nuevos) y `tsc --noEmit` limpios; `pnpm build`
limpio. Sin verificación en navegador — mismo criterio que M04.2/M05.1: ningún camino de
código nuevo produce un estado o transición distinta a la ya existente, así que no hay nada
nuevo que observar visualmente.

---

### M06.2 — Table assignment as domain state

**Estado: completado.**

**Objetivo:** la relación cliente-mesa pasa a formar parte explícita del estado del
dominio: convertir en función de dominio explícita, nombrada y testeada la derivación de
ocupación de mesas que hoy vive inline al principio de `assignTables`
(`core/customers/customer.ts`) — sin crear una estructura de ocupación separada ni un
módulo de reservas.

**Decisión de ownership (confirmada antes de implementar, ver
`.juntia/ARCHITECTURE.md`):** `Customer.tableId` es la única fuente de verdad de qué mesa
ocupa cada cliente. No existe, ni se crea acá, un `occupiedTables` ni un `Table.isOccupied`
independientes — cualquier código que necesite saber qué mesas están libres deriva la
respuesta de `state.customers` a través de `getOccupiedTableIds`, nunca mantiene su propia
copia. Esto ya era cierto desde M04.4/M04.6; M06.2 lo hace explícito como función nombrada
en vez de dejarlo como lógica inline dentro de `assignTables`.

- [x] `Customer.tableId` — ya existía desde M04.6, sin cambios de forma; sigue siendo el
      único campo que representa la relación cliente-mesa (cuándo se asigna: `assignTables`
      encuentra mesa libre; cuándo se libera: `sendToExit`, ver abajo).
- [x] Extraer la derivación de ocupación a una función pura nombrada —
      `getOccupiedTableIds(customers)` (`core/customers/customer.ts`) — reutilizada por
      `assignTables` en vez de recalculada inline, para que M06.3+ y milestones futuros
      (M07 demanda, M15 exit/release) tengan un punto único al que apuntar en vez de
      reimplementarla.
- [x] Test: `getOccupiedTableIds` devuelve exactamente los `tableId` no nulos presentes en
      `Customer[]`, sin duplicados (usa `Set`, dedupe estructural); ignora customers sin
      mesa; devuelve conjunto vacío sin customers.
- [x] Formalizar como test explícito (antes solo cubierto indirectamente, comparando de a
      dos) el invariante de asignación única: en cualquier `Customer[]` producido por
      `assignTables`, ningún `tableId` no nulo se repite — y, con todas las mesas ya
      ocupadas, la ocupación no cambia al intentar asignar un customer de más (sin "mesa
      fantasma").
- [x] Test/confirmación: `sendToExit` sigue siendo el único punto que libera una mesa
      (`tableId → null`) — verificado con `getOccupiedTableIds`, que deja de listar la mesa
      apenas corre `sendToExit`, sin esperar a `removeDepartedCustomers`. Deliberadamente no
      se introduce una función `releaseTable` independiente ni una lista de ocupación
      aparte, para no reintroducir el problema de `occupiedTables` desincronizado que M04.4
      ya eliminó (ver `.juntia/ARCHITECTURE.md`). Los dos comentarios de `customer.ts` que
      todavía prometían un `releaseTable` futuro (junto a `assignTables` y
      `resolveTableQueue`) quedaron actualizados para reflejar esta confirmación.

Transiciones relacionadas revisadas (sin cambios de comportamiento, ya garantizadas desde
M04.6/M04.7 y formalizadas como invariante en M06.1): un customer nunca llega a `seated` sin
`tableId` — `moveCustomer` solo produce `seated` cuando `tableId` ya es no nulo, y
`assignTables` solo asigna `tableId` desde una mesa realmente libre
(`findFreeTable(occupiedTables)`, derivado ahora de `getOccupiedTableIds`). "Mesa
disponible" en el sentido de "existe en el catálogo real" no cambió en este paso — sigue
siendo la lista de `Table` de `core/restaurant.ts`, fuera de alcance de M06.2.

**No solucionar todavía:** cola de espera; posiciones de fila; movimiento de cola;
paciencia; pedidos; camareros; cocina; pagos; sistema completo de reservas con estado
propio; refactor de `occupiedTables` como lista aparte — decisión ya tomada de no tenerla
(la ocupación siempre se deriva de `state.customers`).

**Nota para M06.3+:** la cola ya construida en M05.2 (`getQueueSlotPosition`,
`findFreeQueueSlot`) guarda posiciones de grid en `Customer.target`/`position` — son datos
de dominio (`GridPosition`), no objetos de Phaser, y el renderer (`CustomerRenderer`) sigue
siendo un lector puro que nunca decide esas posiciones. Al consolidar capacidad/cola en
M06.3, mantener ese mismo principio: la cola es lógica (derivada de `state.customers`,
igual que la ocupación de mesas de este paso), la representación visual sigue siendo
responsabilidad exclusiva del renderer — no agregar aquí un nuevo tipo de estado "físico"
que Phaser deba interpretar.

**Player-visible outcome:** sin cambios visuales. Los clientes tienen una relación clara y
citable con su mesa (`Customer.tableId` + `getOccupiedTableIds`), en vez de lógica de
ocupación implícita dentro de `assignTables`.

Verificado: `pnpm test` (110/110 — 104 + 6 nuevos) y `tsc --noEmit` limpios; `pnpm build`
limpio. Sin verificación en navegador — `getOccupiedTableIds` es la misma lógica de
`assignedTableIds` que ya existía, solo extraída y nombrada; ningún comportamiento
observable cambió.

---

### M06.3 — Restaurant capacity management

**Estado: completado.**

**Objetivo:** dejar explícito, como principio de diseño de este paso, que **la cola de
espera es estado lógico de la simulación — "customer queue is logical state"** — no una
fila física que Phaser calcula o anima. Exponer como conceptos de dominio explícitos la
detección de "restaurante lleno" y el orden/tamaño de la cola de espera, hoy efectos
secundarios implícitos dentro de `assignTables`. La cola en sí (`waiting`,
`getQueueSlotPosition`, `findFreeQueueSlot`, orden FIFO vía `resolveTableQueue`) ya existe
desde M05.2; este paso no la reimplementa, solo hace consultable su estado.

**Principio central — separación simulación/render (misma línea desde M03.5):** el dominio
responde "¿qué lugar ocupa este cliente en la cola?" (un hecho lógico — *"el cliente está
tercero en la cola"*); nunca responde "¿a qué casillero visual camina?" (*"el cliente
camina hasta el tercer hueco"*) — eso es responsabilidad exclusiva de `CustomerRenderer`.
En concreto:

- **FIFO / orden de llegada:** ya garantizado desde M05.2 por el orden de array de
  `state.customers` (nunca reordenado, ver `spawnCustomer`/`removeDepartedCustomers`) — este
  paso lo expone como consulta explícita en vez de dejarlo como comportamiento emergente de
  `assignTables`.
- **Cliente esperando sin mesa:** en el dominio es, exactamente, `state === "waiting" &&
  waitReason === "table"` — no depende de ninguna posición de grid para "ser" parte de la
  cola.
- **Posición visual derivada:** `Customer.target`/`position` (vía `getQueueSlotPosition`,
  M05.2) es una proyección de esa posición lógica hacia una celda del grid — dato de
  dominio que el renderer puede consumir, pero el dominio nunca depende de cómo se ve.
- **Movimiento de fila = responsabilidad del renderer:** que un cliente "avance un lugar"
  visualmente cuando el de adelante consigue mesa es trabajo exclusivo de
  `CustomerRenderer`/Phaser — la simulación no anima nada, solo actualiza la posición lógica
  cuando corresponde (mismo principio ya confirmado en M03.5: la simulación es la fuente de
  verdad, Phaser solo representa).

- [x] Función pura `isRestaurantFull(customers, furnitureList)` que exprese la condición
      "no hay mesa libre" ya usada implícitamente dentro de `assignTables`, reutilizando
      `getOccupiedTableIds` (M06.2) y `findFreeTable` (`core/restaurant.ts`).
- [x] Test: `isRestaurantFull` responde correctamente con todas las mesas ocupadas y con al
      menos una libre (el caso "0 mesas" no se testeó de forma aislada — ver nota abajo).
- [x] Función pura para el orden lógico de la cola — `getTableQueuePosition(customerId,
      customers): number | null` (posición 0-based de un cliente `waiting`/`"table"` dentro
      de la cola, o `null` si no está esperando mesa) — generaliza `resolveTableQueue` (que
      hoy solo devuelve el primero) sin cambiar su comportamiento ni el de `assignTables`.
- [x] Test: el orden lógico de cola coincide con el orden de llegada (FIFO) y con el
      resultado de `resolveTableQueue` — consultable de forma explícita e independiente de
      cualquier posición de grid.
- [x] Función pura `getTableQueueSize(customers)` para el tamaño actual de la cola,
      consultable sin recorrer `assignTables`.
- [x] Test: el tamaño de cola crece con más llegadas que mesas libres y baja cuando
      `assignTables` asigna una mesa o un cliente abandona (`sendToExit`).

Implementación: `getOccupiedTableIds` (M06.2) más la traducción a posiciones de grid que
antes vivía inline en `assignTables` quedaron consolidadas en un helper privado
`getOccupiedTablePositions(customers, furnitureList)`, compartido ahora por `assignTables` e
`isRestaurantFull` sin duplicar el criterio. Del mismo modo, `resolveTableQueue`,
`getTableQueuePosition` y `getTableQueueSize` se derivan todos de un helper privado
`getTableQueue(customers)` (el mismo predicado `waiting` + `waitReason: "table"`, en un solo
lugar) — `resolveTableQueue` pasó de `.find(...)` a `getTableQueue(customers)[0]`, mismo
resultado, verificado porque sus tests existentes (M05.2) siguen en verde sin cambios.
Ninguna de las dos consolidaciones cambia comportamiento observable.

**Hallazgo real durante la implementación (documentado, no corregido — fuera de alcance):**
`findFreeTable`/`getSeatForTable` (`core/restaurant.ts`) buscan sobre su propio `furniture`
a nivel de módulo, no sobre el `furnitureList` que reciben `assignTables`/`isRestaurantFull`
como parámetro — por eso el caso "0 mesas" no se pudo testear pasando un `furnitureList`
vacío (`findFreeTable` seguía encontrando las mesas reales del módulo). Hoy esto no causa
bugs porque `GameState.furniture` es literalmente esa misma referencia de array
(`createGameState`), nunca una copia — quedan en sync por esa alias, no por diseño. Detalle
completo en `.juntia/ARCHITECTURE.md`.

**Fuera de alcance (pertenece a otros milestones o a la capa de renderer, no a este paso de
dominio):**

- animación de caminar en cola (ya existe como interpolación de `CustomerRenderer`/
  `moveCustomer`; este paso no la tocó);
- UI de cola (contador visible en HUD, indicadores, etc.);
- prioridad VIP;
- reservas.

**Player-visible outcome:** sin cambios de comportamiento — la cola visual ya existe desde
M05.2. El estado "lleno"/orden/tamaño de cola queda disponible como dato de dominio
reutilizable (p.ej. por M07, que deriva el intervalo de spawn a partir de reputación y
podría acotarlo también por capacidad).

Verificado: `pnpm test` (117/117 — 110 + 7 nuevos) y `tsc --noEmit` limpios; `pnpm build`
limpio. Sin verificación en navegador — comportamiento idéntico al anterior, confirmado por
la suite completa (incluida `customer-system.test.ts`, que ejercita la cola real) sin
cambios en ningún test preexistente.

---

### M06.4 — Customer patience system

**Estado: completado.**

**Objetivo:** confirmar que el sistema de paciencia ya construido en M05.3/M05.4
(`WAIT_DURATION_MS`, `advanceWait`, penalización de reputación) queda correctamente
integrado con los conceptos formalizados en M06.1–M06.3, sin duplicar ni modificar su
comportamiento.

- [x] Test de integración: un customer que abandona por paciencia (`advanceWait` →
      `sendToExit`) deja los invariantes de M06.1 consistentes (sin `tableId`/`waitReason`/
      `waitRemainingMs` colgantes) y deja de aparecer en la cola lógica de M06.3
      (`getTableQueuePosition` devuelve `null` para ese customer).
- [x] Test de integración: `isRestaurantFull` (M06.3) refleja correctamente la ocupación a
      lo largo de una corrida real, de vacío a lleno.
- [x] Confirmar (test) que `REPUTATION_PENALTY_ABANDONED_WAIT` (M05.4,
      `systems/customer-system.ts`) sigue aplicándose exactamente una vez por abandono tras
      los cambios de M06.1–M06.3 — mismo timing que el test original de M05.4, ahora
      combinado con un barrido completo de invariantes de M06.1 sobre todos los customers.

Ningún archivo de producción cambió — solo `systems/customer-system.test.ts` ganó 4 tests
nuevos. Hallazgo real durante la implementación: el checklist original planteaba verificar
que un abandono por paciencia "reduce correctamente... `isRestaurantFull`/el tamaño de
cola... la mesa o el slot de cola liberado queda disponible... en el mismo tick" — en la
práctica esto no se pudo testear como una única transición limpia, por dos razones
descubiertas al escribir los tests:

1. Un abandono por paciencia libera un **slot de cola**, no una mesa — nunca hizo bajar
   `isRestaurantFull` (eso lo hace `advanceStay`, no `advanceWait`). El test correspondiente
   verifica en cambio que el customer específico desaparece de `getTableQueuePosition`, sin
   asumir un tamaño de cola absoluto (durante la ventana de tiempo necesaria para agotar la
   paciencia, `CustomerSystem` sigue spawneando customers nuevos que también se suman a la
   cola, así que el tamaño absoluto no es predecible — solo la ausencia de ese customer
   puntual sí lo es).
2. Con alguien en cola, una mesa liberada por `advanceStay` se reasigna dentro del mismo
   tick (M05.3) — `isRestaurantFull` nunca "ve" el hueco, confirmado con un test dedicado.
   Intentar un escenario "sin nadie en cola" para forzar la transición a `false` resultó
   imposible de lograr de forma realista a través de `CustomerSystem`: para que el
   `STAY_DURATION_MS` (10s) de los primeros 2 customers termine de agotarse, pasa tiempo
   más que suficiente para que `SPAWN_INTERVAL_MS` (2.5s) genere varios customers nuevos que
   ya están esperando mesa — la cola nunca está genuinamente vacía en una corrida real de
   esa duración. `isRestaurantFull`'s transición limpia a `false` con una mesa realmente
   libre ya está cubierta a nivel unitario en `customer.test.ts` (M06.3); a nivel de
   sistema, se testeó en cambio lo que sí ocurre de verdad: `isRestaurantFull` sigue
   correctamente la ocupación real vacío→lleno, y se mantiene `true` cuando la cola
   reclama una mesa liberada en el mismo tick.

**No implementar:** satisfacción avanzada; pedidos; ningún cambio a `WAIT_DURATION_MS` ni a
`advanceWait`.

**Player-visible outcome:** ninguno nuevo — el comportamiento visible de M05.3/M05.4 (un
customer que espera demasiado se va y la reputación baja) se mantiene igual.

Verificado: `pnpm test` (121/121 — 117 + 4 nuevos) y `tsc --noEmit` limpios; `pnpm build`
limpio. Sin verificación en navegador — ningún archivo de producción cambió.

---

### M06.5 — Table release and reassignment

**Objetivo:** cerrar el ciclo de uso de mesa como una secuencia explícita y testeada de
principio a fin, usando las funciones de dominio formalizadas en M06.1–M06.4 en vez de
lógica implícita repartida entre varios archivos.

- [ ] Test end-to-end puro (sin Phaser, sin mocks): mesa ocupada → customer abandona
      (paciencia) o termina su ciclo normal (`sendToExit`) → la mesa aparece libre en
      `getOccupiedTableIds` (M06.2) → el siguiente customer en cola FIFO
      (`resolveTableQueue`, ya existente desde M05.2) la ocupa en el mismo tick, sin
      intervención manual — mismo comportamiento que ya fija el orden de pipeline de M05.3,
      ahora verificado explícitamente contra las funciones de dominio nuevas.
- [ ] Confirmar que `resolveTableQueue` — existente desde M05.2 pero sin uso real fuera de
      sus propios tests hasta ahora — queda efectivamente ejercitada por este test,
      cumpliendo el propósito para el que se creó.

**No implementar todavía:** eventos de liberación por motivos nuevos (cocina, pagos, M14/
M15) — solo los dos ya existentes (ciclo completo vía `advanceStay`, abandono vía
`advanceWait`).

**Player-visible outcome:** ninguno nuevo — el restaurante ya mantenía flujo continuo de
clientes desde M05; este paso lo deja demostrado con un test explícito de punta a punta en
vez de solo inferido de tests parciales.

---

### M06.6 — Validation and integration

**Objetivo:** validar el M06 completo en navegador, mismo tipo de revisión que cerró M05
(ver M05.5, PR #23).

- [ ] Escenario en navegador: múltiples clientes llegan, las mesas se llenan, clientes
      esperan en cola, algunos abandonan por paciencia, mesas se liberan, nuevos clientes
      entran y ocupan las mesas liberadas.
- [ ] Verificar: no existen dobles asignaciones de mesa (invariante de M06.2); ningún
      customer queda bloqueado en un estado imposible (invariantes de M06.1); la reputación
      sigue subiendo/bajando correctamente (M05.4 intacto); las responsabilidades siguen
      separadas entre `CustomerSystem`/`ReputationSystem`/`CustomerRenderer` (mismo chequeo
      que M05.5).
- [ ] `pnpm test`, `tsc --noEmit` y `pnpm build` limpios.

**No implementar:** nada nuevo — este paso es validación e integración, no funcionalidad
nueva.

**Player-visible outcome:** el mismo del milestone completo (ver arriba).

---

### M06 scope boundaries

Fuera de alcance — pertenecen a milestones posteriores:

- camareros;
- pedidos;
- recetas;
- cocina;
- pagos;
- salarios;
- eventos especiales;
- VIP;
- decoración avanzada;
- demanda dinámica de clientes (reaccionar a capacidad/saturación — ver nota de diseño en
  M07 y la sección "Visión futura" al final de este documento);
- economía avanzada (costes de recetas, costes fijos, costes de empleados, precios
  configurables, contabilidad diaria — ver "Visión futura" al final de este documento).

M06 se mantiene centrado en clientes, colas, mesas, capacidad y ciclo de vida — nada de lo
anterior se implementa como parte de este milestone.

**Completion criteria (milestone completo):** `pnpm test` cubre los invariantes de estado
(M06.1), la asignación única de mesas (M06.2), la detección de capacidad y tamaño de cola
(M06.3), la integración de paciencia (M06.4) y el ciclo completo liberación↔reasignación
(M06.5); en el navegador, con varios clientes y mesas limitadas, se ve la cola, el abandono
por paciencia y la reasignación de mesas liberadas, sin dobles asignaciones ni clientes
bloqueados.

---

## M07 — Demand

*Depende de: M03 (reputación) y M06 (flujo de clientes y capacidad consolidados).*

**Nota de diseño futura (no implementar en este paso — ver "Visión futura" al final de este
documento):** la generación de nuevos clientes no debe ser, a largo plazo, un spawn fijo
independiente del estado del restaurante. Este primer incremento de M07 solo deriva el
intervalo de spawn a partir de la reputación (`M03`); una vez que el juego tenga presión
real de capacidad (mesas limitadas, colas largas), la demanda deberá reaccionar también a
esa saturación — reutilizando `isRestaurantFull`/`getTableQueueSize` (M06.3) — y no solo a
la reputación. Regla conceptual a aplicar cuando corresponda: un restaurante completamente
saturado no debería seguir generando clientes al mismo ritmo indefinidamente, para evitar
colas infinitas, clientes entrando sin posibilidad real de servicio, y una simulación poco
realista. Sin tareas nuevas en este documento todavía — se registra acá para que quien
retome este milestone (o lo extienda más adelante) no lo pase por alto.

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

**Nota de diseño futura (no implementar en este paso — ver "Visión futura" al final de este
documento):** `RecipeDefinition` ya contempla `price`, pero el modelo económico avanzado
necesitará además costes variables por receta — ingredientes, coste de producción, margen
potencial derivado de `price - coste` — para que el jugador pueda tomar decisiones reales de
rentabilidad por plato. Fuera de alcance de este incremento; se registra acá para que el
campo `price` de hoy no se confunda con el modelo de costes completo que llega después.

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

**Nota de diseño futura (no implementar en este paso — ver "Visión futura" al final de este
documento):** este incremento fija `price` como un valor simple por `MenuItem`. El modelo
económico avanzado espera que el jugador pueda configurar esos precios, y que el precio
elegido sea una decisión estratégica con trade-offs (precio alto = mayor margen pero menor
atractivo/mayores expectativas; precio bajo = menor margen pero mayor atractivo) — no solo
una variable de ingreso fija. Fuera de alcance de este incremento.

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

*Depende de: M14, M06 (flujo de clientes y capacidad consolidados) y M04 (infraestructura
de `leaving`).*

- [ ] Tras pagar, el NPC dispara la misma transición a `leaving` de M04 (vía `sendToExit`)
      y camina de vuelta a la puerta.
- [ ] Confirmar que la mesa queda libre automáticamente al entrar en `leaving`
      (`sendToExit` ya limpia `tableId` — ver M06.2; no hace falta invocar una función
      `releaseTable` aparte, esta arquitectura no mantiene una lista de ocupación separada).
- [ ] Confirmar visualmente: la mesa liberada es ocupada por el primer NPC en cola
      (`resolveTableQueue`, M05.2/M06.5) o por un cliente nuevo si no hay cola.

**Player-visible outcome:** el jugador ve al cliente salir por la puerta tras pagar, y la
mesa liberada es ocupada por el siguiente cliente en cola.

**Completion criteria:** ciclo mesa ocupada → liberada → reocupada, visible con 2+
clientes.

---

## M16 — First employee

*Depende de: M01/M02 (sistema de compra) y M11/M12 (algo que un empleado pueda acelerar).
Decisión abierta: qué hace exactamente el primer empleado — a resolver antes de empezar
este milestone.*

**Nota de diseño futura (no implementar en este paso — ver "Visión futura" al final de este
documento):** este incremento solo pide un costo fijo de contratación. El modelo económico
avanzado espera que los empleados tengan coste operativo continuo, no solo de contratación
— p.ej. un Chef con salario diario/velocidad/capacidad, un Camarero con salario
diario/capacidad de atención/eficiencia — como parte de los costes fijos diarios del
restaurante. Fuera de alcance de este incremento.

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

## Visión futura — demanda dinámica y economía de gestión

*Documentado el 2026-08-21 a partir de una decisión de producto confirmada (ver
`.juntia/DECISIONS.md`, "Restaurant simulation economy model"). Esta sección describe
dirección de diseño, no tareas — nada de lo siguiente se implementa todavía, ni pertenece a
M06 (ver "M06 scope boundaries" más arriba). Se registra acá para que los milestones que
dependan de estos sistemas (M07, M09, M10, M14, M16, y los que se desglosen más adelante)
tengan esta dirección presente en vez de implementarse ignorándola. Cada sistema se
mantiene separado — no se fusionan en un único sistema monolítico de "economía".*

### 1. Sistema de demanda de clientes

La generación de nuevos clientes no debe ser, a largo plazo, un spawn fijo independiente
del estado del restaurante — la demanda futura debe reaccionar al estado real del
restaurante. Factores a considerar (no una lista cerrada): capacidad del restaurante, mesas
disponibles, longitud de cola, saturación, reputación, calidad del servicio.

**Regla conceptual:** un restaurante completamente saturado no debería seguir generando
clientes al mismo ritmo indefinidamente. La demanda debe reducirse cuando la capacidad está
superada, para evitar colas infinitas, clientes entrando sin posibilidad real de servicio, y
una simulación poco realista.

Este sistema pertenece a un milestone futuro de demanda/equilibrio (extensión de M07 una vez
que M06 esté cerrado y haya presión real de capacidad), no a M06.

### 2. Sistema económico avanzado

Evolucionar la economía actual (`money`, `canAfford`, M02) hacia un sistema de gestión de
restaurante:

- **Ingresos:** clientes pagando platos; precios configurables por el jugador (ver punto 3).
- **Costes variables:** cada receta debe tener coste de producción, ingredientes, tiempo de
  preparación y margen potencial (`price - coste`).
- **Costes fijos:** el restaurante debe tener gastos diarios — p.ej. alquiler, electricidad,
  mantenimiento, otros costes operativos.
- **Costes de empleados:** los empleados deben tener coste operativo continuo, no solo de
  contratación — p.ej. un Chef con salario diario, velocidad y capacidad; un Camarero con
  salario diario, capacidad de atención y eficiencia.

### 3. Sistema de precios

El jugador debe poder configurar los precios de los platos. Los precios no son solamente una
variable de ingreso — deben afectar al equilibrio del restaurante como una decisión
estratégica de gestión:

- **Precio alto:** mayor margen; menor atractivo potencial; mayores expectativas del
  cliente.
- **Precio bajo:** menor margen; mayor atractivo potencial.

### 4. Qué debe contemplar el roadmap futuro

Sin crear implementación todavía — el roadmap posterior a M06 debe contemplar, cada uno
como sistema separado: demanda dinámica de clientes; recetas con costes; menú y precios;
empleados con costes; contabilidad diaria; rentabilidad del restaurante. Notas puntuales ya
añadidas en M07 (demanda), M10 (recetas), M14 (pagos) y M16 (primer empleado) para que no se
pierdan de vista al llegar a cada uno.

---

## Milestones futuros (sin desglosar)

A definir cuando se acerquen: ciclo día/noche, más mejoras y empleados, variedad de
mobiliario/decoración, arte definitivo (reemplazar rectángulos placeholder).
