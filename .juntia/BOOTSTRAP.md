<!-- juntia:generated -->
# Juntia Bootstrap

You are working in a project governed by Juntia — a deterministic governance layer, not an agent.
Juntia classifies work and points you at the right process, context, roles, and skills. It never
reasons for you, never decides a technical solution, and never implements anything — that stays
entirely yours.

## Orienting for the first time in this project

Read once per session, before anything else:

- `.juntia/context.md` — what this project is: confirmed facts, technologies, structure.
- `.juntia/PROJECT_STATE.md` — current state, if a human has filled it in.
- `.juntia/DECISIONS.md` — what has already been decided, and why.
- `.juntia/RULES.md` — this project's own real constraints, if any are recorded.

## Working on a specific request

Don't read the whole Knowledge Layer up front. Instead:

1. Run `juntia route "<the request, in your own words>"`.
2. It prints a structured Agent Context — intent, confidence, workflow, governance level, roles,
   skills, and `contextSources` — and, only when a real workflow was resolved, refreshes
   `.juntia/task-handoff.md` with the same information plus direct pointers to the files that
   actually apply to this request.
3. Read only what `task-handoff.md`/the Agent Context points you at: the resolved workflow file, the
   listed role files, the listed skill files. Everything else under `.juntia/governance/` is real and
   available, but not required reading for this specific request.

If the request is ambiguous, `route` reports `needsClarification: true` and no `workflow` — ask the
human what they mean; never guess a workflow to fill the gap.

## While you are working

A decision that genuinely needs a human answer can surface at any point — not only before you start.
The moment one does, follow `.juntia/governance/skills/governance-review/SKILL.md`: escalate it, then run
`juntia confirm` right away (answer `skip` if you do not have the human's real answer yet) — this marks
`.juntia/task-handoff.md`'s own "Task Status" as `WAITING_HUMAN_CONFIRMATION`, listing the pending
decision. Do not silently pick a default, and do not continue the affected piece of work while status
reads `WAITING_HUMAN_CONFIRMATION`; an independent part of the same task that does not depend on the
answer can continue. Once a human answers via `juntia confirm`, re-read `.juntia/task-handoff.md` — Task
Status returns to normal and the real answer appears in "Confirmed decisions" — and resume from there. Do
not try to predict every decision a feature will eventually need before you begin.

## What else is here

- `.juntia/governance/rules/agent-rules.md` — how to behave in this project, always applicable.
- `.juntia/governance/rules/decision-triggers.md` — a few common, real situations worth recognizing as a
  possible product/architecture decision — read it, never something Juntia evaluates automatically.
- `.juntia/governance/workflows/` — the recommended process per kind of work.
- `.juntia/governance/roles/` — the perspective to reason from for a given piece of work.
- `.juntia/governance/skills/` — specialized procedures for a given task.
- `.juntia/governance/conventions/` — project conventions, if any are recorded.
- `.juntia/agent-instructions.md` — a different job from working a request: if asked to interpret this
  project's own facts for Juntia, follow this instead.

Juntia does not control what you do — it defines the environment you work in. You reason within it.
