---
name: checkpoint
description: Record a concise project milestone after a feature, bug fix, decision, or release-ready slice.
disable-model-invocation: true
allowed-tools: Read Edit Write Bash Glob Grep
---

Create one accurate checkpoint; do not compact the conversation.

1. Read `docs/PROJECT_STATE.md` and inspect only the relevant changed files and validation evidence.
2. Update the state file concisely: current focus, done, next, decisions/constraints, validation, and open questions. Remove stale items rather than accumulating history.
3. Do not claim tests or checks that did not run. Do not change application code unless the user explicitly asks.
4. Reply with a short milestone summary and name any remaining risk or blocker.
