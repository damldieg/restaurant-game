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
  (`canAfford`), `placement.ts` (`isValidPlacement`).
- **`src/state/`** — `GameState` (`game-state.ts`): el estado central, compuesto a partir de lo
  que ya existe en `core/` (`money`, `furniture`). No conoce sprites ni objetos de Phaser.
- **`src/systems/`** — el contrato `GameSystem` (`game-system.ts`): `update(state, deltaMs)`,
  más `runSystems(state, deltaMs, systems)` para correr una lista de sistemas contra el
  `GameState`. Sin sistemas concretos todavía; cada milestone futuro (reputación, clientes,
  cocina, empleados) agrega el suyo.
- **Phaser (`src/main.ts`, `src/game/`)** — la capa de presentación: `RestaurantScene` crea el
  `GameState` inicial, lo consume para renderizar, y en cada frame llama
  `runSystems(gameState, delta, systems)` desde su propio `update(time, delta)`. `src/game/`
  todavía tiene código con dependencias de Phaser sin migrar (`grid.ts` — conversión a
  coordenadas de píxel — y `npc/` — sprites y tweens); no se movió porque tocarlo implicaba
  cambiar comportamiento existente, fuera del alcance de M02.5.

No se introdujo Redux, Zustand ni un framework ECS completo — `GameState` es un objeto plano y
los sistemas son funciones con una firma fija, deliberadamente simple hasta que un caso real
pida más.
