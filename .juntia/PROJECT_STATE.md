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
foundation), M03 (reputation foundation), and M03.5 (customer architecture review) are done.
M04 (basic customer lifecycle) is in progress — `docs/MILESTONES.md`'s M04 section is an
M04.1–M04.8 incremental plan (plus an explicit "scope boundaries" list); M04.1–M04.7 are done.
`pnpm test`: 61/61 passing; `tsc --noEmit` clean; M01–M03 verified in-browser with Playwright
screenshots; M04.3–M04.7 also verified in-browser (no console errors). M04.4 was a visual
regression by design (sprite sat at the door, no movement) — M04.5 resolved it (customers walk
from the door toward the counter), M04.6 extended it (customers split off toward one of the two
tables and walk to their assigned seat), and M04.7 completes the loop so far: a customer that
reaches its seat now stays `seated` there instead of just going `idle`.

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

**M04.1 (Customer entity) — done:** `src/core/customers/` (new subfolder, per M03.5's confirmed
decision) holds `customer-state.ts` (`CustomerState = "walking" | "idle" | "seated"`, no
transitions implemented yet) and `customer.ts` (`Customer { id, position, state }`,
`createCustomer`) — a pure simulation entity with zero Phaser dependency, tested in
`customer.test.ts` (creation + all three initial states). `target`/`tableId` are documented as
future fields in a code comment, not implemented.

**M04.2 (CustomerSystem base + GameState integration) — done:** `GameState` gained
`customers: Customer[]` (empty in `createGameState`, same pattern as `reputation`).
`systems/customer-system.ts` — `CustomerSystem implements GameSystem`, `update(state, deltaMs)`,
zero Phaser dependency, registered in `RestaurantScene.systems` (`main.ts`) alongside
`ReputationSystem` — so `state.customers` now has an official place to be updated every frame via
`runSystems`. `CustomerSystem.update` is intentionally a no-op today (tested: doesn't throw,
`state.customers` stays empty) — a correct extension point for M04.3's spawn logic, not a
placeholder that does anything yet. Deliberately isolated: `Npc`/`NpcState`, `NpcController`, and
`occupiedTables`/`findFreeTable` are all untouched — nothing about existing NPC behavior changed;
`main.ts`'s only change is the two-line system registration.

**M04.3 (Customer spawning lógico) — done:** `core/customers/customer.ts` gained
`DOOR_POSITION` (pure, derived from `RESTAURANT_COLS`/`RESTAURANT_ROWS` — same door tile
`NpcController.spawnNpc()` already used) and `spawnCustomer(id)` (returns a `Customer` there,
`state: "walking"`). `CustomerSystem` is no longer a no-op: it accumulates `deltaMs` and calls
`spawnCustomer` every `SPAWN_INTERVAL_MS` (2500ms — confirmed decision, same cadence as
`NpcController`'s `NPC_SPAWN_INTERVAL_MS`, kept in sync deliberately since both loops will need
reconciling once M04.4 replaces `NpcController`'s own spawn), pushing into
`state.customers`. No movement, tables, or new states beyond `walking` yet. `NpcController`,
`RestaurantScene`, `GameState`, and `main.ts` are all untouched — two independent, non-interacting
spawn loops now run side by side (Phaser's visible NPCs via `NpcController`, and invisible
simulated `Customer`s via `CustomerSystem`), which is expected until M04.4 gives `Customer` a
renderer.

**M04.4 (Customer rendering) — done:** `src/game/npc/` (`npc.ts`, `controller.ts`,
`npc.test.ts` — `Npc`/`NpcState`/`NpcController`) was deleted entirely and replaced by
`src/game/customers/customer-renderer.ts` (`CustomerRenderer`), per M03.5's already-confirmed
architecture decision that `game/npc/controller.ts` ends up "reducido a lector puro de
`state.customers`". `CustomerRenderer.update(customers)` reads `GameState.customers` every
frame — creates a rectangle sprite (same visual as the old NPCs: 22×28, `0xc97a5b`) the first
time it sees a given `Customer.id`, and repositions the existing sprite via `gridToWorldCenter`
otherwise; it never writes to `CustomerState` or `GameState`. `main.ts` no longer owns
`NpcController` or its own spawn timer (`NPC_SPAWN_INTERVAL_MS`) — `RestaurantScene.update`
calls `customerRenderer.update(state.customers)` right after `runSystems`, so `CustomerSystem`
(spawning) and `CustomerRenderer` (drawing) are now the only two things producing customer
behavior, both driven by the same `GameState`. `update` also destroys and drops the sprite for
any id no longer present in the incoming `customers` list — dead code today (nothing removes a
`Customer` from `state.customers` until M04.8), but written now so a sprite never outlives its
`Customer` and leaks once despawning is real. Tested in `customer-renderer.test.ts` with a mock
`Phaser.Scene` (no real canvas/WebGL): creates a sprite once per new id, updates position on an
existing sprite, destroys a sprite whose customer disappeared, never recreates a destroyed id,
never mutates the `Customer` objects it reads.

**M04.5 (Customer movement simulation) — done:** `Customer` gained `target: GridPosition |
null` (`core/customers/customer.ts`); `spawnCustomer` now sets `target: ENTRY_TARGET` (the same
point `NpcController.spawnNpc()` used to call `entryTarget`, now a real simulation destination
instead of a Phaser tween). `CUSTOMER_SPEED_TILES_PER_SEC = 1.5` (confirmed decision, see
`.juntia/DECISIONS.md` — a `balancing_value`, escalated via `.juntia/pending.json` and answered
through `juntia confirm` before being written into code). `moveCustomer(customer, deltaMs)` is a
new pure function: interpolates `position` toward `target` by speed × `deltaMs`, without
mutating the input; on arrival (the reachable step in this `deltaMs` covers or exceeds the
remaining distance), it snaps `position` to `target` exactly, clears `target` to `null`, and
transitions a `walking` customer to `idle` (no table assignment yet — that's M04.6/M04.7).
`CustomerSystem.update` now calls `moveCustomer` on every customer each frame, after the spawn
loop. `CustomerRenderer` (M04.4) needed no changes — it already repositions sprites from
`Customer.position` every frame. Tested in `customer.test.ts` (no-target no-op, partial
movement without arriving, exact snap + target clear on arrival, `walking`→`idle` transition,
non-walking state untouched on arrival, no mutation of the input) and `customer-system.test.ts`
(a spawned customer's position changes on a later update while still `walking`; given enough
time it reaches `idle` with `target: null`). Verified in-browser with Playwright (screenshots at
1s/3s/6s/8s): a customer sprite appears near the door and visibly moves toward the counter
across consecutive screenshots before settling once it arrives; HUD and furniture unaffected; no
console errors.

**M04.6 (Find and reserve table) — done:** `Customer` gained `tableId: string | null`
(`core/customers/customer.ts`). New pure function `assignTables(customers, furnitureList)`:
for every `idle` customer without a `tableId` (i.e. one that just arrived at `ENTRY_TARGET`,
per M04.5), finds the first free table via the existing `findFreeTable`/`getSeatForTable`
(`core/restaurant.ts`), assigns its `id` as `tableId`, sets `target` to the table's chair
position, and flips `state` back to `walking` so `moveCustomer` carries it there next frame; a
customer left without a free table stays `idle` with `tableId: null`. Never double-assigns the
same table within one call — tracks occupied table positions locally, seeded from customers that
already have a `tableId` and extended as it assigns more within the same pass, so two customers
arriving in the same frame never receive the same table. There is no separate `occupiedTables`
list to keep in sync (that was deleted with `NpcController` in M04.4) — occupancy is derived
fresh from `state.customers` every frame. `CustomerSystem.update` calls `assignTables` right
after `moveCustomer`. Deliberately not yet implemented: the `walking → seated` transition on
arrival at the seat — a customer that reaches its assigned chair today just goes back to `idle`
standing there (same arrival logic M04.5 already had), not visibly "seated"; that's M04.7.
Tested in `customer.test.ts` (assigns first free table, leaves non-idle/already-assigned
customers untouched, no double-assignment across two customers in one call, treats an
already-assigned table as occupied, leaves a customer idle/tableless when none is free, doesn't
mutate inputs) and `customer-system.test.ts` (a customer gets a table once it reaches the entry
target; two customers spawned together get distinct tables; a third customer with both tables
taken stays idle without one). Verified in-browser with Playwright (screenshots across a ~13s
run): customers walk to the entry point, then visibly split off toward one of the two tables in
the default layout — settling at two distinct chairs, never stacking on the same one; HUD and
furniture unaffected; no console errors.

**M04.7 (Sit down state) — done:** the only real change was in `moveCustomer`'s arrival branch
(`core/customers/customer.ts`) — `tableId`/`target` clearing were already solved by M04.6/M04.5,
so the sole gap was that arrival unconditionally set `walking → idle` regardless of what the
customer had just walked to. Now: arriving with a `tableId` already assigned (i.e. it walked to
its seat, per `assignTables`/M04.6) sets `walking → seated`; arriving with no `tableId` (i.e. it
walked to `ENTRY_TARGET`) still sets `walking → idle`, unchanged. `CustomerSystem`,
`assignTables`, and `CustomerRenderer` are all untouched — the `spawn → move → assignTables`
pipeline didn't need to change, and `CustomerState` already had `seated` since M04.1. Tested in
`customer.test.ts` (arrival transitions to `seated` when `tableId` is set, still transitions to
`idle` when it isn't) and `customer-system.test.ts` (a full spawn → walk to entry → get a table
→ walk to the seat → arrive run ends with `state: "seated"`, `target: null`, `tableId` set).
Verified in-browser with Playwright (screenshots across an ~18s run): a customer sprite reaches
its assigned chair and stays exactly stationary there across later frames (no drift), instead of
continuing to move or overshoot; HUD/furniture unaffected; no console errors.

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

M04.8 — Stay timer and leaving (the last M04 sub-step): add a fixed placeholder "stay" timer (no
food/order tied to it yet — its duration is a new `balancing_value` decision to confirm before
writing it into code, not needed until this step); add a `leaving` state plus the generic
walk-to-door-and-despawn infrastructure (meant to be reusable by M05, M09, and M15 later, not
duplicated); reuse M04.5's movement for the walk to the exit; remove the customer from
`GameState.customers` once it reaches the door (`docs/MILESTONES.md`'s M04 section has the full
M04.1–M04.8 plan). Completing M04.8 closes M04 itself — the full loop (enter → find table → sit
→ stay → leave) will run without manual intervention for the first time.
