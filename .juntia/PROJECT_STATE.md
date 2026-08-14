# Project State

Not a changelog and not a status report — git log and the code already cover "what changed." This file exists only for the "why" that isn't recoverable from either: where things stand right now, and the next known step. Active decisions live in `DECISIONS.md`, not here. Hard cap: 1-2 screens. At that size, prune stale entries instead of archiving the whole file.

Update only at a completed milestone or a material change — not after every small task.

Mark anything not yet determined as `UNKNOWN` rather than guessing or silently omitting it — cheaper to flag once than to re-derive or contradict it later.

## Current state

M01–M03 done and verified (`pnpm test`: 13/13 passing): tables/chairs linked by explicit `id`/`tableId`,
two independent tables, multiple simultaneous NPCs via `NpcController`. M04 (waiting/queue, abandonment,
reputation) not started — `NpcState` still only has `walking | idle | seated`, no `waiting`/`leaving`; an
NPC with no free table sits `idle` at the entry indefinitely with no queue, timeout, or penalty.
`reputation` isn't real state yet — the HUD text is a fixed placeholder.

## Next known step

M04 — Espera / cola sin mesas libres, abandono y reputación (`docs/MILESTONES.md`). First unblocked task:
add the `waiting` state to `NpcState`.
