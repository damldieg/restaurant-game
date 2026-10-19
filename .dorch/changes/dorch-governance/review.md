# Re-review — dorch-governance (fix for Finding 1)

Scope: resolution of the prior Medium finding (residual `PROJECT_STATE.md` write-routing in `docs/MILESTONES.md:20`/`:1325`) plus a check that the fix introduced no new blockers. Read-only re-review; shell/git access again denied to reviewer, so `pnpm test` (claimed 126/126), `tsc --noEmit`, and `git diff` were not independently re-run — same limitation as prior review Finding 3.

## Finding 1 (Medium) — RESOLVED

- `docs/MILESTONES.md:19-22`: the "Al completar una tarea, actualizar…" instruction now targets `.dorch/project.md` (or the active change's `.dorch/changes/*/status.md`) and keeps the "no duplicarlo en este documento" guard. The forward-looking write path no longer points at retired `.juntia/PROJECT_STATE.md`.
- `docs/MILESTONES.md:1325`: M16 task now reads `- [ ] Actualizar `.dorch/project.md`: loop completo como "Working".` — correct routing target.
- Grep confirms 0 hits for update-instructions naming `PROJECT_STATE.md` anywhere in `docs/MILESTONES.md`; the only remaining mention (line 17) is the intentional descriptive "preserved legacy history" sentence, matching task 13's spec.
- Repo-wide `PROJECT_STATE` sweep: remaining hits are descriptive/historical only (`.dorch/memory.md:9`, `.dorch/decisions.md:10`, `.juntia/` internals, dorch-governance docs themselves). No unchecked `- [ ]` task in `docs/MILESTONES.md` references `.juntia/` or `PROJECT_STATE`; residual `.juntia/DECISIONS.md`/`ARCHITECTURE.md` citations are read-only ("ver …") or inside completed `[x]` tasks — the explicitly deferred plan item, unchanged.

## No new blockers from the fix

- `.juntia/` tree intact: all 40 files still present (PROJECT_STATE.md, RETIRED.md, BOOTSTRAP.md, governance/…), nothing deleted or rewritten per task 13's check; `CLAUDE.md`/`README.md`/`.dorch/project.md`/`memory.md`/`decisions.md` remain consistent with the retirement state.
- `tasks.md:75-77` task 13 well-formed and checked; `status.md:3-5` ("fix complete, ready for re-review", blocker: none) matches observed state.
- Authority chain unchanged: no active entrypoint routes to `.juntia/`.

## Notes (no action required)

- `docs/MILESTONES.md:1325` asks to record the loop as `"Working"` in `.dorch/project.md`, which has no status field/convention (the label came from legacy `PROJECT_STATE.md` habits). Routing is correct; semantics are underspecified — harmless, at most a wording tweak when M16 is reached.
- Prior Lows still accepted as-is: `.juntia/task-handoff.md:14` `ACTIVE` (grep-heuristic risk only) and the reviewer verification limits above.

## Verdict

ok — Medium finding resolved exactly as specified; no new findings. Remaining residuals are the previously accepted Lows. Ready for verifier.
