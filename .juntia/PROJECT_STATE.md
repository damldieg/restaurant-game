# Project State

Not a changelog and not a status report — git log and the code already cover "what changed." This file exists only for the "why" that isn't recoverable from either: where things stand right now, and the next known step. Active decisions live in `DECISIONS.md`, not here. Hard cap: 1-2 screens. At that size, prune stale entries instead of archiving the whole file.

Update only at a completed milestone or a material change — not after every small task.

Mark anything not yet determined as `UNKNOWN` rather than guessing or silently omitting it — cheaper to flag once than to re-derive or contradict it later.

## Current state

`docs/MILESTONES.md` was reordered so construction/economy/reputation come before the customer
simulation loop; milestone numbers below refer to that new order, not the old one.

Groundwork done and verified (`pnpm test`: 13/13 passing), listed under M04's "Ya completado" section:
tables/chairs linked by explicit `id`/`tableId`, two independent tables, multiple simultaneous NPCs via
`NpcController`. M01 (furniture catalog/construction), M02 (economy), and M03 (reputation foundation) are
not started — there is no purchasable furniture catalog, `money` isn't real state, and `reputation` isn't
either (the HUD text is a fixed placeholder). M04's remaining tasks (stay timer, `leaving` state, walk to
door and despawn) are also not started — `NpcState` still only has `walking | idle | seated`; an NPC that
sits down stays there indefinitely.

## Next known step

M01 — Furniture data and construction (`docs/MILESTONES.md`). First unblocked task: "Crear catálogo de
muebles comprables: `FurnitureDefinition { type, name, price }`".
