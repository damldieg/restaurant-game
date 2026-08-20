# Project State

Not a changelog and not a status report — git log and the code already cover "what changed." This file exists only for the "why" that isn't recoverable from either: where things stand right now, and the next known step. Active decisions live in `DECISIONS.md`, not here. Hard cap: 1-2 screens. At that size, prune stale entries instead of archiving the whole file.

Update only at a completed milestone or a material change — not after every small task.

Mark anything not yet determined as `UNKNOWN` rather than guessing or silently omitting it — cheaper to flag once than to re-derive or contradict it later.

## Current state

`docs/MILESTONES.md` was reordered so construction/economy/reputation come before the customer
simulation loop; milestone numbers below refer to that new order, not the old one.

M01 (furniture catalog/construction) and M02 (economy foundation) are done and verified
(`pnpm test`: 20/20 passing; `tsc --noEmit` clean; both verified in-browser with Playwright
screenshots). `FurnitureDefinition` catalog lives in `src/game/furniture-catalog.ts` (table
$100 / chair $25 — confirmed product decision, see `DECISIONS.md`). `isValidPlacement`
(`src/game/placement.ts`) checks grid bounds and collision. Interactive placement (key `1`,
cursor preview green/red, Esc cancels, click confirms) is wired in `src/main.ts` and only
creates `table` instances — `chair` stays in the catalog with a defined price but has no
placement mode yet, since it needs a `tableId` no M01/M02 task collects. `money` is real scene
state in `src/main.ts` (initial $500 — confirmed product decision), shown in the HUD, deducted
via `canAfford`/`economy.ts` on each confirmed placement; placement (preview + click) is blocked
whenever the player can't afford the selected item.

M03 (reputation foundation) is not started — `reputation` is still a fixed HUD placeholder.
M04's remaining tasks (stay timer, `leaving` state, walk to door and despawn) are also not
started — `NpcState` still only has `walking | idle | seated`; an NPC that sits down stays there
indefinitely. A table placed via the construction mode is not yet picked up by
`NpcController`/`findFreeTable` as seatable — that wiring isn't an M01/M02 task either.

## Next known step

M03 — Reputation foundation (`docs/MILESTONES.md`). First unblocked task: `reputation` as real
game state with an initial value, then a reputation value added to each `FurnitureDefinition` in
the catalog — both are new `balancing_value` decisions to confirm before writing them into code.
