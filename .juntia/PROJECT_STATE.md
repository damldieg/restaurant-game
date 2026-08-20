# Project State

Not a changelog and not a status report — git log and the code already cover "what changed." This file exists only for the "why" that isn't recoverable from either: where things stand right now, and the next known step. Active decisions live in `DECISIONS.md`, not here. Hard cap: 1-2 screens. At that size, prune stale entries instead of archiving the whole file.

Update only at a completed milestone or a material change — not after every small task.

Mark anything not yet determined as `UNKNOWN` rather than guessing or silently omitting it — cheaper to flag once than to re-derive or contradict it later.

## Current state

`docs/MILESTONES.md` was reordered so construction/economy/reputation come before the customer
simulation loop; milestone numbers below refer to that new order, not the old one.

M01 (furniture catalog/construction), M02 (economy foundation), M02.5 (core simulation
foundation), M03 (reputation foundation), and M03.5 (customer architecture review) are done.
`pnpm test`: 27/27 passing; `tsc --noEmit` clean; M01–M03 verified in-browser with Playwright
screenshots. M03.5 was analysis/planning only — no `src/` file changed, no test count change.

**Architecture (M02.5 — see `.juntia/ARCHITECTURE.md` for the full picture):**

```
GameState  →  Game Systems  →  Phaser Renderer
```

- `src/core/` — pure business logic and data, never imports `phaser`: `restaurant.ts`
  (furniture data, `findFreeTable`, `getSeatForTable`), `furniture-catalog.ts`
  (`FurnitureDefinition`, table $100 / chair $25), `economy.ts` (`canAfford`), `placement.ts`
  (`isValidPlacement`).
- `src/state/game-state.ts` — `GameState { money, furniture }`, composed from what already
  existed in `core/`. `RestaurantScene` owns one instance (`this.gameState`) and reads/writes
  through it instead of holding its own `money` field or importing `furniture` directly.
- `src/systems/game-system.ts` — the `GameSystem` contract (`update(state, deltaMs)`) and
  `runSystems(state, deltaMs, systems)`. No concrete system exists yet; `RestaurantScene.systems`
  is an empty array. `RestaurantScene.update(time, delta)` (Phaser's own per-frame hook) already
  calls `runSystems`, so the loop is real and wired, just a no-op until the first system lands.
- `src/game/` still holds Phaser-coupled code not moved in M02.5: `grid.ts` (pixel/world
  coordinate conversion — imported by `core/`, not the other way around), `main.ts`
  (`RestaurantScene`), and `npc/` (`controller.ts` mixes sprite/tween rendering with NPC state
  transitions — untangling that was out of scope for M02.5, since it risks changing M04's
  existing NPC behavior).

Furniture catalog: table $100 / chair $25 (confirmed decision). Interactive placement (key `1`,
cursor preview green/red, Esc cancels, click confirms) only creates `table` instances — `chair`
has no placement mode yet, since it needs a `tableId` no task through M02.5 collects. `money`
starts at $500 (confirmed decision), shown in the HUD, deducted via `canAfford` on each confirmed
placement; placement is blocked whenever the player can't afford the selected item.

**M03 (reputation foundation):** `reputation` is real `GameState` (initial value 0 — confirmed
decision), shown in the HUD. `FurnitureDefinition` in the catalog carries a `reputation` value
per type (Mesa +3 / Silla +1 — confirmed decision). `core/reputation.ts` exports the pure
`calculateTotalReputation(furniture, catalog)`. `systems/reputation-system.ts` is the first real
`GameSystem` — `ReputationSystem.update` recalculates `state.reputation` from `state.furniture`
every frame, so placing a table/chair (or the 2 starter tables + 2 starter chairs already in
`restaurant.ts`) is reflected in the HUD without any placement-site-specific recalculation code.

**M03.5 (customer architecture review):** analyzed `game/npc/npc.ts` (already pure) and
`game/npc/controller.ts` (mixes `npcs[]`/`occupiedTables` with sprites/tweens; state transitions
today fire inside a Phaser tween's `onComplete`, not a simulation tick). Confirmed architecture
decision (see `.juntia/DECISIONS.md` and `.juntia/ARCHITECTURE.md`'s "Próxima extensión:
Customer" section) for M04: `core/customers/` (`customer.ts` + `customer-state.ts`, the first
subfolder in `core/`) + `GameState.customers: Customer[]` + `systems/customer-system.ts`
(`CustomerSystem`, same pattern as `ReputationSystem`) + `game/npc/controller.ts` reduced to a
pure reader of `state.customers`. `docs/MILESTONES.md`'s M04 section carries the 5-step
incremental plan to get there. Nothing implemented — `NpcState` still only has
`walking | idle | seated`; an NPC that sits down stays there indefinitely; a table placed via
construction mode is not yet picked up by `NpcController`/`findFreeTable` as seatable;
`occupiedTables` is untouched (still M06's job).

## Next known step

M04 — Basic customer lifecycle (`docs/MILESTONES.md`), following M03.5's confirmed architecture
and its step-1 first: move `Npc`/`NpcState` into `core/customers/customer.ts` unchanged, migrate
`npc.test.ts` with it, keep everything else exactly as it behaves today. The stay-timer duration
(needed once "quedarse y salir" is reached) is a new `balancing_value` decision to confirm before
writing it into code — not needed for step 1.
