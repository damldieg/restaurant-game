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

## Next known step

M06 was renamed **"Customer flow robustness"** and fully rewritten in `docs/MILESTONES.md`
(2026-08-21, planning-only — no `src/` changes) to drop its stale "Reservas robustas" framing,
which predated M04's architecture change and referenced files that never existed as planned
(`game/reservations.ts`) or were already removed (`game/npc/controller.ts`, gone since M04.4).
It is **not** a traditional reservation system — table occupancy keeps being derived from
`state.customers` on every read (the M04.4/M04.6 decision), never a separate tracked structure.
Split into six small, independently-verifiable sub-steps (M06.1–M06.6, same pattern as
M04.1–M04.8/M05.1–M05.5), consolidating and formalizing what M04–M05 already built rather than
adding new player-visible behavior in most steps: M06.1 (lifecycle state hardening — document
and test the invariants each `CustomerState` already holds implicitly), M06.2 (table assignment
as an explicit, named domain function — `getOccupiedTableIds`, extracted from inline logic in
`assignTables`), M06.3 (capacity/queue-size as explicit domain queries — `isRestaurantFull`,
consolidating what M05.2's queue already does implicitly), M06.4 (confirm M05.3/M05.4's patience
system integrates cleanly with M06.1–M06.3's new invariants, no behavior change), M06.5
(end-to-end test proving the release→reassignment cycle, finally exercising M05.2's
`resolveTableQueue` outside its own tests), M06.6 (in-browser validation closing M06, same kind
of review as M05.5/PR #23). Fixed two stale forward-references to the old "M06 reservas" framing
in `docs/MILESTONES.md`'s M07 and M15 sections (dependency lines + M15's `releaseTable`
mention, which this redesign deliberately does not introduce as a standalone function).

**M06.1 (Customer lifecycle state hardening) — done.** Documentation + tests only, no
gameplay change. `core/customers/customer-state.ts` gained a comment above `CustomerState`
documenting the transition table and per-state invariants (`idle` ⇒ `tableId === null`;
`seated` ⇒ `tableId !== null && stayRemainingMs !== null`; `waiting` ⇒
`waitReason !== null`; `leaving` ⇒ all three null) — no new type, no runtime validator,
`CustomerState` is still the same 5-string union. Real finding during implementation: the
`seated` invariant is **not** guaranteed by `moveCustomer` alone — its `walking → seated`
arrival leaves `stayRemainingMs` null; `advanceStay`, running immediately after in the same
`CustomerSystem.update` pipeline tick, is what actually sets it. Tests landed at two levels
because of that: per-function in `customer.test.ts` (`describe("state invariants")`, each
invariant checked against the function that actually produces it, including the explicit
impossible-transition case — a `waiting` customer arriving at its queue slot never becomes
`seated` via `moveCustomer`), and as a full invariant in `customer-system.test.ts` (20
one-second ticks with queueing/seating/patience-abandonment, asserting every `Customer` in
`state.customers` satisfies its state's invariant at every checkpoint — the only place the
`seated` invariant is actually guaranteed end-to-end). `pnpm test` (104/104 — 95 + 9 new)
and `tsc --noEmit` clean; `pnpm build` clean. No browser check needed (same precedent as
M04.2/M05.1) — no new code path produces a different state or transition.

## Next known step

**M06.2 (Table assignment as domain state)** — extract the table-occupancy derivation that
lives inline at the top of `assignTables` (`core/customers/customer.ts`) into a named, pure
function (`getOccupiedTableIds` or equivalent), formalize the single-assignment invariant as
an explicit test, and confirm `sendToExit` remains the sole table-release point — no
`releaseTable` function, no separate occupancy structure (see `.juntia/ARCHITECTURE.md`'s
"Ocupación de mesas como estado de dominio" note). Full spec in `docs/MILESTONES.md` (M06 —
Customer flow robustness).
