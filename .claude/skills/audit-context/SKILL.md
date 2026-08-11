---
name: audit-context
description: Audit current project context, changes, and state for gaps before a milestone or handoff.
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash
---

Perform a read-only, bounded audit. Do not edit files and do not compact.

1. Read `CLAUDE.md` and `docs/PROJECT_STATE.md`.
2. Inspect the current git status/diff when available, plus only files directly relevant to the requested scope.
3. Return: (a) confirmed state, (b) stale or missing state entries, (c) unvalidated/risky changes, and (d) the single best next action.
4. Keep the result under 12 bullets. Do not speculate; label uncertainty.
