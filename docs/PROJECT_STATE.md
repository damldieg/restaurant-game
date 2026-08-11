# Project State

## Stack
Phaser 4 / TypeScript / Vite / pnpm

## Current milestone
Explicit table-chair association in `game/restaurant.ts` (remove the "chair is always directly below the table" assumption).

## Working
- Restaurant scene, 32x32 grid, walls, door
- Player movement (WASD/arrows)
- Furniture as data (`game/restaurant.ts`), rendered generically from a type→style map
- NPC entity (`game/npc.ts`): grid position + state (`walking` | `idle` | `seated`)
- NPC flow: spawns at door -> tweens to entry point -> finds a free table (`findFreeTable`) -> tweens to its seat (`getSeatPosition`), nudging toward the table center and squashing the sprite (`scaleY: 0.65`) as a placeholder sit-down -> state becomes `seated`
- NPC with no free table now sets `state: "idle"` at the entry point instead of staying stuck on `"walking"`
- Occupied-table tracking (`occupiedTables` in the scene, separate from the static `furniture` layout)

## Known issues / simplifications
- `getSeatPosition` assumes the chair is always the tile directly below the table. Only holds because there is currently 1 table + 1 chair; needs explicit table-chair association once more furniture is added.
- If no table is free, the NPC goes `idle` at the entry point but there's still no real waiting/queue behavior (no visual cue, no retry when a table frees up).
- Only one NPC exists (spawned once on scene create), no spawning loop yet.
- Seated pose is a placeholder squash-and-nudge tween on the rectangle sprite, not real art.

## Decisions
- Grid: 32x32
- Game data (grid, furniture, NPC state) kept separate from Phaser rendering code
- Top-down/cozy pixel art (visuals not implemented yet, still placeholder rectangles)
- Mobile-first eventually
- No backend yet
- Git repo initialized (`main` branch), no remote configured yet
- Vitest added for unit-testing pure game-logic functions (`pnpm test`); currently covers `game/grid.ts` and `game/restaurant.ts`
- Commits follow Conventional Commits, via the `commit` skill (stage by name, one logical change per commit, push without force)

## Next
- Explicit table-chair association (multiple tables/chairs)
- NPC spawn loop / multiple NPCs
- Waiting/queue behavior for when no table is free