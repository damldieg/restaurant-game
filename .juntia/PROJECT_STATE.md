# Project State

Not a changelog and not a status report — git log and the code already cover "what changed." This file exists only for the "why" that isn't recoverable from either: where things stand right now, and the next known step. Active decisions live in `DECISIONS.md`, not here. Hard cap: 1-2 screens. At that size, prune stale entries instead of archiving the whole file.

Update only at a completed milestone or a material change — not after every small task.

Mark anything not yet determined as `UNKNOWN` rather than guessing or silently omitting it — cheaper to flag once than to re-derive or contradict it later.

## Current state

M01–M04 done (`pnpm test`: 29/29 passing; `tsc --noEmit` clean). `NpcState` now includes `waiting` and
`leaving`. `Npc` carries reusable wait/patience data (`waitingReason`, `waitStartedAt`, `waitPatienceMs`)
via `startWaiting`/`stopWaiting`/`startLeaving` in `src/game/npc/npc.ts`, meant for reuse by M06–M08
(`order`/`food`) and M11 (leaving after paying). An NPC with no free table now walks to a distinct queue
position (`getQueuePosition` in `src/game/restaurant.ts`) and waits with reason `table`. A pure FIFO
picker (`pickNextForTable`) and a pure timeout check (`hasWaitTimedOut`) live in `npc.ts`, unit tested.
`reputation` is real state, owned by `NpcController` (`src/game/npc/controller.ts`), decremented exactly
once per abandonment via `applyAbandonmentPenalty` (`src/game/reputation.ts`) and reflected in the HUD.
Angry abandonment (timeout) drives the new generic leaving/despawn infrastructure
(`NpcController.sendToDoor`/`despawn`), reusable by M11 without duplication.

M04's queue-reassignment-on-freed-table checkbox is covered by the same `pickNextForTable` function plus
a unit test using simulated data — it is not yet wired to a real table-release event, since no such event
exists until M05 (`releaseTable`) / M11. Three domain values (table-wait patience duration, reputation
penalty magnitude, queue layout/spacing) were undefined in `docs/MILESTONES.md`; flagged as Product
unknowns in `.juntia/pending.json` with reasonable, clearly-labeled defaults (15000ms, 1 point, a single
row between entry and door) used to unblock implementation — not yet confirmed by a human.

The "confirmar visualmente en el navegador" checkbox in M04 is marked `[-]` (blocked): no browser was
available in the environment this milestone was implemented in.

## Next known step

M05 — Mejor comportamiento básico de NPCs (`docs/MILESTONES.md`): extract table reservations to
`game/reservations.ts` and wire `releaseTable` to the M04 FIFO picker so freeing a table for real
reassigns it to the queue automatically. The three Product unknowns above should be confirmed by a
human (via `juntia confirm`) before M05/M06 build further on top of these placeholder values.
