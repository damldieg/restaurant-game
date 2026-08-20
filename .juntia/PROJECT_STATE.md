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

M05 (Waiting and satisfaction) is broken into an M05.1–M05.5 incremental plan in
`docs/MILESTONES.md`, same pattern as M04.1–M04.8. Two architecture decisions were confirmed
before starting — see `.juntia/DECISIONS.md`: `GameState.reputationAdjustments` as the
accumulator, and "Customer lifecycle events ownership" (`CustomerSystem` owns lifecycle
transitions/events; `ReputationSystem` never inspects `state.customers`).

**M05.1 (Customer waiting state) — done:** `CustomerState` gained `"waiting"`; `Customer`
gained `waitReason: WaitReason | null` (`WaitReason = "table"` for now, room for `order`/`food`
later) and `waitRemainingMs: number | null` (same countdown pattern as `stayRemainingMs`). Pure
data — no code path sets `state: "waiting"` yet, so `pnpm test` (74/74)/`tsc --noEmit`/`pnpm
build` are the only verification needed (no browser check, nothing new to observe).

**M05.2 (Table queue system) — done:** `core/customers/customer.ts` gained
`getQueueSlotPosition(index)` (an open-ended formula — a horizontal line beside `ENTRY_TARGET`,
not a fixed-size array, so there's no arbitrary queue-length cap) and `findFreeQueueSlot`.
`assignTables` now handles `waiting` customers too, trying them before `idle` ones — achieved
for free by processing `customers` in their existing (never-reordered) array order, since a
customer that started waiting earlier is always earlier in the array than one that just went
idle. An `idle` customer with no free table now transitions to `waiting` (`waitReason: "table"`,
`target` = first free queue slot) instead of getting stuck `idle` forever; `assignTables` itself
now clears `waitReason`/`waitRemainingMs` when a waiting customer finally gets a table. M05.1's
noted `sendToExit` follow-up (it doesn't clear those same two fields) is still open — harmless
for now since `sendToExit` still only fires from `advanceStay`, never on a `waiting` customer;
still needs fixing once M05.3's `advanceWait` starts calling `sendToExit` on one. New standalone
`resolveTableQueue` (FIFO) exists for M06's future `releaseTable` to
reuse, even though `assignTables`'s own array-order processing already achieves the same
ordering internally. Real bug found and fixed during implementation: initial queue-slot-occupancy
tracking only checked `customer.target`, but an already-arrived waiting customer has `target:
null` (like any arrival) while still standing at the slot — fixed with `target ?? position`.
Tested in `customer.test.ts` (FIFO order, slot-skipping, waiting-before-idle priority, no
double-assigned slots, wait-field clearing) and `customer-system.test.ts` (updated two
now-outdated M04.6-era tests that assumed a tableless customer stays `idle` forever). Verified
in-browser with Playwright (~18s run): with more customers than tables, the overflow forms a
visible horizontal line of distinct, non-overlapping positions next to the entry point; HUD and
furniture unaffected; zero console errors. `pnpm test` (82/82) and `tsc --noEmit` clean; `pnpm
build` clean.

**M05.3 (Waiting patience) — done:** `core/customers/customer.ts` gained `WAIT_DURATION_MS =
15_000` (confirmed product decision — same balancing-value pattern as `STAY_DURATION_MS`) and
`advanceWait(customer, deltaMs)`, an exact mirror of `advanceStay`: lazily initializes
`waitRemainingMs` the first time it sees a `waiting` customer, counts it down, and calls
`sendToExit` once it runs out. `sendToExit` now also clears `waitReason`/`waitRemainingMs` (it
already unconditionally cleared `stayRemainingMs`) — the exact follow-up M05.2 flagged as open,
since M05.3 is the first case where a customer can reach `sendToExit` with those fields non-null.
Real bug found and fixed during implementation: `CustomerSystem.update`'s pipeline order
(inherited from M04, `assignTables` before `advanceStay`) let a table freed by an expiring stay
sit unassigned for one extra tick — harmless with unlimited patience (M05.2), but with M05.3's
finite patience that extra tick could be enough for the front-of-queue customer's own patience to
expire in the same tick the table freed, sending it away one tick before it would have been
seated. Fixed by reordering to `moveCustomer → advanceStay → assignTables → advanceWait →
removeDepartedCustomers`, so a table freed this tick is reassigned this same tick, before
`advanceWait` runs. Caught by an already-existing M05.2 test (`customer-system.test.ts`, "frees a
table once its customer starts leaving...") that started failing once patience was added — the
pipeline fix made it pass again unchanged. Tested in `customer.test.ts` (`advanceWait` countdown,
lazy init, exit transition, no-mutation; `sendToExit` clears the wait fields). Verified in-browser
with Playwright (~28s run, screenshots every 3-8s): zero console errors, M05.2's queue-line
behavior intact, HUD/money unchanged, queue size stays bounded rather than growing unboundedly
despite arrivals (1/2.5s) outpacing table turnover (~1/5s) in this 2-table layout — consistent
with patience-abandonment actually removing customers from the queue (exact timing is covered
directly by the unit tests, not re-derived visually). `pnpm test` (88/88) and `tsc --noEmit`
clean; `pnpm build` clean.

**M05.4 (Customer reputation events) — done:** `GameState.reputationAdjustments: number` (initial
`0`), and `ReputationSystem.update` now sets `state.reputation = calculateTotalReputation(...) +
reputationAdjustments` — still never inspects `state.customers` (confirmed "Customer lifecycle
events ownership" decision). `CustomerSystem.update` applies the delta exactly once per exit
event by comparing `state.customers` snapshots before/after each pipeline step, via a new pure
`countTransitionsToLeaving(before, after, fromState)` in `core/customers/customer.ts`: `+1` per
`seated → leaving` right after `advanceStay` (completed cycle), `-2` per `waiting → leaving`
right after `advanceWait` (patience abandon) — both confirmed product decisions.
`advanceStay`/`advanceWait`/`sendToExit` are unchanged from M05.3; the attribution lives entirely
in `CustomerSystem`, keeping `sendToExit` generic. Tested in `customer.test.ts`
(`countTransitionsToLeaving`), `customer-system.test.ts` (reward/penalty applied exactly once,
no double-counting on a later tick — required working out real elapsed-distance/spawn-timing
numbers so a second, unrelated customer wouldn't also complete a cycle in the same test tick),
and `reputation-system.test.ts` (adjustments added regardless of `state.customers`). Verified
in-browser with Playwright (~36s run, screenshots every 3-5s): HUD reputation went 8 → 9 (a
completed cycle) → 10 (another) → 8 (a patience abandon, dropping exactly 2), directly visible in
the HUD text; zero console errors throughout. `pnpm test` (95/95) and `tsc --noEmit` clean;
`pnpm build` clean.

Next: M05.5 — validation and integration (closes M05): verify the full queued lifecycle in-browser
(`entering → walking → waiting → seated → leaving → removed`, 2 tables + 3+ customers), confirm no
duplicated responsibilities between `CustomerSystem`/`ReputationSystem`/`CustomerRenderer`, no new
functionality expected.
