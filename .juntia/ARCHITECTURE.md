# Architecture

Establecida en M02.5. Tres capas, una regla:

```
GameState
    ↓
Game Systems
    ↓
Phaser Renderer
```

**Regla principal: `core/` nunca importa `phaser`.** Toda la lógica de negocio se puede testear
con Vitest sin crear una escena de Phaser.

- **`src/core/`** — reglas, datos y lógica pura: `restaurant.ts` (furniture, `findFreeTable`,
  `getSeatForTable`), `furniture-catalog.ts` (`FurnitureDefinition`), `economy.ts`
  (`canAfford`), `placement.ts` (`isValidPlacement`), `reputation.ts`
  (`calculateTotalReputation`).
- **`src/state/`** — `GameState` (`game-state.ts`): el estado central, compuesto a partir de lo
  que ya existe en `core/` (`money`, `reputation`, `furniture`). No conoce sprites ni objetos de
  Phaser.
- **`src/systems/`** — el contrato `GameSystem` (`game-system.ts`): `update(state, deltaMs)`,
  más `runSystems(state, deltaMs, systems)` para correr una lista de sistemas contra el
  `GameState`. Primer sistema real: `reputation-system.ts` (`ReputationSystem`), que recalcula
  `state.reputation` a partir de `state.furniture` en cada frame usando
  `core/reputation.ts`. Cada milestone futuro (clientes, cocina, empleados) agrega el suyo.
- **Phaser (`src/main.ts`, `src/game/`)** — la capa de presentación: `RestaurantScene` crea el
  `GameState` inicial, lo consume para renderizar, y en cada frame llama
  `runSystems(gameState, delta, systems)` desde su propio `update(time, delta)`. `src/game/`
  todavía tiene código con dependencias de Phaser sin migrar (`grid.ts` — conversión a
  coordenadas de píxel — y `npc/` — sprites y tweens); no se movió porque tocarlo implicaba
  cambiar comportamiento existente, fuera del alcance de M02.5.

No se introdujo Redux, Zustand ni un framework ECS completo — `GameState` es un objeto plano y
los sistemas son funciones con una firma fija, deliberadamente simple hasta que un caso real
pida más.

## Próxima extensión: Customer (M03.5 → M04)

*Análisis de M03.5. Todavía no implementado — ningún archivo de `src/` cambió en esta fase.*

### Estado actual de `game/npc/`

- `npc.ts` — `NpcState`, `Npc { id, position, state }`, `createNpc`. Ya es lógica pura (sin
  `phaser`), solo que vive fuera de `core/`.
- `controller.ts` (`NpcController`) — mezcla tres cosas en una sola clase: la lista de
  simulación (`npcs: Npc[]`, `occupiedTables`), la representación visual (`sprites`, tweens), y
  la creación de ambas en el mismo método (`spawnNpc`). El problema real: las transiciones de
  estado (`walking → seated`) ocurren dentro del callback `onComplete` de un tween de Phaser, no
  en un tick de simulación — hoy Phaser es quien decide cuándo un cliente "llegó", y se lo avisa
  a la lógica de negocio después del hecho, en vez de que la lógica de negocio lo calcule con
  `deltaMs`.
- Riesgo evidenciado: `npc.test.ts` solo cubre `createNpc` — el spawn/asignación de mesa no tiene
  test alguno, porque depende de un `Phaser.Scene` real (`scene.add.rectangle`,
  `scene.tweens.add`, `scene.time.addEvent`).

### Decisión arquitectónica confirmada

```
core/
  customers/
    customer.ts        — Customer { id, position, state }, createCustomer (movido de npc.ts)
    customer-state.ts   — CustomerState y sus transiciones puras

state/
  game-state.ts          — + customers: Customer[]

systems/
  customer-system.ts      — CustomerSystem, mismo patrón que ReputationSystem:
                            recalcula/avanza state.customers cada tick

game/
  npc/
    controller.ts          — reducido a lector puro de state.customers (sprites/tweens),
                            ya no posee la lista de simulación ni dispara transiciones
                            de estado desde onComplete de un tween
```

Es la única subcarpeta dentro de `core/` (el resto — `restaurant.ts`, `economy.ts`,
`placement.ts`, `reputation.ts` — sigue plano); justificada porque `Customer` es la primera
entidad con estado propio y transiciones (`customer-state.ts`), a diferencia de los datos y
funciones sueltas que ya vivían en `core/`.

`occupiedTables` y el resto de `game/npc/` quedan igual por ahora — no es limpieza, es alcance
de M04 (`occupiedTables` es tarea de M06). Ver `.juntia/DECISIONS.md` para la decisión formal y
`docs/MILESTONES.md` (M03.5) para el plan de pasos incrementales hacia M04.
