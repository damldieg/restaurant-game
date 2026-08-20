# Project State

Not a changelog and not a status report — git log and the code already cover "what changed." This file exists only for the "why" that isn't recoverable from either: where things stand right now, and the next known step. Active decisions live in `DECISIONS.md`, not here. Hard cap: 1-2 screens. At that size, prune stale entries instead of archiving the whole file.

Update only at a completed milestone or a material change — not after every small task.

Mark anything not yet determined as `UNKNOWN` rather than guessing or silently omitting it — cheaper to flag once than to re-derive or contradict it later.

## Current state

`docs/MILESTONES.md` was reordered so construction/economy/reputation come before the customer
simulation loop; milestone numbers below refer to that new order, not the old one.

M01 (furniture catalog/construction), M02 (economy foundation), and M02.5 (core simulation
foundation) are done and verified (`pnpm test`: 23/23 passing; `tsc --noEmit` clean; all
verified in-browser with Playwright screenshots).

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

M03 (reputation foundation) is not started — `reputation` is still a fixed HUD placeholder.
M04's remaining tasks (stay timer, `leaving` state, walk to door and despawn) are also not
started — `NpcState` still only has `walking | idle | seated`; an NPC that sits down stays there
indefinitely. A table placed via the construction mode is not yet picked up by
`NpcController`/`findFreeTable` as seatable.

## Next known step

M03 — Reputation foundation (`docs/MILESTONES.md`). First unblocked task: `reputation` as real
game state with an initial value (belongs on `GameState`, following M02.5's pattern — not a new
scene field), then a reputation value added to each `FurnitureDefinition` in the catalog — both
are new `balancing_value` decisions to confirm before writing them into code. The pure
reputation-total calculation is a natural first candidate for a real `GameSystem`, or can start
as a plain function in `core/` and become one later — worth a quick call when M03 starts, not
predicted here.
