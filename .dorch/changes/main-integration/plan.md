# Plan — main-integration: `.dorch/` única fuente de verdad; aterrizaje en `main`

Base: `main` = 2b0ef33 = `origin/main`, árbol limpio. Untracked: `.dorch/`, `.engram/`, `.gga`,
`.juntia/RETIRED.md`, `AGENTS.md`. Los edits del change `dorch-governance` viven solo en
`stash@{0}` (cc8bc48) y se **rehacen frescos** (referencia de contenido: `git show stash@{0}:<file>`,
solo lectura). Todo el cambio es docs/config/comentarios: **cero cambios de código o comportamiento**.

## Approach
1. Rehacer sobre main los edits de dorch-governance (CLAUDE.md stub, README real, package.json/lock,
   puntero en docs/MILESTONES.md) **adaptados** a la decisión nueva: no hay banner RETIRED en
   `.juntia/BOOTSTRAP.md` — en su lugar se borra `.juntia/` entero.
2. Migrar `.juntia/{DECISIONS,ARCHITECTURE,PROJECT_STATE}.md` → `.dorch/history/` (verbatim, con
   refs internas de camino reescritas) y reescribir todas las citas `.juntia/<archivo>` en
   `src/**` (10 líneas / 6 archivos) y `docs/MILESTONES.md` (29 líneas) → `.dorch/history/<archivo>`.
3. Borrar `.juntia/` (incluye `.juntia/.gitignore` y gitignored `facts.json`/`pending.json` —
   irrecuperables), `.claude/` (settings.local.json) y `.engram/` (config.json); quitar la entry
   `'@damian.diego/claude-toolkit'` de `pnpm-workspace.yaml`.
4. Actualizar registros `.dorch/project.md`, `memory.md`, `decisions.md` al estado final
   (nueva entrada de decisión fechada 2026-10-19; log append-only).
5. Verificación local completa → **un solo commit atómico en `main` + `push`** (github-manager,
   autorizado) → `git worktree prune` → `git stash drop stash@{0}` (SOLO el 0).

Commit único porque las citas y los borrados deben aterrizar juntos: ningún commit intermedio
puede referenciar `.juntia/*` que ya no existe.

## Assumptions
- `.gga` y `AGENTS.md` (untracked, keepers; `.gga` apunta a `AGENTS.md`) se incluyen en el commit
  vía `git add -A`. El brief solo dijo que `.gga` "se queda"; asumo que se versiona.
- Tras quitar la entry, `pnpm-workspace.yaml` queda como `allowBuilds: {}` (YAML válido). No se
  borra el archivo (el pedido dice "quitar entry", no el archivo).
- En los 3 archivos migrados a `.dorch/history/` se reescriben SOLO los caminos
  `.juntia/{DECISIONS,ARCHITECTURE,PROJECT_STATE}.md` → `.dorch/history/...` (sed mecánico);
  el texto narrativo (p. ej. "confirmed via `juntia confirm`") queda verbatim como historia.
- `decisions.json` de `.juntia/` está trackeado (recuperable de git history); solo
  `facts.json`/`pending.json` se pierden de verdad. No se migra (el brief migra solo los 3 `.md`).
- Los registros de proceso `.dorch/changes/**` (dorch-governance, main-integration, git-state)
  mencionan `.juntia/` como historia del trabajo; se quedan sin tocar. Los greps de aceptación
  los excluyen.
- `.dorch/decisions.md` es append-only: la entrada 2026-10-05 queda como está; la entrada nueva
  2026-10-19 declara la supresión ("preserved in place" ya no aplica).
- R0-03 (corregido): `git worktree prune` elimina TODOS los registros prunable, no solo
  `.claude/worktrees/*`: también poda el registro del worktree externo
  `restaurant-game-m04-juntia-v2` (git-state.md lo marca prunable). Sin pérdida de datos: la rama
  `experiment/m04-with-juntia-v2` y sus commits quedan intactos; solo desaparece el registro
  administrativo. Criterio 8 endurecido a "worktree list = solo el principal".
- Tras `git stash drop stash@{0}`, los stashes restantes se reindexan (b5f328a→`stash@{0}`,
  fd2cab4→`stash@{1}`); no se tocan en ningún momento.

## Trade-offs
- Un commit grande (~40 archivos) vs. commits por capas: se elige uno para que main sea consistente
  en cada punto del historial (borrados + reescritura de citas atómicos). Mensaje descriptivo.
- Migración "verbatim + sed de caminos" vs. archivo con prefacio histórico: se elige sed mínimo para
  no alterar el registro histórico y que las refs internas resuelvan.
- Borrar `.juntia/` entero vs. conservar marcadores: elegido por el usuario; el costo (facts.json /
  pending.json irrecuperables) está aceptado en el brief.
- README/stub recreados "frescos" siguiendo la spec de dorch-governance tasks 1–2 en vez de
  `git stash apply`: evita aplicar el banner BOOTSTRAP obsoleto y los conflictos con main.

## Risks
- `.juntia/facts.json` y `.juntia/pending.json` (gitignored) se pierden al `rm -rf .juntia` — aceptado.
- Push directo a `main`: operación remota autorizada en el brief (vía github-manager).
- Si alguien aplicara `stash@{0}` después del drop no aplica (se dropea); pero si se aplicara
  ANTES del drop reintroduciría el banner BOOTSTRAP/package.json viejo → conflicto. Mitigación:
  drop inmediatamente tras commit+push verificado.
- `pnpm install` con lock regenerado podría resolver versiones distintas de `phaser` si el lock se
  reescribe entero: se mitiga con `pnpm install --frozen-lockfile` posterior y diff del lock
  (solo deben desaparecer entradas `@juntia`/`latest`).

## Acceptance criteria (globales, post-implementación)
1. `grep -rn '\.juntia/' src docs .dorch/history .dorch/project.md .dorch/memory.md CLAUDE.md README.md AGENTS.md package.json pnpm-lock.yaml pnpm-workspace.yaml` → 0 hits.
2. `grep -n '@juntia\|"latest"' package.json` → 0; `grep -n '@juntia\|link:@juntia' pnpm-lock.yaml` → 0; `grep -n 'claude-toolkit' pnpm-workspace.yaml` → 0.
3. `test ! -e .juntia && test ! -e .claude && test ! -e .engram` → exit 0; `git ls-files .juntia .claude .engram` → 0 líneas.
4. `git ls-files .dorch/history` → exactamente `DECISIONS.md`, `ARCHITECTURE.md`, `PROJECT_STATE.md`.
5. `pnpm install --frozen-lockfile` OK; `pnpm test` → 126/126; `tsc --noEmit` limpio; `pnpm build` limpio.
6. `git log origin/main -1` = commit del cambio; `git status` limpio (salvo lo que gitignore cubra).
7. `git stash list` → exactamente 2 entradas (b5f328a, fd2cab4), ninguna borrada además de la cc8bc48.
8. `git worktree list` = exactamente el worktree principal (ninguna entrada `.claude/worktrees/*` ni `restaurant-game-m04-juntia-v2`).
9. `grep -n 'BOOTSTRAP\|juntia route\|juntia confirm\|juntia integrate' CLAUDE.md README.md` → 0 hits.

## Open questions
- Ninguna bloqueante. Ver `## Assumptions` para los criterios menores resueltos por defecto
  (`.gga` versionado, `allowBuilds: {}`, sed en archivos migrados).

## Tasks
- [x] 1. Recrear `CLAUDE.md` como stub redirect (≤10 líneas) a `.dorch/` (fresh; opcional ver `git show stash@{0}:CLAUDE.md` como referencia). Encabezado "# Orchestrator redirect"; punteros a `.dorch/project.md`, `.dorch/memory.md`, `.dorch/decisions.md`; nota (sin caminos vivos, ver R0-01) de que el material de Juntia fue migrado a `.dorch/history/` (solo historia, no instrucciones) y que el CLI `juntia` no existe. Prohibido embeber el literal `\.juntia/` en este archivo (lo mataría el criterio 1).
  - Check: `grep -c '\.dorch/project\.md' CLAUDE.md` ≥ 1; `wc -l CLAUDE.md` ≤ 10; criterio global 9 en 0.
- [x] 2. Recrear `README.md` real (nombre "Table & Tale / restaurant-game", comandos `pnpm dev` / `pnpm build` / `pnpm test`, puntero a `.dorch/project.md`; sin workflow `/checkpoint`, `/audit-context`, "Extract it", ni routing de agentes).
  - Check: `grep -n 'checkpoint\|audit-context\|Extract it\|maintenance-tiny' README.md` → 0; `grep -c 'pnpm test' README.md` ≥ 1.
- [x] 3. Migrar historia: `mkdir -p .dorch/history` y copiar `.juntia/DECISIONS.md`, `.juntia/ARCHITECTURE.md`, `.juntia/PROJECT_STATE.md` → `.dorch/history/` (verbatim). Luego sed SOLO de caminos dentro de los 3 archivos: `.juntia/DECISIONS.md`→`.dorch/history/DECISIONS.md`, `.juntia/ARCHITECTURE.md`→`.dorch/history/ARCHITECTURE.md`, `.juntia/PROJECT_STATE.md`→`.dorch/history/PROJECT_STATE.md`. R0-01: en `.dorch/history/PROJECT_STATE.md:10` hay una CUARTA ruta citada (`.juntia/governance/rules/agent-rules.md`); como `governance/` se borra sin migrar, reescribir esa cita en prosa sin camino vivo, p. ej. "reglas de agente del marco Juntia (eliminadas con el marco)". Prohibido cualquier literal `\.juntia/` restante en los archivos migrados.
  - Check: `grep -n '\.juntia/' .dorch/history/*.md` → 0 hits; `diff <(sed 's/\.dorch\/history\//.juntia\//g' .dorch/history/DECISIONS.md) .juntia/DECISIONS.md` → idénticos ANTES del task 9 (solo válidos para DECISIONS y ARCHITECTURE; PROJECT_STATE se valida por el grep 0-hits + copia previa al sed).
- [x] 4. Reescribir citas en `src/**` y `docs/MILESTONES.md`: sed de `.juntia/{DECISIONS,ARCHITECTURE,PROJECT_STATE}.md` → `.dorch/history/…` en `src/core/customers/customer.ts`, `src/core/customers/customer.test.ts`, `src/state/game-state.ts`, `src/core/demand.ts`, `src/systems/customer-system.ts`, `src/game/customers/customer-renderer.ts` y `docs/MILESTONES.md`. Comentarios únicamente; cero cambios de código.
  - Check: `grep -rn '\.juntia/' src docs` → 0 hits; `git diff --stat src` muestra solo esos 6 archivos y el diff son solo líneas de comentario (`git diff src | grep '^[+-]' | grep -v '^[+-][+-]' | grep -v '^\s*[+-]\s*//'` → 0 salto de formato; alternativa: `pnpm test` 126/126).
- [x] 5. `docs/MILESTONES.md` — puntero a `.dorch` (patrón dorch-governance tasks 8 y 13): (a) sección "Relación con PROJECT_STATE.md" (hoy líneas 14–21): declara `.dorch/project.md` como estado actual canónico y `.dorch/history/{PROJECT_STATE,ARCHITECTURE,DECISIONS}.md` como historia read-only; el write-routing "actualizar `PROJECT_STATE.md`" → "actualizar `.dorch/project.md` (o `.dorch/changes/*/status.md`)"; (b) la tarea pendiente "~línea 1324 `Actualizar PROJECT_STATE.md`" → `.dorch/project.md`. El resto de citas del cuerpo ya quedó en `.dorch/history/` por el task 4.
  - Check: `sed -n '14,21p' docs/MILESTONES.md` → sin write-routing a `PROJECT_STATE.md` desnudo; grep multi-línea: `awk '/actualizar/{n=NR} PROJECT_STATE\.md && n && NR-n<=1' docs/MILESTONES.md` → sin pares en el rango 14–21 que apunten a `PROJECT_STATE.md` sin camino `.dorch/history/`; `grep -n '\.dorch/project\.md' docs/MILESTONES.md` ≥ 1 en la sección de relación; y la location (b) línea ~1324: `grep -n 'Actualizar PROJECT_STATE\.md' docs/MILESTONES.md` → 0.
- [x] 6. `package.json`: borrar `"@juntia/juntia": "^0.14.0",` y `"latest": "link:@juntia/juntia/latest",` (deja solo `phaser`); JSON válido.
  - Check: `grep -n '@juntia\|"latest"' package.json` → 0; `node -e "require('./package.json')"` OK.
- [x] 7. `pnpm-workspace.yaml`: quitar entry `'@damian.diego/claude-toolkit': true`; contenido final `allowBuilds: {}`.
  - Check: `grep -n 'claude-toolkit' pnpm-workspace.yaml` → 0.
- [x] 8. Regenerar `pnpm-lock.yaml` con `pnpm install`.
  - Check: `grep -n '@juntia\|link:@juntia' pnpm-lock.yaml` → 0; `git diff --stat pnpm-lock.yaml` solo elimina entradas `@juntia`/`latest` (≈ −13 líneas según stash); `pnpm install --frozen-lockfile` OK.
- [x] 9. Borrar directorios: `rm -rf .juntia .claude .engram` (incluye `.juntia/.gitignore`, `facts.json`, `pending.json`, `RETIRED.md`; NO se aplica el banner RETIRED).
  - Check: `test ! -e .juntia && test ! -e .claude && test ! -e .engram`; `git status` muestra los tracked de `.juntia/` como deleted.
- [x] 10. `.dorch/project.md`: en Governance, sustituir la línea de "`.juntia/` preserved as read-only history" por (sin literal `\.juntia/` dado, ver R0-01): "El marco Juntia se retiró y su directorio se eliminó (2026-10-19); el historial confirmado quedó migrado a `.dorch/history/` (read-only); `.dorch/` es la única fuente de verdad; no invocar CLI `juntia`." Añadir en Structure una línea `.dorch/history/`: historia migrada (read-only).
  - Check: `grep -n 'preserved as read-only' .dorch/project.md` → 0; `grep -n '\.dorch/history/' .dorch/project.md` ≥ 2.
- [x] 11. `.dorch/memory.md`: reescribir la línea 9 (stale) por: Juntia eliminado 2026-10-19 (incl. gitignored facts.json/pending.json); historia confirmada en `.dorch/history/`; `.claude/`/`.engram/` eliminadas; `.dorch/` única fuente de verdad. Sin superar ~50 líneas.
  - Check: `grep -n 'preserved as read-only legacy' .dorch/memory.md` → 0; `grep -c 'history' .dorch/memory.md` ≥ 1; `wc -l .dorch/memory.md` ≤ 50.
- [x] 12. `.dorch/decisions.md`: append `## 2026-10-19 main-integration — …` (`.dorch/` única fuente de verdad; `.juntia/` migrada a `.dorch/history/` y borrada; `.claude/`/`.engram/` borradas; dep `@juntia/juntia` eliminada; supersedes la preservación in-place del 2026-10-05) + línea Why. Formato del log intacto.
  - Check: `grep -n '^## 2026-10-19 main-integration' .dorch/decisions.md` → 1 hit; entradas 2026-10-05 sin modificar (`git diff .dorch/decisions.md` solo añade).
- [x] 13. `.dorch/changes/main-integration/status.md`: phase → "done (pending push)" y last-result breve.
  - Check: status.md refleja el estado implementado.
- [x] 14. Verificación completa: greps globales 1–5 y 9 de Acceptance; `pnpm install --frozen-lockfile`; `pnpm test` (126/126); `tsc --noEmit`; `pnpm build`.
  - Check: todos los comandos en 0; test count 126.
- [ ] 15. Git (github-manager, autorizado): `git add -A`; un commit: `chore(governance): .dorch as sole source of truth — migrate .juntia history, remove .juntia/.claude/.engram`; `git push origin main`.
  - Check: `git status` limpio; `git ls-files .juntia .claude .engram` → 0; `git ls-files .dorch/history` → 3; `git ls-remote origin main` = SHA local de HEAD.
- [ ] 16. `git worktree prune` (elimina registros stale de `.claude/worktrees/*`).
  - Check: `git worktree list` muestra SOLO el worktree principal (R0-03: podará también el registro del worktree externo prunable; ramas/commits intactos).
- [ ] 17. `git stash drop stash@{0}` (SOLO el 0; b5f328a y fd2cab4 intactos) — después del commit + suite de verificación.
  - Check: `git stash list` → 2 entradas; `git stash list | grep cc8bc48` vacío; siguen b5f328a y fd2cab4.
