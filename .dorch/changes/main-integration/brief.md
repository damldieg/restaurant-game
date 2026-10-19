# Brief — main-integration

Objetivo del usuario: `.dorch/` es la única fuente de verdad para gobernanza/contexto; absorber lo valioso de `.claude/`, `.engram/`, `.juntia/`; eliminar referencias a los otros para que no haya más de una fuente; aterrizar todo en `main`.

## Decisiones del usuario (2026-10-17)
- Stash@{0} (cc8bc48, dorch-governance nunca commiteado): **rehacer los edits frescos sobre main actual** y **soltar el stash tras verificación/commit** (opción recomendada elegida).
- `.juntia/`: **migrar historial** (DECISIONS.md, ARCHITECTURE.md, PROJECT_STATE.md) a `.dorch/history/`, reescribir citas (~30 en src/ y docs/MILESTONES.md), y **borrar .juntia/ completo**.
- `.claude/` y `.engram/`: **borrar ambos**; quitar entry `claude-toolkit` de `pnpm-workspace.yaml`; podar worktrees stale registrados bajo `.claude/worktrees`.
- Aterrizaje: **commit directo en main + push** (sin PR). Autorizado.

## Contexto técnico
- main = 2b0ef33, sincronizada con origin/main, árbol limpio. Working tree limpio; untracked: .dorch/, .engram/, .gga, .juntia/RETIRED.md, AGENTS.md.
- Auditoría completa en `.dorch/changes/main-integration/git-state.md` (github-manager).
- Antecedentes: `.dorch/changes/dorch-governance/{scout,plan,tasks,verify,review}.md` (edits verificados que viven en el stash).
- `.gga` se queda (Rules→AGENTS.md, ya consistente con dorch; el usuario no lo incluyó).
- Ver previo: `pnpm install --frozen-lockfile`, `pnpm test` (126), `tsc --noEmit`, `pnpm build`.

## Riesgos conocidos
- Borrar `.juntia/` incluye archivos gitignored (facts.json, pending.json): no recuperables.
- Push directo a main: operación remota autorizada por el usuario en esta sesión.
- Stash@{1}/{2} (b5f328a, fd2cab4) no se tocan.
