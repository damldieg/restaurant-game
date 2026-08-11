# Claude Code workflow for `restaurant-game`

This archive contains only additive configuration. Extract it and copy the **contents** of `restaurant-game-claude-code/` into the root of `~/restaurant-game`; it will add `CLAUDE.md`, `docs/`, and `.claude/`. Review/merge if files with those names already exist. No game files are included or changed.

## Use

- Start Claude Code from `~/restaurant-game`. It loads `CLAUDE.md`, project skills, and agents automatically.
- Run `/checkpoint` after a completed feature slice, resolved bug, material decision, or before handoff. It updates `docs/PROJECT_STATE.md` only.
- Run `/audit-context` before a milestone/handoff when you want a short read-only check of state, diff, gaps, and risks.
- Ask Claude to use `maintenance-tiny`, `feature-normal`, `systems-deep`, or `architecture-review` when you want to force a routing choice; otherwise the descriptions guide automatic delegation.

The labels map to native Claude Code settings: `model` plus `effort`. They rely on current Claude Code support for `haiku`/`sonnet`/`opus` and `low`/`medium`/`high`/`xhigh`; if an account or organisation restricts a model or effort level, Claude Code falls back according to its configured availability.

Do not run `/compact` as routine cleanup. The supplied `CLAUDE.md` reserves it for an explicit request or a genuinely full context window.
