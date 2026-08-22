# Project State

Not a changelog and not a status report — git log and the code already cover "what changed." This file exists only for the "why" that isn't recoverable from either: where things stand right now, and the next known step. Active decisions live in `DECISIONS.md`, not here. Hard cap: 1-2 screens. At that size, prune stale entries instead of archiving the whole file.

Update only at a completed milestone or a material change — not after every small task.

Mark anything not yet determined as `UNKNOWN` rather than guessing or silently omitting it — cheaper to flag once than to re-derive or contradict it later.

Every milestone/step close follows a mandatory workflow — validate → update docs → commit → push → open a PR
→ wait — recorded as project policy in `.juntia/governance/rules/agent-rules.md`, not here.

## Current state

`docs/MILESTONES.md` was reordered so construction/economy/reputation come before the customer
simulation loop; milestone numbers below refer to that new order, not the old one.

M01 (furniture catalog/construction), M02 (economy foundation), M02.5 (core simulation
foundation), M03 (reputation foundation), M03.5 (customer architecture review), and now M04
(basic customer lifecycle, M04.1–M04.8) are all done. `pnpm test`: 72/72 passing; `tsc --noEmit`
clean; every milestone verified in-browser with Playwright screenshots, no console errors. M04's
own step-by-step history (M04.1–M04.8) is preserved in `docs/MILESTONES.md` and PR history, not
repeated here — see "M04 (basic customer lifecycle) — done" below for the resulting shape.

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
  coordinate conversion — imported by `core/`, not the other way around) and `main.ts`
  (`RestaurantScene`). `game/npc/` (the original `controller.ts`, mixing sprite/tween rendering
  with NPC state transitions) existed at the time — untangling it was out of scope for M02.5
  since it risked changing M04's existing NPC behavior — but was removed in M04.4 once
  `game/customers/customer-renderer.ts` (`CustomerRenderer`) took over as its confirmed
  replacement.

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
today fire inside a Phaser tween's `onComplete`, not a simulation tick). Two confirmed
architecture decisions (see `.juntia/DECISIONS.md` and `.juntia/ARCHITECTURE.md`): (1) where
`Customer` code lives — `core/customers/` (`customer.ts` + `customer-state.ts`, the first
subfolder in `core/`) + `GameState.customers: Customer[]` + `systems/customer-system.ts`
(`CustomerSystem`, same pattern as `ReputationSystem`) + `game/npc/controller.ts` reduced to a
pure reader of `state.customers`; (2) the ownership principle — simulation (`GameState`/
`CustomerSystem`) is the sole source of truth for customer state, Phaser never drives a state
transition via tween/callback, only renders whatever `GameState` already says. `docs/
MILESTONES.md`'s M04 section carries the resulting M04.1–M04.8 incremental plan (plus a "scope
boundaries" list of what's explicitly out for later milestones). Nothing implemented yet at the
time — `NpcState` still only has `walking | idle | seated`; an NPC that sits down stays there
indefinitely; a table placed via construction mode is not yet picked up by
`NpcController`/`findFreeTable` as seatable; `occupiedTables` is untouched (still M06's job).

**M04 (basic customer lifecycle) — done.** Built incrementally as M04.1–M04.8 (each step's own
detail is in `docs/MILESTONES.md` and its merged PR, not repeated here); this is the resulting
shape. `game/npc/` (`Npc`/`NpcState`/`NpcController`, the old Phaser-tween-driven NPC code) is
gone entirely, replaced by:

- `core/customers/customer-state.ts` — `CustomerState = "walking" | "idle" | "seated" |
  "leaving"`.
- `core/customers/customer.ts` — `Customer { id, position, state, target, tableId,
  stayRemainingMs }`, zero Phaser dependency, plus the pure functions that make up the whole
  simulation: `spawnCustomer` (door → `ENTRY_TARGET`), `moveCustomer` (interpolates `position`
  toward `target` by `CUSTOMER_SPEED_TILES_PER_SEC` — confirmed decision, 1.5 tiles/sec — and on
  arrival transitions `walking` to `seated`/`idle` depending on whether a `tableId` is already
  set), `assignTables` (gives an `idle`, tableless customer the first free table via
  `findFreeTable`/`getSeatForTable`, never double-assigning within a pass — occupancy is derived
  fresh from `state.customers` every call, no separate `occupiedTables` list to desync),
  `advanceStay`/`sendToExit` (counts down `STAY_DURATION_MS` — confirmed decision, 10s — while
  `seated`, then sends the customer to `"leaving"` toward `DOOR_POSITION`, freeing its table
  immediately), and `removeDepartedCustomers` (drops any `"leaving"` customer once it reaches the
  door). `sendToExit`/`removeDepartedCustomers` are deliberately generic — not tied to why a
  customer is leaving — so M05/M09/M15 can reuse them for other abandon-and-despawn triggers
  without duplicating this logic.
- `systems/customer-system.ts` — `CustomerSystem.update` runs the whole pipeline every frame:
  `spawn → moveCustomer → assignTables → advanceStay → removeDepartedCustomers`.
- `game/customers/customer-renderer.ts` — `CustomerRenderer`, a pure reader of
  `state.customers`: creates/repositions/destroys sprites by id, never writes simulation state.
  Needed zero changes across M04.5–M04.8 — its destroy-on-disappear behavior (written in M04.4,
  before anything removed a customer) was already correct for M04.8's despawn.

Full loop verified in-browser with Playwright across every sub-step, including a ~32s M04.8 run
that observed a complete enter → find table → sit → stay 10s → leave → despawn cycle (customer
count visibly dropping) with zero console errors throughout.

**M05 (waiting and satisfaction) — done.** Built incrementally as M05.1–M05.5 (full detail in
`docs/MILESTONES.md` and PR history #19–#23), same pattern as M04. Two architecture decisions
confirmed before starting (see `.juntia/DECISIONS.md`): `GameState.reputationAdjustments` as an
accumulator, and "Customer lifecycle events ownership" (`CustomerSystem` owns lifecycle
transitions/events; `ReputationSystem` never inspects `state.customers`). Resulting shape:

- `CustomerState` gained `"waiting"`; `Customer` gained `waitReason: WaitReason | null`
  (`WaitReason = "table"` for now) and `waitRemainingMs: number | null` (same countdown pattern
  as `stayRemainingMs`).
- `core/customers/customer.ts` gained `getQueueSlotPosition(index)`/`findFreeQueueSlot`
  (open-ended queue line beside `ENTRY_TARGET`, no fixed cap) and `resolveTableQueue` (standalone
  FIFO, built for M06 to reuse). `assignTables` tries `waiting` customers before `idle` ones (free
  via array-order processing) and sends a tableless `idle` customer to `waiting` when no table is
  free.
- `WAIT_DURATION_MS = 15_000` and `advanceWait` (mirrors `advanceStay`) send an expired-patience
  customer to exit via `sendToExit`, which now also clears `waitReason`/`waitRemainingMs`.
  `CustomerSystem.update`'s pipeline order is `moveCustomer → advanceStay → assignTables →
  advanceWait → removeDepartedCustomers` (reordered from M04 so a table freed this tick can be
  reassigned this same tick, before patience is evaluated).
- `GameState.reputationAdjustments: number` (initial `0`); `ReputationSystem.update =
  calculateTotalReputation(...) + reputationAdjustments`, still never touching
  `state.customers`. `CustomerSystem` applies the delta exactly once per exit event via
  `countTransitionsToLeaving(before, after, fromState)`: `+1` per completed stay (`seated →
  leaving`), `-2` per patience abandon (`waiting → leaving`) — both confirmed product decisions.

Verified in-browser with Playwright across every sub-step, culminating in M05.5's 45s run: full
queued lifecycle observed, non-overlapping queue line, HUD reputation moving exactly as expected
on each event type, zero console errors throughout. `pnpm test`: 95/95 passing; `tsc --noEmit`/
`pnpm build` clean.

**Repository governance:** `main` is branch-protected on GitHub. `.github/workflows/ci.yml`
(new) runs `pnpm install --frozen-lockfile` → `pnpm test` → `pnpm build` as the `build-and-test`
check, required and kept up-to-date-with-`main` (`strict: true`) before merge. Merge policy on
`main`: every change needs a PR (no direct pushes), at least 1 approval (stale approvals
dismissed on new commits), the `build-and-test` check passing, and all PR conversations
resolved; force pushes and branch deletion are blocked. `enforce_admins` is on, so none of this
is bypassable, including by repo admins. No linter is configured in this project (no ESLint or
similar in `package.json`/lockfile) — deliberately not added as a side effect of setting this up,
since a new dependency and tooling choice needs its own call, not a silent pick.

**Known limitation:** this is a solo-maintained repo, and GitHub blocks a PR author from
approving their own PR. With `required_approving_review_count: 1` and no other collaborator, no
PR — including the one that added this very note — can be merged through the UI without either a
second GitHub account/collaborator reviewing it, or relaxing the rule (e.g., temporarily dropping
the approval requirement, or adding a bypass actor in a repository ruleset). Not fixed here since
it's a real judgment call, not an implementation detail.

**M06 (Customer flow robustness) — done.** Redefined (2026-08-21) from a stale "Reservas
robustas" plan that predated M04's architecture and referenced files that never existed
(`game/reservations.ts`) or were already removed (`game/npc/controller.ts`, gone since
M04.4). Not a traditional reservation system — table occupancy keeps being derived from
`state.customers` on every read (the M04.4/M04.6 decision), never a separate tracked
structure. Built incrementally as M06.1–M06.6 (full detail in `docs/MILESTONES.md` and PR
history #24–#31), same pattern as M04/M05, consolidating/formalizing what M04–M05 already
built rather than adding new player-visible behavior in most steps. Resulting shape:

- `core/customers/customer-state.ts` gained a documented `CustomerState` transition table
  and per-state invariants as a comment (M06.1) — no new type, no runtime validator. Key
  subtlety found: the `seated` invariant (`tableId`/`stayRemainingMs` both non-null) is only
  guaranteed at the end of a full `CustomerSystem.update()` tick, not by `moveCustomer`
  alone — `advanceStay` completes it in the same tick.
- `core/customers/customer.ts` gained `getOccupiedTableIds`, `isRestaurantFull`,
  `getTableQueuePosition`, `getTableQueueSize` (M06.2/M06.3) — named domain queries
  extracted from previously-inline logic, zero behavior change (every M04/M05 test stayed
  green throughout). `resolveTableQueue` now derives from a shared `getTableQueue` helper
  (was `.find(...)`, same result). Ownership decision confirmed and recorded in
  `.juntia/ARCHITECTURE.md`: `Customer.tableId` is the sole source of truth for table
  occupancy — no `occupiedTables`, no `Table.isOccupied`, no standalone `releaseTable`.
- M06.4/M06.5 added integration tests only (no production code changed) confirming M05.3/
  M05.4's patience system and the table release→reassignment cycle work correctly against
  the new domain functions — the latter exercising `resolveTableQueue` for the first time
  outside its own M05.2 unit tests. Real findings along the way: a patience abandonment
  frees a queue slot, not a table; a table freed by a completed stay is reassigned to the
  queue within the same tick, so `isRestaurantFull` never observably dips while someone's
  waiting.
- Found and documented, not fixed (out of scope): `findFreeTable`/`getSeatForTable`
  (`core/restaurant.ts`) search their own module-level `furniture` export rather than the
  `furnitureList` parameter callers pass in — harmless today only because
  `GameState.furniture` is literally that same array reference, never a copy.

M06.6 verified the whole milestone in-browser (Playwright, 60s run, default 2-table layout):
full queued lifecycle (`entering → walking → waiting → seated → leaving → removed`)
repeatedly observed; queue always a clean horizontal line of non-overlapping positions, even
with 6+ waiting; reputation moving both up (+1 completed cycles) and down (-2 patience
abandons, net negative over this long a run with only 2 tables — consistent with the
arrivals-outpacing-turnover dynamic already documented since M05.3); `Dinero: $500`
unaffected; zero console errors; no double table assignments or impossible states observed.
`ReputationSystem`/`CustomerRenderer`/`CustomerSystem` responsibility boundaries
re-confirmed unchanged by direct code read (same three files as M05.5). `pnpm test`:
122/122 passing throughout M06; `tsc --noEmit`/`pnpm build` clean.

Also during M06 (planning-only, not part of the milestone itself): a future-roadmap vision
for demand/economy was documented in `docs/MILESTONES.md` ("Visión futura — demanda
dinámica y economía de gestión") and confirmed as a product decision via `juntia confirm` —
see `.juntia/DECISIONS.md`, "Restaurant simulation economy model."

**M07 (Demand system foundation) redefined (2026-08-22, planning-only — no `src/`
changes).** Renamed from "M07 — Demand" to "M07 — Demand system foundation" and split into
five small, independently-verifiable sub-steps in `docs/MILESTONES.md` (M07.1–M07.5, same
incremental pattern as M04–M06), replacing what used to be a single flat checklist:
M07.1 (foundation — decide `core/demand.ts` as the pure-logic home, separate from
`core/customers/customer.ts` and `systems/customer-system.ts`, define the future function's
signature, no computation yet), M07.2 (reputation-based spawn interval, with min/max
bounds), M07.3 (capacity/saturation awareness, reusing M06.3's `isRestaurantFull`/
`getTableQueueSize`), M07.4 (documents future demand modifiers — pricing, service quality,
recipes, decoration, employees, events — without implementing any), M07.5 (in-browser
validation closing M07, same kind of review as M05.5/M06.6). Added an "M07 scope
boundaries" list (menu, recipes, pricing, production costs, salaries, employees, kitchen,
waiters, payments, advanced marketing, special events — all out of scope). Confirmed as a
product decision via `juntia confirm` — see `.juntia/DECISIONS.md`, "Customer demand
depends on restaurant state." No architecture change recorded in `.juntia/ARCHITECTURE.md`
— M07.1's `core/` (pure logic) + `systems/` (execution) split is a direct application of
the pattern already documented there (same as `core/reputation.ts`/`ReputationSystem`), not
a new principle.

**M07.1 (Demand model foundation) — done (2026-08-22).** Added `core/demand.ts`, exporting
only `type DeriveSpawnIntervalMs = (reputation: number) => number` — a type contract, not a
callable stub, so no invented formula exists for M07.2 to undo. `systems/customer-system.ts`
gained a comment on `SPAWN_INTERVAL_MS` documenting that it will be replaced by this
function's result once M07.2 implements it; the constant and spawn loop themselves are
unchanged. Also fixed a stale `NPC_SPAWN_INTERVAL_MS`/`NpcController`/`main.ts` reference in
that same comment, left over from before the M03.5 Customer refactor. No behavior change;
`pnpm test` 122/122, `tsc --noEmit` clean. No new architecture decision — direct application
of the existing `core`/`systems` split (same as `core/reputation.ts`/`ReputationSystem`).

## Next known step

**Next real task: M07.2 (Reputation-based demand)** — implement `deriveSpawnIntervalMs`
against `state.reputation` with min/max interval bounds, replace `CustomerSystem`'s fixed
`SPAWN_INTERVAL_MS` with it, and add monotonicity/boundary tests. Balance values (min/max
interval, scaling curve) are not objectively correct — confirm as a product decision before
fixing them in code, same pattern as other balance values (`.juntia/DECISIONS.md`). Not
started yet.
