# Project State

## Stack
Phaser 4 / TypeScript / Vite / pnpm

## Current milestone
See `docs/MILESTONES.md`. M01–M03 (explicit table-chair association, multiple tables, multiple simultaneous NPCs) are done; next up is M04, whose scope grew from "waiting/queue" to also cover abandonment (`leaving`) and `reputation` (pulled forward from the old M11/M13) — full detail lives in `docs/MILESTONES.md`, not duplicated here.

## Working
- Restaurant scene, 32x32 grid, walls, door
- Furniture as data (`game/restaurant.ts`), rendered generically from a type→style map
- Two tables with their own chairs (`table-1`/`chair-1`, `table-2`/`chair-2`), each visible and functionally independent (confirmed in-browser)
- Furniture items have an explicit `id`; chairs carry a `tableId` linking them to their table (`Table`/`Chair` types)
- NPC entity (`game/npc/npc.ts`): `id` + grid position + state (`walking` | `idle` | `seated`), pure and unit-tested
- NPC orchestration (`game/npc/controller.ts`, `NpcController`): owns the Phaser-facing side (spawn timer, sprites, tweens, occupied-table tracking) so `RestaurantScene` in `main.ts` just instantiates it and stays thin
- NPCs spawn on a repeating timer (`NPC_SPAWN_INTERVAL_MS` in `main.ts`, currently 2500ms) instead of once; multiple NPCs are tracked and animated concurrently, each via its own tween chain
- NPC flow per spawn: door -> tweens to entry point -> finds a free table (`findFreeTable`) -> tweens to its seat (`getSeatForTable`, resolved via `tableId`), nudging toward the table center and squashing the sprite (`scaleY: 0.65`) as a placeholder sit-down -> state becomes `seated`
- NPC with no free table sets `state: "idle"` at the entry point instead of staying stuck on `"walking"` (confirmed visually with 3 NPCs / 2 tables)

## Known issues / simplifications
- If no table is free, the NPC goes `idle` at the entry point but there's still no real waiting/queue behavior (no visual cue, no retry when a table frees up, and multiple idle NPCs overlap at the same entry point).
- Seated pose is a placeholder squash-and-nudge tween on the rectangle sprite, not real art.

## Decisions
- Grid: 32x32
- Game data (grid, furniture, NPC state) kept separate from Phaser rendering code
- Top-down/cozy pixel art (visuals not implemented yet, still placeholder rectangles)
- Mobile-first eventually
- No backend yet
- Git repo initialized (`main` branch), no remote configured yet
- Vitest added for unit-testing pure game-logic functions (`pnpm test`); currently covers `game/grid.ts`, `game/restaurant.ts`, and `game/npc/npc.ts`
- Commits follow Conventional Commits, via the `commit` skill (stage by name, one logical change per commit, push without force)
- Per-context folders (e.g. `game/npc/`) are introduced only once a context splits into pure logic + Phaser-facing orchestration, not preemptively — `game/npc/` was created in M03 specifically because `NpcController` (orchestration) joined `npc.ts` (pure); `game/restaurant.ts` and `game/grid.ts` stay flat single files until they hit the same split
- The WASD-movable rectangle in `main.ts` (`this.player`) was removed: it was early scaffolding unrelated to the NPC system and no milestone plans a player-avatar mechanic (the service loop is NPC/automatic-driven), so it no longer served a purpose
- `waiting` is modeled as one reusable concept (`waitingReason: 'table' | 'order' | 'food'` + resettable patience), not three separate systems, so M06–M08 can reuse the same mechanism M04 builds for table-queueing
- `leaving`/despawn infra and `reputation` state are built in M04 (for angry abandonment) and reused, not rebuilt, by M11 (normal exit after paying) and M13 (positive reputation reward) — M11/M13 previously each created their own copy in the original roadmap draft, since revised
- Abandonment must penalize reputation exactly once per NPC, not accumulate per frame/second — explicit constraint from the user to avoid a common bug pattern

## Next
- M04 (`docs/MILESTONES.md`): `waiting`/`waitingReason`, table queue + FIFO, wait timeout, angry abandonment (`leaving` infra), `reputation` state + one-time abandonment penalty
- Uncommitted work from this session (Vite-scaffolding cleanup, M03 refactor, `MILESTONES.md` rewrite) still needs `/ctk-commit` — likely as separate commits per concern, not one