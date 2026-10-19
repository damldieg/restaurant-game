# Plan — retire Juntia governance; make `.dorch/` the sole authority

## Goal
Repository governed only by the orchestrator (`.dorch/`). Neutralize the Juntia
layer so no agent treats `.juntia/` as an instruction source or invokes the
`juntia` CLI, while **preserving** all legacy/history content in place. No
deletion anywhere; only overwrite of regenerable/generated files, banner edits,
a dependency removal, and orchestrator record updates.

## Assumptions
- `.dorch/project.md:22-23`, `memory.md:8`, `decisions.md:6-7` are the authoritative
  baseline (already recorded as decision `orchestrator-governance`, 2026-10-05).
- "Preserve legacy/history" means: never `rm`; editing a generated/regenerable file
  is allowed. `CLAUDE.md`, `BOOTSTRAP.md`, `task-handoff.md`, `context.md` are
  `<!-- juntia:generated -->` and regenerate on `juntia integrate`/`route`; overwriting
  them loses no history.
- `@juntia/juntia` is tooling only: verified no `import ... from '@juntia/juntia'`
  anywhere in `src/` (grep = 0 hits). Safe to remove from `dependencies`.
- The game's confirmed decisions and milestone history live in `.juntia/DECISIONS.md`,
  `.juntia/ARCHITECTURE.md`, `.juntia/PROJECT_STATE.md`. These are **history** and stay
  in place; `.dorch/` points at them as read-only legacy rather than migrating them
  (migration is optional future work, out of scope here).

## Design — how each category is handled

### 1. Root entry points (the decisive break)
The only auto-loaded in-repo entry point is root `CLAUDE.md` (Claude Code). It is the
sole gateway to the whole Juntia layer (`CLAUDE.md` → `BOOTSTRAP.md` → everything else).
No repo `AGENTS.md`/`GEMINI.md`/etc. exists (scout §E).

- **`CLAUDE.md`** → overwrite with a ≤10-line redirect stub pointing to
  `.dorch/project.md`. This breaks the entry chain at its root. (Generated, regenerable;
  scout §A.1/§F confirms removal/regeneration is the sanctioned path, not hand-editing.)
- **`README.md`** → overwrite with a correct minimal README (name + real commands
  `pnpm dev|build|test` + pointer to `.dorch/project.md`). Current content is a stale,
  dangling archive-extraction guide (scout §A.7); not history worth preserving.

### 2. Generated active instructions (secondary break)
- **`.juntia/BOOTSTRAP.md`** → prepend a "RETIRED — superseded by `.dorch/project.md`;
  content below preserved as historical reference, do not follow" banner. Keeps the file,
  kills its "before anything else" mandate even if reached directly.
- **`.juntia/governance/rules/agent-rules.md`**, **`decision-triggers.md`**,
  **`governance-signals.md`**, **`.juntia/governance/skills/governance-review/SKILL.md`**,
  and the rest of `.juntia/governance/**` → **no per-file edits**. They are only reached
  via `BOOTSTRAP.md`/`CLAUDE.md`, which are now broken, so they are transitively inert.
  (Scout §A.3–4 flagged them as "active sub-rules of entry point 2–3"; breaking the
  entry points neutralizes them.)
- **`.juntia/RETIRED.md`** → new one-file marker stating the directory is retired legacy,
  authoritative governance is `.dorch/`, and listing which files are preserved history
  (`DECISIONS.md`, `ARCHITECTURE.md`, `PROJECT_STATE.md`) vs. regenerable.

### 3. Active task-handoff
- **`.juntia/task-handoff.md`** → overwrite with a "superseded" stub pointing to
  `.dorch/changes/*/status.md` for active work. Its `ACTIVE` flag is stale (task = M07.2,
  which `.juntia/PROJECT_STATE.md:261` and `.dorch/project.md:31` both record as done;
  next milestone is M07.3). Overwriting removes the wrong "active task" signal; the file
  is generated live state, not history. `pending.json` is already empty (`items: []`).

### 4. Package dependency
- **`package.json`** → remove `"@juntia/juntia": "^0.14.0"` and
  `"latest": "link:@juntia/juntia/latest"` from `dependencies` (leaving `phaser`).
- **`pnpm-lock.yaml`** → regenerate via `pnpm install` (drops `@juntia/juntia@0.14.0`
  and the `latest` link). `node_modules` is gitignored; the `@juntia` dir and `latest`
  symlink disappear on reinstall. This removes the `juntia route`/`confirm` CLI so no
  agent can invoke the retired workflow.

### 5. Source / docs references (B-class, non-instructional)
These cite `.juntia/DECISIONS.md`/`ARCHITECTURE.md` as the location of confirmed
decisions. Because those files are **preserved**, the citations remain true. Do not
mass-rewrite.
- **`src/**` comments** (customer.ts, customer.test.ts, demand.ts, game-state.ts,
  customer-system.ts, customer-renderer.ts) → leave; valid historical citations.
- **`docs/MILESTONES.md:16-17`** → edit only the canonicality declaration: it currently
  declares `.juntia/PROJECT_STATE.md` = "estado actual" / `.juntia/ARCHITECTURE.md` =
  "por qué". Replace with a pointer to `.dorch/project.md` (authoritative) while noting
  `.juntia/*` is preserved legacy. The ~28 inline `.juntia/DECISIONS.md` references in
  the body stay (they point at preserved files).

### 6. Supporting config (no action)
- **`.claude/settings.local.json`** → leave. Permissions only (git/pnpm); still needed
  for orchestrator-dispatched work; not instructions (scout §A.9).
- **`.gga`** → leave. `RULES_FILE="AGENTS.md"` is a dangling no-op (no repo AGENTS.md);
  not a governance instruction (scout §A.8). Optional one-line pointer later, not now.
- **`pnpm-workspace.yaml`** → leave (unrelated `allowBuilds` for claude-toolkit).
- **`.juntia/agent-instructions.md`** → leave; narrow, non-conflicting, inert (scout §B).

### 7. Orchestrator's own records
- **`.dorch/decisions.md`** → append decision `orchestrator-only-governance`: retire
  Juntia as authority; `.juntia/` preserved as legacy history; remove `@juntia/juntia`
  dependency. Why: eliminates the competing "single source of truth" and blocking
  machinery (scout §D1–2,4).
- **`.dorch/memory.md`** → add lines: Juntia retired; `.juntia/` preserved as read-only
  legacy (confirmed decisions + milestone history); authoritative governance = `.dorch/`.
- **`.dorch/changes/dorch-governance/status.md`** → update phase as the builder progresses.

## Out of scope / deferred (needs explicit approval)
- Physically deleting `.juntia/` or any legacy file.
- Migrating `.juntia/DECISIONS.md`/`ARCHITECTURE.md`/`PROJECT_STATE.md` into `.dorch/`.
- Rewriting the ~28 inline `.juntia/DECISIONS.md` citations in `docs/MILESTONES.md` and
  `src/` comments.

## Success criteria (verifiable)
1. `grep -n juntia CLAUDE.md README.md` → no instruction to load/follow `.juntia/`
   (CLAUDE.md is a redirect to `.dorch/project.md`; README has no Juntia workflow).
2. `grep -n '@juntia\|"latest"' package.json` → 0 hits; `pnpm-lock.yaml` has no
   `@juntia/juntia` or `latest` entry.
3. `pnpm install` clean; `pnpm test` = 126/126; `tsc --noEmit` and `pnpm build` clean.
4. `.juntia/DECISIONS.md`, `.juntia/ARCHITECTURE.md`, `.juntia/PROJECT_STATE.md`,
   `.juntia/governance/**` all still present (nothing deleted).
5. `docs/MILESTONES.md:16-17` no longer declare `.juntia/*` canonical.
6. `.dorch/memory.md` + `.dorch/decisions.md` record the retirement.
