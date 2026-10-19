# Verify — dorch-governance (verifier, 2026-10-05)

## Command suite (run from repo root)
| Command | Result | Evidence |
|---|---|---|
| `pnpm install --frozen-lockfile` | PASS | `Already up to date` / `Done in 191ms` |
| `pnpm test` | PASS | `Test Files 12 passed (12)` / `Tests 126 passed (126)` |
| `pnpm exec tsc --noEmit` | PASS | exit 0, no output |
| `pnpm build` | PASS | `✓ built in 310ms`, exit 0 (chunk-size warning only, non-fatal) |

## Acceptance criteria (plan.md §Success criteria)
1. **PASS** — `grep -n juntia CLAUDE.md README.md`: README = 0 hits; `CLAUDE.md:5` is the explicit
   prohibition ("Do not load or follow files under `.juntia/`... preserved legacy history only"),
   not an instruction to follow. `CLAUDE.md` is a 5-line redirect to `.dorch/project.md` (head shown).
2. **PASS** — `grep -c '@juntia' package.json pnpm-lock.yaml` → 0/0; `grep 'latest' package.json
   pnpm-lock.yaml` → 0 hits. `package.json` `dependencies` = `{ "phaser": "^4.2.1" }` only.
3. **PASS** — see command suite above (126/126 tests as specified).
4. **PASS** — `ls .juntia` shows `DECISIONS.md`, `ARCHITECTURE.md`, `PROJECT_STATE.md`,
   `governance/**` (incl. `governance/skills/governance-review/SKILL.md`) all present;
   `git status` shows no deletions (`grep '^ D'` = 0).
5. **PASS** — `docs/MILESTONES.md:16-17` now read "`.dorch/project.md` = authoritative project
   context… `.juntia/PROJECT_STATE.md` and `.juntia/ARCHITECTURE.md` are preserved legacy history".
6. **PASS** — `.dorch/decisions.md` has `## 2026-10-05 orchestrator-only-governance` with why;
   `.dorch/memory.md:9` records "Juntia governance is retired… read-only legacy history".

## Task checks (tasks.md)
1. **PASS** — `CLAUDE.md` = 5-line redirect; `grep juntia CLAUDE.md` only the prohibition line.
2. **PASS** — README has `pnpm dev|build|test`; `grep 'checkpoint\|audit-context\|juntia\|Extract it' README.md` → 0 hits.
3. **PASS** — `head -3 .juntia/BOOTSTRAP.md` = RETIRED banner referencing `.dorch/project.md`;
   `<!-- juntia:generated -->` intact on the next line; rest of file unchanged (`git diff` = +2 lines).
4. **PASS** — `.juntia/task-handoff.md` untouched (`git diff --stat` empty for it and
   `PROJECT_STATE.md`/`DECISIONS.md`/`ARCHITECTURE.md`); entrypoints (CLAUDE.md, BOOTSTRAP banner,
   RETIRED.md) never route to it as active work.
5. **PASS** — `.juntia/RETIRED.md` exists; `grep -c '.dorch/project.md'` = 1; lists preserved history
   files and marks `governance/**` inert.
6. **PASS** — both `@juntia/juntia` and `latest: link:` removed; `pnpm install --frozen-lockfile` passes.
7. **PASS** — `pnpm-lock.yaml` has 0 `@juntia`/`latest` entries (13 lines dropped); frozen install clean.
8. **PASS** — `docs/MILESTONES.md:16-17` canonicality declaration replaced per plan.
9. **PASS** — decision heading + why present in append-only `.dorch/decisions.md`.
10. **PASS** — `grep -n 'retired' .dorch/memory.md` → hit at line 9; memory 10 lines (≤ ~50).
11. **PASS** — full suite run (see table).
12. **PASS** — `status.md` updated to verifier-passed state (this change).
13. **PASS** — `grep 'actualizar PROJECT_STATE\.md\|Actualizar PROJECT_STATE\.md' docs/MILESTONES.md`
    → 0 hits; lines 20 and 1325 now route updates to `.dorch/project.md` / `.dorch/changes/*/status.md`.

## Notes / residual (non-blocking)
- `pnpm build` emits Vite's >500 kB chunk-size warning (pre-existing; not a criterion).
- ~28 inline `.juntia/DECISIONS.md`/`ARCHITECTURE.md` citations in `docs/MILESTONES.md` body and
  `src/` comments remain by design (plan §5, out of scope) and point at preserved files.
- Untracked `.engram/` at repo root is unrelated to this change; not touched.
- Nothing deleted; only banner/stub overwrites, dependency removal, and `.dorch/` records changed.

## Verdict
All acceptance criteria and task checks: **PASS** (13/13 tasks, 6/6 criteria). No failures.
