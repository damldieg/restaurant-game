# Tasks — dorch-governance (retire Juntia, keep `.dorch/` sole authority)

Order matters: break entry points first, then task state, then dependency, then docs/records.
No task deletes a file; all overwrite or prepend a banner.

- [x] 1. Overwrite root `CLAUDE.md`
  - Replace entire file with a redirect stub (≤10 lines) that states project governance lives in
    `.dorch/project.md` and to read `.dorch/` before acting. Remove all Juntia content.
  - **Check:** `grep -n juntia CLAUDE.md` → 0 hits; `head -1 CLAUDE.md` is the redirect/heading.

- [x] 2. Overwrite `README.md`
  - Replace with minimal correct README: project name, commands `pnpm dev` / `pnpm build` /
    `pnpm test`, one line pointing to `.dorch/project.md` for governance. Drop the stale
    archive-extraction and `/checkpoint`/`/audit-context` workflow.
  - **Check:** `grep -n 'checkpoint\|audit-context\|juntia\|Extract it' README.md` → 0 hits;
    `pnpm test` command string present.

- [x] 3. Prepend banner to `.juntia/BOOTSTRAP.md`
  - Insert a banner at the very top (above the `<!-- juntia:generated -->` line) reading:
    "RETIRED — superseded by `.dorch/project.md`. Everything below is preserved historical
    reference; do not follow it as instructions." Keep the rest of the file intact.
  - **Check:** `head -3 .juntia/BOOTSTRAP.md` contains "RETIRED" and `.dorch/project.md`;
    original line 1 (`<!-- juntia:generated -->`) still present below.

- [x] 4. Neutralize `.juntia/task-handoff.md` authority via active entrypoints
  - Per directive, **do not overwrite** `.juntia/task-handoff.md`; leave it as historical data.
    The retirement banners in `CLAUDE.md` and `.juntia/BOOTSTRAP.md`, plus `.juntia/RETIRED.md`,
    ensure no agent treats it as an active instruction source.
  - **Check:** `.juntia/task-handoff.md` still exists with its original content; no `ACTIVE`
    signal remains reachable through the entrypoints.

- [x] 5. Create `.juntia/RETIRED.md`
  - One-file marker: `.juntia/` is retired legacy; `.dorch/` is authoritative; list preserved
    history (`DECISIONS.md`, `ARCHITECTURE.md`, `PROJECT_STATE.md`, `facts.json`,
    `decisions.json`) and note `governance/**` is inert.
  - **Check:** file exists; `grep -n '.dorch/project.md' .juntia/RETIRED.md` → ≥1 hit.

- [x] 6. Remove `@juntia/juntia` from `package.json` `dependencies`
  - Delete the two lines `"@juntia/juntia": "^0.14.0",` and `"latest": "link:@juntia/juntia/latest",`,
    leaving only `"phaser": "^4.2.1"`. Keep valid JSON.
  - **Check:** `grep -n '@juntia\|"latest"' package.json` → 0 hits; `node -e "require('./package.json')"`
    succeeds (or `pnpm install` passes).

- [x] 7. Regenerate `pnpm-lock.yaml`
  - Run `pnpm install` to drop the `@juntia/juntia` and `latest` entries from the lockfile.
  - **Check:** `grep -n '@juntia\|latest' pnpm-lock.yaml` → 0 hits (except unrelated if any);
    `pnpm install --frozen-lockfile` succeeds.

- [x] 8. Edit `docs/MILESTONES.md` lines 16-17
  - Replace the canonicality declaration (currently "`.juntia/PROJECT_STATE.md` = estado actual",
    "`.juntia/ARCHITECTURE.md` = por qué") with a pointer to `.dorch/project.md` as authoritative,
    noting `.juntia/*` is preserved legacy. Leave inline `.juntia/DECISIONS.md` citations in the
    body unchanged.
  - **Check:** lines 16-17 no longer state `.juntia/*` is canonical; they reference `.dorch/`.

- [x] 9. Append decision to `.dorch/decisions.md`
  - Add `## 2026-10-05 orchestrator-only-governance` — retire Juntia as authority, preserve
    `.juntia/` as legacy history, remove the `@juntia/juntia` dependency. Include a short why
    (eliminates competing single-source-of-truth and human-via-Juntia blocking).
  - **Check:** new heading present with a "why" line; file still append-only.

- [x] 10. Update `.dorch/memory.md`
  - Add lines recording: Juntia retired; `.juntia/` preserved as read-only legacy (confirmed
    decisions + milestone history); `.dorch/` is authoritative.
  - **Check:** `grep -n 'retired' .dorch/memory.md` → ≥1 hit; memory stays ≤ ~50 lines.

- [x] 11. Verify whole repo
  - Run `pnpm install`, `pnpm test`, `tsc --noEmit`, `pnpm build`.
  - **Check:** 126/126 tests pass; typecheck and build clean.

- [x] 12. Update `.dorch/changes/dorch-governance/status.md`
  - Reflect new phase/result ("planned" → builder marked done) and that no files were deleted.
  - **Check:** status.md matches the implemented state.

- [x] 13. Fix residual `.juntia/PROJECT_STATE.md` write-routing in `docs/MILESTONES.md`
  - Redirect the update instructions at line 20 and line 1325 to `.dorch/project.md` (or the active `.dorch/changes/*/status.md`); keep the preserved-legacy mention of `.juntia/PROJECT_STATE.md`.
  - **Check:** `grep -n 'actualizar PROJECT_STATE\.md\|Actualizar PROJECT_STATE\.md' docs/MILESTONES.md` → 0 hits; `.juntia/` files remain untouched.

## Explicitly NOT done here (record in plan/status)
- No `rm` of `.juntia/` or any file — needs explicit approval.
- No migration of `.juntia/DECISIONS.md`/`ARCHITECTURE.md`/`PROJECT_STATE.md` into `.dorch/`.
