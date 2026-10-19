# Decisions
<!-- Append-only. Format: ## YYYY-MM-DD <slug> — decision; why. -->

## 2026-10-05 init-context — Initialize `.dorch/` project context; captures scout findings as the repository's orchestrator reference.

## 2026-10-05 orchestrator-governance — Establish orchestrator workflow as the repository's agent governance model; `.dorch/` is authoritative for project context and decisions.
- Why: Prevents ad-hoc or conflicting agent memory by centralizing context, memory, decisions, and change status under `.dorch/`; enables reliable multi-agent coordination through the orchestrator.

## 2026-10-05 orchestrator-only-governance — Retire Juntia as an active governance authority; preserve `.juntia/` as read-only legacy history and remove the `@juntia/juntia` dependency.
- Why: Eliminates the competing "single source of truth" and the human-via-Juntia blocking workflow; leaves `.juntia/DECISIONS.md`, `.juntia/ARCHITECTURE.md`, and `.juntia/PROJECT_STATE.md` available as historical reference while the orchestrator dispatches work and resolves conflicts.

## 2026-10-19 main-integration — Make `.dorch/` the sole source of truth: migrate the Juntia history to `.dorch/history/` (read-only), delete the Juntia, Claude and Engram directories, and remove the `@juntia/juntia` dependency. Supersedes the in-place preservation decided on 2026-10-05.
- Why: Eliminates the last competing instruction/memory sources so agents have exactly one authority (`.dorch/`); preserves the confirmed decisions and milestone history in-repo under `.dorch/history/` before deletion (gitignored `facts.json`/`pending.json` are irrecoverable and accepted). Landing route: branch → PR → squash-merge to `main` (direct push is blocked by active branch protection, verified via `gh api` on 2026-10-19; the historical catch-22 is gone — required approving review count is 0).
- Why: One authoritative context source with no live paths pointing at the removed framework; the confirmed history stays available read-only in `.dorch/history/`, and deleting the three directories eliminates the competing governance material for good.
