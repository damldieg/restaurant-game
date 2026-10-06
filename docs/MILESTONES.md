# Table & Tale — Development Milestones

## How to use this document

- Las tareas se ejecutan en orden dentro de cada milestone, y los milestones en orden.
- Trabajar siempre en la primera tarea `[ ]` que esté desbloqueada (sin dependencias `[ ]`/`[-]` sin resolver antes).
- Cada tarea se verifica (test, `tsc --noEmit`, o chequeo visual en el navegador) antes de marcarla `[x]`.
- Un milestone completo (no una tarea suelta) además cumple la "Definition of Done de gameplay milestones" (ver abajo) antes de darse por cerrado.
- No saltar milestones ni implementar varias tareas grandes de una sola vez sin necesidad.
- Implementar una sola tarea por sesión, salvo pedido explícito de continuar.
- Estados: `[ ]` pendiente · `[x]` completada y verificada · `[-]` bloqueada (con motivo breve al lado).
- M00 es informativo: recapitula lo ya hecho, no tiene checkboxes ni se "trabaja" en él.

## Relación con PROJECT_STATE.md

`.juntia/PROJECT_STATE.md` = estado actual (dónde estamos). `docs/MILESTONES.md` = roadmap
(qué construir ahora). `.juntia/ARCHITECTURE.md` = por qué está construido así. Los PRs (y
`git log`) = cómo se implementó cada paso. Al completar una tarea, actualizar
`PROJECT_STATE.md` con una entrada breve y dejar el detalle narrativo (hallazgos, decisiones
de test, capturas de verificación) en la descripción del PR — no duplicarlo en este
documento.

## Regla de planificación (desde M07)

*Decisión de producto confirmada el 2026-08-22 (ver `.juntia/DECISIONS.md`). Hasta M06, el
roadmap intercaló pasos de "foundation"/documentación explícitos antes de cada feature real
(M04.1, M05.1, M06.1, etc.) — correcto para asentar la arquitectura base (`GameState`,
`core`/`state`/`systems`, invariantes de `Customer`), pero a partir de M07 le da demasiado
peso a la preparación frente a lo jugable.*

Desde M07 en adelante:

- **Cada milestone debe responder "¿qué puede ver o hacer el jugador al terminarlo?"** — un
  milestone sin `Player-visible outcome` real es sospechoso.
- Documentar/refactorizar solo cuando evite una refactorización costosa después, o defina
  una responsabilidad nueva importante (ownership de un dato, límite entre `core`/
  `systems`) — nunca como milestone independiente si puede resolverse dentro del milestone
  de gameplay que lo necesita.
- **Antes de crear un milestone de infraestructura pura, preguntar:** "¿Podemos implementar
  la feature y refactorizar después sin riesgo importante?" Si la respuesta es sí, el
  refactor/documentación va dentro del milestone de gameplay, no aparte.
- Este documento se mantiene compacto: objetivo, tareas, límites, `Player-visible outcome`,
  criterio de cierre. El detalle de implementación (bugs encontrados, diseño de tests,
  capturas de verificación) pertenece al PR que implementa el paso, no a este documento.

## Definition of Done de gameplay milestones

*Añadido el 2026-08-22 junto con la "Regla de planificación" de arriba — el criterio
concreto para juzgar si un milestone de gameplay (M07 en adelante) está realmente
terminado, no solo técnicamente correcto.*

Un milestone de gameplay no se considera completo solo porque:

- los tests pasan;
- la arquitectura está correcta.

Debe tener:

- una interacción visible para el jugador, o
- una decisión estratégica nueva disponible para el jugador.

Si ninguna de las dos se cumple, el milestone no está listo para marcarse `[x]` como
completo, sin importar cuánto código o cuántos tests respalden el paso — hay que seguir
trabajando el paso hasta que produzca una de las dos, o replantearlo como parte de otro
milestone que sí lo haga (ver "Regla de planificación" arriba).

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

**No:** sprites; Phaser; movimiento visual.

**Player-visible outcome:** sin cambio visual — clientes simulados pero aún no renderizados
(no existe `CustomerRenderer` todavía).

Verificado: `pnpm test` (36/36) y `tsc --noEmit` limpios.

---

### M04.4 — Customer rendering

**Estado: completado.**

**Objetivo:** representar clientes existentes en Phaser.

- [x] Crear renderer separado (`CustomerRenderer`, o `game/npc/controller.ts` reducido a esto).
- [x] Leer `GameState.customers`.
- [x] Crear sprite cuando existe un `Customer` nuevo.
- [x] Actualizar posición visual desde el estado.

**Regla:** el renderer nunca modifica `CustomerState` — solo lee `GameState` y dibuja.

`game/npc/` (`Npc`/`NpcState`/`NpcController`) se eliminó por completo (decisión ya confirmada
en M03.5). `CustomerRenderer` (`game/customers/customer-renderer.ts`) es su reemplazo directo:
crea/actualiza/destruye sprites desde `state.customers`, sin tweens ni mutar `Customer`.

**Player-visible outcome:** aparece un sprite de cliente sobre la puerta — verificado en
navegador, sin errores de consola. Sin movimiento todavía (llega en M04.5).

Verificado: `pnpm test` (40/40) y `tsc --noEmit` limpios; `pnpm build` limpio.

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

`spawnCustomer` fija `target: ENTRY_TARGET`; `CustomerRenderer` (M04.4) no cambió.

**No usar:** tween de Phaser como fuente de verdad de la posición — `moveCustomer` es puro.

**Player-visible outcome:** los clientes avanzan visiblemente hacia el mostrador y se detienen
al llegar — verificado en navegador, sin errores de consola.

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

**Player-visible outcome:** los clientes se dividen visiblemente hacia mesas distintas, sin
superponerse — verificado en navegador, sin errores de consola.

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

Ningún archivo fuera de `moveCustomer` cambió de comportamiento.

**Player-visible outcome:** el cliente llega a su silla y se queda quieto ahí — verificado en
navegador, sin errores de consola.

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
verificado en navegador (ciclo completo sentarse → levantarse → caminar a la puerta →
despawnear observado), sin errores de consola.

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

Bug encontrado y corregido: el cálculo de slots de cola ocupados solo miraba `customer.target`,
pero un customer que ya llegó a su slot tiene `target: null` — corregido con
`customer.target ?? customer.position`.

**No implementar todavía:** timeout de paciencia (M05.3); eventos de reputación (M05.4).

**Player-visible outcome:** con las mesas ocupadas, los customers siguientes esperan en fila
sin superponerse, y el primero en cola ocupa la próxima mesa que se libera — verificado en
navegador, sin errores de consola.

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

**Bug encontrado y corregido:** con paciencia finita, el orden de pipeline heredado de M04
(`assignTables` antes que `advanceStay`) creaba una condición de carrera — una mesa liberada por
un stay agotado no se reasignaba hasta el tick siguiente, dándole tiempo de más a
`advanceWait` para mandar a ese mismo customer a la salida antes de que le tocara la mesa.
Corregido reordenando el pipeline a `moveCustomer → advanceStay → assignTables → advanceWait →
removeDepartedCustomers`.

**Player-visible outcome:** un customer que espera demasiado abandona por la puerta, igual que
un customer que termina su `stayRemainingMs` en M04.8 — verificado en navegador, sin errores de
consola.

Verificado: `pnpm test` (88/88) y `tsc --noEmit` limpios; `pnpm build` limpio.

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

**No se implementó nada nuevo del lado de clientes** — conecta las transiciones ya construidas
en M05.2/M05.3 con la reputación; `sendToExit`/`advanceStay`/`advanceWait` sin cambios.

**Player-visible outcome:** la reputación del HUD baja cuando un customer abandona por espera y
sube cuando completa el ciclo normalmente — verificado en navegador (8 → 9 → 10 en ciclos
completos, → 8 en un abandono), sin errores de consola.

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
cambios; se leyó `reputation-system.ts`/`customer-renderer.ts`/`customer-system.ts` para
confirmar los límites de responsabilidad, y se corrió la app en navegador.

**Player-visible outcome:** el mismo del milestone completo (ver arriba) — confirmado en
navegador: cola visible sin superposición, reputación subiendo y bajando correctamente, cero
errores de consola. Límites de responsabilidad confirmados por lectura de código:
`ReputationSystem` nunca lee `state.customers`; `CustomerRenderer` solo lee `id`/`position`.

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

Documentación vive como comentario junto a `CustomerState` — sin nuevo tipo ni validador en
tiempo de ejecución. Hallazgo real: el invariante de `seated` no lo garantiza `moveCustomer`
por sí solo (deja `stayRemainingMs` en `null`) — lo completa `advanceStay`, inmediatamente
después en el mismo tick del pipeline.

**No implementar:** pedidos; camareros; cocina; ningún estado nuevo. Solo hardening y tests.

**Player-visible outcome:** sin cambios visuales. Mejora la estabilidad interna.

Verificado: `pnpm test` (104/104) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M06.2 — Table assignment as domain state

**Estado: completado.**

**Objetivo:** la relación cliente-mesa pasa a formar parte explícita del estado del
dominio: convertir en función de dominio explícita, nombrada y testeada la derivación de
ocupación de mesas que hoy vive inline al principio de `assignTables`
(`core/customers/customer.ts`) — sin crear una estructura de ocupación separada ni un
módulo de reservas.

**Decisión de ownership (ver `.juntia/ARCHITECTURE.md`):** `Customer.tableId` es la única
fuente de verdad de qué mesa ocupa cada cliente — sin `occupiedTables`/`Table.isOccupied`
independientes; se deriva siempre de `state.customers` vía `getOccupiedTableIds`.

- [x] `Customer.tableId` — sin cambios de forma, único campo que representa la relación
      cliente-mesa.
- [x] Extraer la derivación de ocupación a `getOccupiedTableIds(customers)`
      (`core/customers/customer.ts`), reutilizada por `assignTables`.
- [x] Test: `getOccupiedTableIds` devuelve los `tableId` no nulos sin duplicados.
- [x] Test: invariante de asignación única — ningún `tableId` se repite; con todas las
      mesas ocupadas, la ocupación no cambia al intentar asignar de más.
- [x] Confirmado: `sendToExit` sigue siendo el único punto que libera una mesa
      (`tableId → null`). No se introduce `releaseTable` ni lista de ocupación aparte.

**No solucionar todavía:** cola de espera; posiciones de fila; movimiento de cola;
paciencia; pedidos; camareros; cocina; pagos; sistema completo de reservas con estado
propio; refactor de `occupiedTables` como lista aparte — decisión ya tomada de no tenerla
(la ocupación siempre se deriva de `state.customers`).

**Player-visible outcome:** sin cambios visuales. Los clientes tienen una relación clara y
citable con su mesa (`Customer.tableId` + `getOccupiedTableIds`).

Verificado: `pnpm test` (110/110) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M06.3 — Restaurant capacity management

**Estado: completado.**

**Objetivo:** exponer como conceptos de dominio explícitos la detección de "restaurante
lleno" y el orden/tamaño de la cola de espera, hoy efectos secundarios implícitos dentro de
`assignTables`. La cola en sí ya existe desde M05.2; este paso solo hace consultable su
estado.

**Principio central (misma línea desde M03.5):** la cola de espera es estado lógico de la
simulación — no una fila física que Phaser calcule o anime; el renderer solo proyecta esa
posición lógica a una celda de grid, nunca decide el orden.

- [x] Función pura `isRestaurantFull(customers, furnitureList)`, reutilizando
      `getOccupiedTableIds` (M06.2) y `findFreeTable`.
- [x] Función pura `getTableQueuePosition(customerId, customers): number | null` — orden
      lógico de cola, generaliza `resolveTableQueue` sin cambiar su comportamiento.
- [x] Función pura `getTableQueueSize(customers)` — tamaño de cola actual.
- [x] Tests: ocupación total/parcial; orden FIFO consistente con `resolveTableQueue`;
      tamaño de cola sube/baja con llegadas y asignaciones/abandonos.

**Hallazgo (documentado, no corregido — fuera de alcance):** `findFreeTable`/
`getSeatForTable` (`core/restaurant.ts`) buscan sobre su propio `furniture` a nivel de
módulo, no sobre el `furnitureList` que reciben como parámetro — inofensivo hoy solo porque
`GameState.furniture` es la misma referencia de array, nunca una copia. Detalle en
`.juntia/ARCHITECTURE.md`.

**Fuera de alcance:** UI de cola; prioridad VIP; reservas.

**Player-visible outcome:** sin cambios de comportamiento — el estado "lleno"/orden/tamaño
de cola queda disponible como dato de dominio reutilizable (p.ej. por M07).

Verificado: `pnpm test` (117/117) y `tsc --noEmit` limpios; `pnpm build` limpio.

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

Ningún archivo de producción cambió — solo tests nuevos. Hallazgo real: un abandono por
paciencia libera un **slot de cola**, no una mesa (eso lo hace `advanceStay`, no
`advanceWait`) — el test de `isRestaurantFull` verifica en cambio la ocupación real
vacío→lleno, sin asumir que un abandono la afecta.

**No implementar:** satisfacción avanzada; pedidos; ningún cambio a `WAIT_DURATION_MS` ni a
`advanceWait`.

**Player-visible outcome:** ninguno nuevo — el comportamiento visible de M05.3/M05.4 se
mantiene igual.

Verificado: `pnpm test` (121/121) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M06.5 — Table release and reassignment

**Estado: completado.**

**Objetivo:** cerrar el ciclo de uso de mesa como una secuencia explícita y testeada de
principio a fin, usando las funciones de dominio formalizadas en M06.1–M06.4 en vez de
lógica implícita repartida entre varios archivos.

- [x] Test end-to-end puro (sin Phaser, sin mocks): mesa ocupada → customer termina su ciclo
      normal (`advanceStay` → `sendToExit`) → la mesa aparece libre en `getOccupiedTableIds`
      (M06.2) → el siguiente customer en cola FIFO (`resolveTableQueue`, ya existente desde
      M05.2) la ocupa en el mismo tick, sin intervención manual — mismo comportamiento que ya
      fija el orden de pipeline de M05.3, ahora verificado explícitamente contra las
      funciones de dominio nuevas.
- [x] Confirmar que `resolveTableQueue` — existente desde M05.2 pero sin uso real fuera de
      sus propios tests hasta ahora — queda efectivamente ejercitada por este test,
      cumpliendo el propósito para el que se creó: el test llama a `resolveTableQueue`
      directamente contra el estado real justo antes de la liberación para *predecir* qué
      customer debería ocupar la próxima mesa libre, y después confirma que ese mismo
      customer (y no otro) es quien efectivamente la ocupa en el tick siguiente.

**No implementar todavía:** eventos de liberación por motivos nuevos (cocina, pagos, M14/
M15) — solo los dos ya existentes (ciclo completo vía `advanceStay`, abandono vía
`advanceWait`).

**Player-visible outcome:** ninguno nuevo — el restaurante ya mantenía flujo continuo de
clientes desde M05; este paso lo deja demostrado con un test explícito de punta a punta.

Verificado: `pnpm test` (122/122) y `tsc --noEmit` limpios; `pnpm build` limpio.

---

### M06.6 — Validation and integration

**Estado: completado.** Cierra el plan incremental M06.1–M06.6 (milestone M06 completo).

**Objetivo:** validar el M06 completo en navegador, mismo tipo de revisión que cerró M05
(ver M05.5, PR #23).

- [x] Escenario en navegador: múltiples clientes llegan, las mesas se llenan, clientes
      esperan en cola, algunos abandonan por paciencia, mesas se liberan, nuevos clientes
      entran y ocupan las mesas liberadas.
- [x] Verificar: no existen dobles asignaciones de mesa (invariante de M06.2); ningún
      customer queda bloqueado en un estado imposible (invariantes de M06.1); la reputación
      sigue subiendo/bajando correctamente (M05.4 intacto); las responsabilidades siguen
      separadas entre `CustomerSystem`/`ReputationSystem`/`CustomerRenderer` (mismo chequeo
      que M05.5).
- [x] `pnpm test`, `tsc --noEmit` y `pnpm build` limpios.

Confirmado por lectura directa de código: `ReputationSystem` nunca lee `state.customers`;
`CustomerRenderer` solo lee `id`/`position`; toda la lógica de eventos de reputación vive
en `CustomerSystem` — sin cambios desde M05.5.

Verificado en navegador (60s de corrida, layout inicial de 2 mesas): ciclo completo
`entering → walking → waiting → seated → leaving → removed` observado repetidas veces; cola
sin superposición incluso con 6+ customers esperando; reputación fluctuando en ambas
direcciones correctamente; cero errores de consola; ninguna mesa asignada dos veces.

**No implementar:** nada nuevo — este paso es validación e integración, no funcionalidad
nueva.

**Player-visible outcome:** el mismo del milestone completo (ver arriba).

Verificado: `pnpm test` (122/122) y `tsc --noEmit` limpios; `pnpm build` limpio.

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
- demanda dinámica de clientes (reaccionar a capacidad/saturación — ver M07 — Demand
  system foundation, en particular M07.3, y la sección "Visión futura" al final de este
  documento);
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

## M07 — Demand system foundation

*Depende de: M03 (reputación) y M06 (flujo de clientes y capacidad consolidados). Renombrado
el 2026-08-22 de "M07 — Demand" a "M07 — Demand system foundation": cómo llegan nuevos
clientes al restaurante, no una lista suelta de tareas de spawn.*

**Objetivo general:** que la llegada de nuevos clientes dependa de la situación del
restaurante — reputación primero, capacidad/saturación después — en vez de un
`SPAWN_INTERVAL_MS` fijo e independiente del mundo (`systems/customer-system.ts`).

*Reestructurado el 2026-08-22 bajo la nueva "Regla de planificación" (ver arriba): M07.1 ya
se había completado como un paso de foundation puro (contrato de tipos, sin cómputo real,
PR #32) bajo el criterio anterior — se mantiene como historial válido, sin reabrir. Desde
M07.2 en adelante, cada paso produce un cambio jugable real; se eliminó el paso separado de
"documentar modificadores futuros" (antes M07.4), plegado como nota breve en "M07 scope
boundaries" más abajo.*

---

### M07.1 — Demand model foundation

**Estado: completado** (bajo el criterio de planificación anterior a esta reestructuración
— ver nota arriba).

`core/demand.ts` exporta `type DeriveSpawnIntervalMs = (reputation: number) => number` — un
contrato de tipos, no una función con cuerpo (evita una fórmula inventada que M07.2 tendría
que deshacer). `CustomerSystem` sigue siendo responsable solo de *ejecutar* el spawn;
*calcular* cuándo corresponde vivirá en `core/demand.ts`, mismo split que
`ReputationSystem`/`core/reputation.ts`. Sin cambios de comportamiento.

**Player-visible outcome:** ninguno. Verificado: `pnpm test` (122/122), `tsc --noEmit`
limpios.

---

### M07.2 — Reputation-based demand

**Estado: completado.**

**Objetivo:** la reputación afecta la frecuencia de llegada de clientes — más reputación,
más clientes; menos reputación, menos clientes.

- [x] Implementar `deriveSpawnIntervalMs(reputation: number): number` en `core/demand.ts`
      (M07.1) con la fórmula real: interpolación lineal acotada entre 1200ms (reputación
      >= 15) y 5000ms (reputación <= -5) — valores de balance confirmados como decisión de
      producto, ver `.juntia/DECISIONS.md`.
- [x] Reemplazar el `SPAWN_INTERVAL_MS` fijo de `CustomerSystem` por esta función, evaluada
      contra `state.reputation` en cada spawn (recalculada dentro del bucle de spawn, no
      una sola vez por tick — deja el terreno listo para M07.3, donde el spawn de un
      customer puede cambiar la saturación que el propio bucle necesita reconsultar).
- [x] Test: límites de reputación (mínimo/máximo) y monotonicidad (a mayor reputación,
      intervalo igual o menor).
- [x] Confirmar visualmente: con reputación alta llegan más clientes que con reputación
      baja, sin generar clientes sin límite.

**No implementar todavía:** economía; precios; calidad de platos; capacidad/saturación
(M07.3).

**Player-visible outcome:** el restaurante recibe más o menos clientes según su reputación.

Verificado en navegador: con la reputación inicial (8, del mobiliario default) el intervalo
real es ~2530ms, cercano al viejo baseline fijo de 2500ms; subiendo la reputación a 13 (una
mesa extra) la cola visible se vuelve notablemente más larga en la misma ventana de 20s que
con reputación 8-10, sin errores de consola. Dos tests de `customer-system.test.ts`
necesitaron ajustar su timing (spawnear 3 customers vía tres calls `update()` separados en
vez de uno solo con `SPAWN_INTERVAL_MS * 3`) porque ese patrón de batch-spawn consumía de
golpe la mayor parte del presupuesto de paciencia (15000ms) contra el nuevo intervalo más
alto a reputación 0 — comportamiento de test, no un bug del sistema real (en el juego nunca
llega un `deltaMs` tan grande de una sola vez).

Verificado: `pnpm test` (126/126) y `tsc --noEmit` limpios.

---

### M07.3 — Capacity pressure and saturation

**Objetivo:** la demanda también reacciona a la capacidad del restaurante, no solo a la
reputación (M07.2) — restaurante saturado, menos clientes nuevos.

- [ ] Extender `deriveSpawnIntervalMs` (M07.2) para considerar la capacidad, reutilizando
      `isRestaurantFull`/`getTableQueueSize` (`core/customers/customer.ts`, M06.3) — sin
      recorrer `state.customers` de nuevo por fuera de esas funciones.
- [ ] Reducir la frecuencia de llegada cuando mesas ocupadas + cola larga indican
      saturación, en vez de mantener el ritmo derivado solo de la reputación.
- [ ] Test: restaurante lleno + cola larga da un intervalo mayor que con capacidad libre a
      igual reputación; restaurante con capacidad libre no se ve afectado.
- [ ] Confirmar visualmente: un restaurante saturado recibe clientes con menor frecuencia
      que uno con capacidad libre, a igual reputación.

**No implementar todavía:** marketing; eventos; clientes VIP.

**Player-visible outcome:** un restaurante saturado deja de recibir clientes al mismo
ritmo.

---

### M07.4 — Validation and integration

**Objetivo:** validar el sistema completo de demanda en navegador, mismo tipo de revisión
que cerró M05/M06.

- [ ] Escenarios en navegador: baja reputación → pocos clientes; buena reputación → más
      clientes; restaurante saturado → menor frecuencia de llegada.
- [ ] Verificar: no hay spawn infinito sin límite; no hay responsabilidades duplicadas
      entre `core/demand.ts` (cálculo) y `CustomerSystem` (ejecución).
- [ ] `pnpm test`, `tsc --noEmit` y `pnpm build` limpios.

**Player-visible outcome:** el mismo del milestone completo (ver arriba).

---

### M07 scope boundaries

Fuera de alcance — pertenecen a milestones posteriores: menú; recetas; precios; costes de
producción; salarios; empleados; cocina; camareros; pagos; marketing avanzado; eventos
especiales. Modificadores futuros de demanda (precios, calidad de servicio, decoración,
eventos) no se documentan como paso propio — cuando alguno de esos milestones llegue,
extender `deriveSpawnIntervalMs` con ese factor como parte de su propio milestone de
gameplay (ver "Regla de planificación" arriba), no antes.

**Completion criteria (milestone completo):** `pnpm test` cubre los límites y valores
representativos de la demanda basada en reputación (M07.2) y su reacción a la capacidad
(M07.3); en el navegador, el intervalo de spawn responde a la reputación y se reduce cuando
el restaurante está saturado.

---

*Reestructurado el 2026-08-22 bajo la nueva "Regla de planificación": M10 (Recipes) se
fusionó dentro de M10 (Kitchen) — datos de receta sin cocina real no producían ningún
`Player-visible outcome` propio, así que ahora llegan juntos. M11–M16 se renumeraron en
consecuencia (antes M12–M17).*

## M08 — Waiters

*Depende de: M04 (necesita clientes sentados a los que caminar).*

- [ ] Crear entidad `Waiter` con `id`, posición y estado `idle`.
- [ ] Marcar un cliente sentado como "solicita atención" (placeholder, sin pedido real
      todavía — M09 lo conecta).
- [ ] El camarero detecta y reserva al primer cliente que solicita atención (evita que dos
      camareros atiendan al mismo cliente).
- [ ] Camarero camina hacia el cliente reservado, lo "atiende" al llegar y vuelve a `idle`.
- [ ] Test: un cliente ya reservado no puede ser reservado por otro camarero.

**Player-visible outcome:** el jugador ve un camarero moverse desde su posición inicial
hacia un cliente sentado y volver a esperar.

**Completion criteria:** `pnpm test` cubre la reserva exclusiva; en el navegador el
camarero recorre hasta un cliente y vuelve a `idle`.

---

## M09 — Orders

*Depende de: M08 (camarero real) y M05 (mecanismo de espera).*

- [ ] Crear `game/menu.ts`: `MenuItem { id, name }`, lista mínima (2–3 platos).
- [ ] `pickRandomOrder(menu): MenuItem`, función pura.
- [ ] Al llegar a `seated`, el NPC pasa a `waiting` con motivo `order`; cuando el camarero
      lo atiende, le asigna un pedido y pasa a `waiting` con motivo `food`.
- [ ] Indicador visual (texto) sobre el NPC con su pedido.
- [ ] Test: `pickRandomOrder` siempre devuelve un ítem del menú dado.

**Player-visible outcome:** el jugador ve al camarero tomar el pedido de un cliente
sentado, y el pedido aparece como texto sobre el cliente.

**Completion criteria:** cada cliente sentado es atendido y muestra visualmente qué pidió;
`pnpm test` cubre `pickRandomOrder`.

---

## M10 — Recipes and kitchen

*Depende de: M09 (pedidos reales). Fusiona lo que antes eran dos milestones separados
(Recipes + Kitchen) — datos de receta sin cocina real no tenían resultado jugable propio.
La preparación debe durar segundos, no minutos.*

- [ ] Crear `RecipeDefinition { id, name, price, cost, preparationTime, quality, station }`
      (`cost` desde el inicio, no solo `price` — deja explícita la diferencia
      precio/coste que la economía necesitará en M13, sin implementar todavía nada con
      ella) y una primera receta real (ej. Hamburguesa).
- [ ] Crear entidad `CookingStation` con `id`, tipo, estado `idle`.
- [ ] Modelar el pedido como estado `ordered → cooking → ready`: al recibir un pedido
      (`waiting`/`food`, M09), reservar una estación libre e iniciar `cooking` con
      temporizador `preparationTime`; al vencer, pasa a `ready` y la estación vuelve a
      `idle`.
- [ ] Indicador visual de "cocinando"/"listo".
- [ ] Test: `canCookRecipe(station, recipe)` (compatible/incompatible); transición
      `cooking → ready`.
- [ ] Confirmar visualmente: un pedido pasa de cocinando a listo en pocos segundos.

**Player-visible outcome:** el jugador ve un pedido pasar de "cocinando" a "listo" en la
cocina, en segundos.

**Completion criteria:** `pnpm test` cubre `canCookRecipe` y la transición; en el
navegador el pedido de cada cliente cambia visualmente de estado.

---

## M11 — Food delivery

*Depende de: M10 (comida lista) y M08 (camarero real).*

- [ ] Camarero detecta un pedido `ready`, camina hacia el cliente y lo entrega; el pedido
      pasa a `delivered` y el NPC sale de `waiting` (motivo `food`).
- [ ] Indicador visual del cambio (ej. ícono de plato en la mesa).
- [ ] Confirmar visualmente: el camarero recoge la comida lista y la lleva al cliente
      correspondiente.

**Player-visible outcome:** el jugador ve al camarero llevar la comida lista desde la
cocina hasta el cliente que la pidió.

**Completion criteria:** la comida "servida" es visible en pantalla poco después de estar
lista, transportada por el camarero.

---

## M12 — Eating

*Depende de: M11.*

- [ ] Agregar estado `eating`; al recibir `delivered`, el NPC pasa a `eating` con un
      temporizador fijo de consumo, con indicador visual de "comiendo".

**Player-visible outcome:** el jugador ve al cliente pasar de sentado a "comiendo" tras
recibir su comida.

**Completion criteria:** el cliente pasa visualmente por `seated → eating` tras recibir su
comida.

---

## M13 — Payment

*Depende de: M12 y M02 (`money` ya existente). Primer paso donde el modelo económico
avanzado ("Visión futura", al final de este documento) empieza a implementarse, no solo a
documentarse — ver la regla de planificación arriba.*

- [ ] Función pura que calcula el monto a pagar al terminar `eating`, usando `price` de la
      receta (M10); sumarlo a `money` y mostrarlo en pantalla.
- [ ] Si el alcance lo permite sin bloquear el milestone: UI mínima para que el jugador
      configure el `price` de cada plato (el efecto de ese precio en la demanda/atractivo
      queda fuera de este paso — ver M07 y "Visión futura").
- [ ] Test: el monto pagado coincide con el precio del pedido.
- [ ] Confirmar visualmente: al terminar de comer, se muestra el monto y el dinero del HUD
      sube.

**Player-visible outcome:** el jugador ve el monto pagado y el dinero del HUD sube; si se
implementa la UI de precios, puede configurar cuánto cobra por cada plato.

**Completion criteria:** `pnpm test` cubre el cálculo del monto; en el navegador el dinero
del HUD sube al terminar de comer un cliente.

---

## M14 — Exit / release table

*Depende de: M13, M06 (flujo de clientes y capacidad consolidados) y M04 (`leaving`).*

- [ ] Tras pagar, el NPC dispara la transición a `leaving` (vía `sendToExit`) y camina a la
      puerta; la mesa queda libre automáticamente (`sendToExit` ya limpia `tableId`, M06.2
      — sin `releaseTable` aparte).
- [ ] Confirmar visualmente: la mesa liberada es ocupada por el primer NPC en cola
      (`resolveTableQueue`, M05.2/M06.5) o por un cliente nuevo si no hay cola.

**Player-visible outcome:** el jugador ve al cliente salir por la puerta tras pagar, y la
mesa liberada es ocupada por el siguiente cliente en cola.

**Completion criteria:** ciclo mesa ocupada → liberada → reocupada, visible con 2+
clientes.

---

## M15 — First employee

*Depende de: M01/M02 (compra) y M10/M11 (cocina/entrega, algo que un empleado pueda
acelerar). Replanteado para que el efecto sea real, no solo un costo de contratación —
velocidad, capacidad y coste operativo continuo, no solo puntual.*

- [ ] Definir el efecto concreto: velocidad (menor `preparationTime`) o capacidad (más de
      un pedido en paralelo por `CookingStation`) en cocina o entrega.
- [ ] Costo fijo de contratación (M01/M02) **más** costo operativo continuo — ej. salario
      diario descontado periódicamente de `money`, no solo al contratar.
- [ ] Confirmar visualmente/por tiempo que el efecto se aplica y que el salario descuenta
      dinero con el tiempo.

**Player-visible outcome:** el jugador contrata a un empleado, nota un cambio observable
en el ritmo del loop, y ve su salario descontado del dinero con el tiempo.

**Completion criteria:** contratar cambia observablemente el ritmo del loop; el costo
operativo se refleja en el dinero del HUD con el tiempo.

---

## M16 — First complete loop

*Depende de: M01–M15 (integración, no sistemas nuevos).*

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
dependan de estos sistemas (M07, M09, M10, M13, M15, y los que se desglosen más adelante)
tengan esta dirección presente en vez de implementarse ignorándola. Cada sistema se
mantiene separado — no se fusionan en un único sistema monolítico de "economía". Desde la
"Regla de planificación" (2026-08-22, ver arriba), estos sistemas se implementan
progresivamente dentro de cada milestone de gameplay que los necesita (p.ej. M13 ya agrega
`cost`/UI de precios), no como preparación aparte antes de que la feature exista.*

### 1. Sistema de demanda de clientes

La generación de nuevos clientes no debe ser, a largo plazo, un spawn fijo independiente
del estado del restaurante — la demanda futura debe reaccionar al estado real del
restaurante. Factores a considerar (no una lista cerrada): capacidad del restaurante, mesas
disponibles, longitud de cola, saturación, reputación, calidad del servicio.

**Regla conceptual:** un restaurante completamente saturado no debería seguir generando
clientes al mismo ritmo indefinidamente. La demanda debe reducirse cuando la capacidad está
superada, para evitar colas infinitas, clientes entrando sin posibilidad real de servicio, y
una simulación poco realista.

Este sistema es precisamente M07 (Demand system foundation) — ya dividido en M07.1–M07.4
(reputación en M07.2, capacidad/saturación en M07.3) tras el cierre de M06 — no algo a
inventar más adelante. Los modificadores de demanda basados en precio o calidad de servicio
siguen siendo futuros (ver "M07 scope boundaries").

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

El roadmap posterior a M06 contempla, cada uno como sistema separado pero implementado
dentro de su propio milestone de gameplay (no como preparación aparte): demanda dinámica de
clientes (M07); recetas con costes (M10); menú y precios (M13); empleados con costes (M15);
contabilidad diaria y rentabilidad — todavía sin milestone propio, a definir cuando el loop
completo (M16) esté jugable y se sienta la necesidad real.

---

## Milestones futuros (sin desglosar)

A definir cuando se acerquen: ciclo día/noche, más mejoras y empleados, variedad de
mobiliario/decoración, arte definitivo (reemplazar rectángulos placeholder).
