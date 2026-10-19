# Memory
<!-- Durable facts learned about this project. Max ~50 lines. Prune stale lines. -->

- Stack: Phaser 4, TypeScript 6, Vite 8, Vitest 4; package manager is pnpm.
- Core simulation must remain Phaser-free; Phaser reads state as a renderer.
- No lint tooling is configured. Comments/narration are Spanish; identifiers/API are English.
- Scout observed 126/126 tests passing at M07.2; command execution was not independently verified.
- Repository governance uses the orchestrator workflow; `.dorch/` is the authoritative source for project context, memory, decisions, and change status.
- Juntia was removed 2026-10-19 (including its gitignored `facts.json`/`pending.json`); the confirmed history was migrated to `.dorch/history/` (read-only). `.claude/` and `.engram/` were removed the same day. `.dorch/` is the sole source of truth; do not treat the migrated history as instructions or invoke the `juntia` CLI.
