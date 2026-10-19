# Tasks — main-integration (builder run, 2026-10-19)

Ejecutados los tasks 1–14. Tasks 15–17 (git add/commit/push, worktree prune, stash drop) quedan
para github-manager en fase posterior. Checks corregidos según review R0-01/R0-02 (ya enmendados
en plan.md).

- [x] 1. `CLAUDE.md` stub redirect (10 líneas, encabezado "# Orchestrator redirect", punteros a
  `.dorch/project.md`/`memory.md`/`decisions.md`, nota de migración a `.dorch/history/` y CLI
  `juntia` inexistente — sin literal `.juntia/`).
  - Check: `grep -c '\.dorch/project\.md' CLAUDE.md` = 1 (≥1 ✓); `wc -l CLAUDE.md` = 10 (≤10 ✓);
    criterio 9 → 0 hits ✓.
- [x] 2. `README.md` real ("Table & Tale / restaurant-game"; `pnpm dev`/`pnpm build`/`pnpm test`;
  puntero a `.dorch/project.md`; sin workflow `/checkpoint` etc.).
  - Check: `grep 'checkpoint\|audit-context\|Extract it\|maintenance-tiny'` → 0 ✓;
    `grep -c 'pnpm test'` = 1 ✓.
- [x] 3. Historia migrada a `.dorch/history/{DECISIONS,ARCHITECTURE,PROJECT_STATE}.md` (copia
  verbatim + sed de los 3 caminos). R0-01: la 4ª ruta (`PROJECT_STATE.md:10`, agent rules del
  marco Juntia) reescrita en prosa sin camino vivo: "the agent rules of the Juntia framework
  (removed with the framework)".
  - Check: `grep '\.juntia/' .dorch/history/*.md` → 0 ✓; `diff <(sed 's|\.dorch/history/|.juntia/|g'
    …) .juntia/…` → DECISIONS y ARCHITECTURE idénticos byte a byte (incl. newline final) ✓
    (ejecutado ANTES del task 9); PROJECT_STATE difiere solo en la línea 10 (reescritura
    mandada) ✓.
- [x] 4. Citas reescritas `.juntia/{DECISIONS,ARCHITECTURE}.md` → `.dorch/history/…` en los 6
  archivos de `src/` (10 líneas, solo comentarios) y `docs/MILESTONES.md` (29 líneas).
  - Check: `grep -rn '\.juntia/' src docs` → 0 ✓; `git diff --stat src docs` = exactamente esos 6
    archivos + MILESTONES.md; las líneas cambiadas de `src` son todas comentarios `//` ✓
    (comprobado con el filtro del plan).
- [x] 5. `docs/MILESTONES.md` puntero a `.dorch`: (a) §"Relación con PROJECT_STATE.md" (rango
  14–21) declara `.dorch/project.md` canónico + `.dorch/history/{PROJECT_STATE,ARCHITECTURE,
  DECISIONS}.md` read-only y el write-routing "actualizar `PROJECT_STATE.md`" → "actualizar
  `.dorch/project.md` (o `.dorch/changes/*/status.md`)"; (b) la tarea pendiente (hoy línea 1325)
  → `.dorch/project.md`.
  - Check: `sed -n '14,21p'` sin write-routing a `PROJECT_STATE.md` desnudo ✓; awk multi-línea
    (check enmendado R0-02) sin pares actualizar↔`PROJECT_STATE.md` desnudo en ningún rango ✓;
    `grep '\.dorch/project\.md'` = 3 hits (2 en la sección de relación, 1 en la 1325) ✓;
    `grep 'Actualizar PROJECT_STATE\.md'` → 0 ✓. El único `PROJECT_STATE.md` desnudo restante es
    el título de la propia sección (no es write-routing).
- [x] 6. `package.json`: borradas `"@juntia/juntia": "^0.14.0",` y `"latest":
  "link:@juntia/juntia/latest",` (queda solo `phaser`).
  - Check: `grep '@juntia\|"latest"'` → 0 ✓; `node -e "require('./package.json')"` OK ✓.
- [x] 7. `pnpm-workspace.yaml`: quitada la entry `'@damian.diego/claude-toolkit': true`; contenido
  final `allowBuilds: {}`.
  - Check: `grep 'claude-toolkit'` → 0 ✓.
- [x] 8. `pnpm-lock.yaml` regenerado con `pnpm install`.
  - Check: `grep '@juntia\|link:@juntia' pnpm-lock.yaml` → 0 ✓; `git diff --stat pnpm-lock.yaml` =
    solo −13 líneas, todas entradas `@juntia`/`latest` ✓; `pnpm install --frozen-lockfile` OK ✓.
- [x] 9. `rm -rf .juntia .claude .engram` (incluye gitignored `facts.json`/`pending.json`,
  `RETIRED.md`; sin banner RETIRED).
  - Check: `test ! -e .juntia && test ! -e .claude && test ! -e .engram` → 0 ✓; `git status`
    muestra los tracked de `.juntia/` y `.claude/` como `D` ✓.
- [x] 10. `.dorch/project.md`: línea de Governance "preserved as read-only history" sustituida
  (sin literal `.juntia/`, R0-01) por el retiro del marco Juntia + migración a `.dorch/history/`
  + `.dorch/` única fuente de verdad + no invocar CLI `juntia`; añadida línea en Structure:
  `.dorch/history/` (read-only).
  - Check: `grep 'preserved as read-only'` → 0 ✓; `grep -c '\.dorch/history/'` = 2 ✓.
- [x] 11. `.dorch/memory.md`: línea 9 stale reescrita (Juntia eliminado 2026-10-19 incl.
  gitignored facts/pending; historia en `.dorch/history/`; `.claude/`/`.engram/` eliminadas;
  `.dorch/` única fuente de verdad).
  - Check: `grep 'preserved as read-only legacy'` → 0 ✓; `grep -c 'history'` = 1 ✓;
    `wc -l` = 9 (≤50) ✓.
- [x] 12. `.dorch/decisions.md`: append `## 2026-10-19 main-integration — …` (`.dorch/` única
  fuente de verdad; historia migrada y directorios borrados; dep eliminada; supersedes la
  preservación in-place del 2026-10-05) + línea Why.
  - Check: `grep '^## 2026-10-19 main-integration'` → 1 hit ✓; entradas 2026-10-05 intactas
    (append-only; el edit solo añadió después de la última entrada) ✓.
- [x] 13. `.dorch/changes/main-integration/status.md`: phase → "built, pre-git-ops", last-result
  breve, next → github-manager.
  - Check: status.md refleja el estado implementado ✓.
- [x] 14. Verificación completa.
  - Check: greps globales 1, 2, 3 (mitad `test ! -e`), 5, 9 → 0 hits / OK ✓; `pnpm install
    --frozen-lockfile` OK ✓; `pnpm test` → 126 passed (126/126) ✓; `tsc --noEmit` limpio ✓;
    `pnpm build` exit 0 (solo warning de chunk >500 kB, pre-existente) ✓.
  - Nota: los literales `git ls-files` de los criterios 3b y 4 solo son verificables tras el
    commit (task 15) — `.dorch/` es untracked hasta entonces; quedan para github-manager/verifier.

## Pendiente (github-manager, fuera de este run)
- [ ] 15. Aterrizaje a main (ruta PR, reemplaza push directo — branch protection activa, evidencia branch-protection.md): crear rama `chore/dorch-sole-source-of-truth`; `git add -A`; commit atómico `chore(governance): .dorch as sole source of truth — migrate .juntia history, remove .juntia/.claude/.engram`; push de la rama; abrir PR; verificar check `build-and-test` verde (strict, exigido por la protección); squash-merge al main. Ruta autorizada por el usuario como reemplazo del commit directo tras el gate R1-01 (enforce_admins on, PR requerido, required_approving_review_count 0 → sin catch-22 previo; threads resueltos obligatorios).
  - Check (post-merge, en main actualizada): `git log origin/main -1` = squash commit del cambio; `git ls-remote origin main` = SHA local de HEAD tras update; `git ls-files .juntia .claude .engram` → 0; `git ls-files .dorch/history` → exactamente DECISIONS.md, ARCHITECTURE.md, PROJECT_STATE.md; `git status` limpio (salvo gitignored). Ruta PR: `gh pr create` + `gh pr merge --squash`.
- [ ] 16. Post-merge: `git worktree prune`.
- [ ] 17. Post-merge + suite de verificación: `git stash drop stash@{0}` (solo el 0).
