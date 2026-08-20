<!-- juntia:generated -->
<!-- juntia:task-meta {"text":"Implement M01: furniture catalog and construction (FurnitureDefinition, purchasable furniture)","generatedAt":"2026-08-20T11:38:46.564Z"} -->
# Task Handoff

Juntia classified this request and resolved the process to follow. Juntia does not decide HOW to build
this — that reasoning, planning, and implementation stay entirely yours.

## Request

> Implement M01: furniture catalog and construction (FurnitureDefinition, purchasable furniture)

## Task Status

READY_TO_CONTINUE

A decision that was blocking part of this task has just been confirmed — see "Confirmed decisions"
below for the real answer, then continue the work that was waiting on it.

Task type: Feature
Confidence: 0.9

Workflow: feature-development
Governance: STANDARD

Suggested roles: Product, Architect, Engineer, QA
Suggested skills: feature-planning, architecture-review, governance-review, implementation, testing-strategy

## Potential decisions

Product:
- behavior
- user_experience
- scope
- balancing

Architecture:
- data_model
- module_boundary
- dependency_choice

Governance: STANDARD — Escalate a potential decision area the moment it becomes concrete — not a single review pass done once, before you start; most requests resolve most areas without needing to.

These are potential decision areas this workflow commonly touches — not a checklist to resolve before you
start, and not something Juntia has already decided applies here. The moment one becomes concretely
relevant to the specific piece of work in front of you — during any step, not only up front — escalate it
via `.juntia/governance/skills/governance-review/SKILL.md`; most requests resolve most areas from their
own stated content or an existing decision without ever needing to. For a genuinely open one, write a
decision request to `.juntia/pending.json` (see `.juntia/governance/rules/agent-rules.md` for the exact
document contract) — a question, never a proposed answer. A human answers it via `juntia confirm`; only
that answer becomes a real decision, and this can happen more than once across the same task as different
areas become concrete at different points.

## Confirmed decisions

Confirmed since this task started — re-check before finishing, even if it contradicts what you already
proposed or implemented:

- Q: "¿Qué precio tiene cada tipo de mueble en el catálogo de M01 (mesa, silla)?" -> CONFIRMED: Mesa 100 / Silla 25 (product decision, 2026-08-20)
  (options on the table when asked: Mesa 50 / Silla 15, Mesa 100 / Silla 25, Mesa 40 / Silla 10)

Already known when this task started:

None of this workflow's own decision type(s) had a confirmed decision yet.

## Agent Context

The same information above, structured for programmatic use — navigation, never a solution:

```json
{
  "task": {
    "intent": "feature",
    "confidence": 0.9,
    "needsClarification": false,
    "reason": "feature <- creation/capability language"
  },
  "workflow": {
    "name": "feature-development",
    "governanceLevel": "standard",
    "baseGovernanceLevel": "standard",
    "detectedSignals": [],
    "requiredReview": [],
    "decisionTypes": [
      "product",
      "architecture"
    ],
    "decisionAreas": {
      "product": [
        "behavior",
        "user_experience",
        "scope",
        "balancing"
      ],
      "architecture": [
        "data_model",
        "module_boundary",
        "dependency_choice"
      ]
    },
    "decisionGuidance": "Escalate a potential decision area the moment it becomes concrete — not a single review pass done once, before you start; most requests resolve most areas without needing to."
  },
  "roles": [
    "product",
    "architect",
    "engineer",
    "qa"
  ],
  "skills": [
    "feature-planning",
    "architecture-review",
    "governance-review",
    "implementation",
    "testing-strategy"
  ],
  "contextSources": [
    ".juntia/context.md",
    ".juntia/governance/workflows/feature-development.md"
  ],
  "taskStatus": "READY_TO_CONTINUE"
}
```

## Where to find each of these

- `.juntia/governance/workflows/feature-development.md` — the full process this workflow recommends.
- `.juntia/governance/roles/product.md` — the Product perspective.
- `.juntia/governance/roles/architect.md` — the Architect perspective.
- `.juntia/governance/roles/engineer.md` — the Engineer perspective.
- `.juntia/governance/roles/qa.md` — the QA perspective.
- `.juntia/governance/skills/feature-planning/SKILL.md` — the feature-planning procedure.
- `.juntia/governance/skills/architecture-review/SKILL.md` — the architecture-review procedure.
- `.juntia/governance/skills/governance-review/SKILL.md` — the governance-review procedure.
- `.juntia/governance/skills/implementation/SKILL.md` — the implementation procedure.
- `.juntia/governance/skills/testing-strategy/SKILL.md` — the testing-strategy procedure.

## Project context

- `.juntia/context.md` — what this project is: confirmed facts, technologies, structure.
- `.juntia/DECISIONS.md` — what has already been decided, and why.
- `.juntia/governance/rules/agent-rules.md` — how to behave in this project.

Juntia does not control what you do — it defines the environment you work in. You reason within it.
