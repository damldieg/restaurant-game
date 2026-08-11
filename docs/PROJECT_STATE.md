# Project State

## Stack
Phaser 4 / TypeScript / Vite / pnpm

## Current milestone
NPC sitting state (visual "seated" once NPC reaches its table).

## Working
- Restaurant scene, 32x32 grid, walls, door
- Player movement (WASD/arrows)
- Furniture as data (`game/restaurant.ts`), rendered generically from a type→style map
- NPC entity (`game/npc.ts`): grid position + state (`walking` | `idle`)
- NPC flow: spawns at door -> tweens to entry point -> finds a free table (`findFreeTable`) -> tweens to its seat (`getSeatPosition`) -> state becomes `idle`
- Occupied-table tracking (`occupiedTables` in the scene, separate from the static `furniture` layout)

## Known issues / simplifications
- `getSeatPosition` assumes the chair is always the tile directly below the table. Only holds because there is currently 1 table + 1 chair; needs explicit table-chair association once more furniture is added.
- If no table is free, the NPC just stops at the entry point with no waiting/queue behavior.
- Only one NPC exists (spawned once on scene create), no spawning loop yet.

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
- NPC visually "sits" at the table (milestone 6) once it reaches its seat