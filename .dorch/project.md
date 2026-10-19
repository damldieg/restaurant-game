# Project
<!-- Filled by /dorch-init. Keep it short; this is read on demand. -->
## Stack
Phaser 4 + TypeScript 6 + Vite 8 + Vitest 4; pnpm-managed, single-package app.

## Commands
- install: `pnpm install`
- build: `pnpm build` (`tsc && vite build`)
- test: `pnpm test` (`vitest run`)
- lint: none configured
- dev: `pnpm dev`; typecheck: `tsc --noEmit`

## Structure
- `src/core/`: pure game logic; must not import Phaser.
- `src/state/`: `GameState`.
- `src/systems/`: simulation systems and orchestration.
- `src/game/`: Phaser adapters/renderers.
- `src/main.ts`: Phaser entry, scene, HUD and integration.
- `.dorch/history/`: migrated history (read-only).
- Each module is generally colocated with a `*.test.ts`; subfolders have role README files.

## Governance
- Repository agent governance follows the **orchestrator workflow**: agents read `.dorch/` for context, decisions, and active-change status; the orchestrator dispatches work and resolves conflicts.
- `.dorch/` is authoritative for project context, durable memory, decisions, and change status. Agents must not rely on ad-hoc or external memory for project facts.
- The Juntia framework was retired and its directory removed (2026-10-19); the confirmed history was migrated to `.dorch/history/` (read-only). `.dorch/` is the sole source of truth; do not invoke the `juntia` CLI.

## Conventions
- Simulation owns state; Phaser renders projections and does not drive transitions.
- Core logic is pure and unit-tested without Phaser; transitions return new objects.
- Comments/narration are Spanish; identifiers and APIs are English.
- Use type-only imports where required; TypeScript has `noUnusedLocals`, `noUnusedParameters`, and `noEmit`.
- Verify changes with `pnpm test`, `tsc --noEmit`, and browser checks for Phaser-facing work.
- Current scout baseline: 126 tests passing; next documented milestone is M07.3.
