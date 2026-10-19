# Review — main-integration plan (MODE plan, pre-ejecución, round 0)

Estático y solo-lectura; shell denegado al reviewer (hechos de git tomados de `git-state.md`,
github-manager read-only). No se ejecutó ni modificó nada. Cuentas del plan verificadas por grep:
src = exactamente 10 líneas `.juntia/` en 6 archivos (lista del task 4 exacta, sin faltantes ni
sobrantes); `docs/MILESTONES.md` = exactamente 29 líneas; `package.json:18-19` y las 5 líneas
`@juntia` de `pnpm-lock.yaml` como describe el plan.

## Cobertura del brief (4 decisiones) — completa
- D1 stash (rehacer frescos + drop tras verificación): tasks 1–2 (contenido del stash como
  referencia de solo lectura), 14→15→17 orden correcto (verificar → commit+push → drop); reindexado
  de b5f328a/fd2cab4 documentado (plan.md:43-44); riesgo de aplicar el stash antes del drop
  mitigado con drop inmediato post-push verificado (plan.md:59-61). ✓
- D2 migrar historial + reescribir citas + borrar `.juntia/` completo: tasks 3, 4, 5, 9; check de
  reversibilidad del task 3 corre ANTES del rm (plan.md:87). ✓
- D3 borrar `.claude/`+`.engram/`, quitar entry claude-toolkit, podar worktrees: tasks 7, 9, 16. ✓
- D4 commit directo en main + push: task 15; autorizado en brief.md:9 y 20. ✓

## Novedad vs dorch-governance — correcta
- Ningún banner RETIRED: task 9 borra `.juntia/` entero (incl. `RETIRED.md` y `BOOTSTRAP.md`);
  migración a `.dorch/history/` con sed de caminos (task 3) reemplaza la preservación in-place.
  La decisión activa 2026-10-05 (`decisions.md:9-10`, "preserve in place") queda explícitamente
  supersedida por el append del task 12 — manejo append-only correcto, sin conflicto abierto. ✓

## Findings

### R0-01 — must-fix — Criterios de aceptación insatisfacibles: edits mandatados insertan `.juntia/` en archivos que el grep 0-hits del propio plan cubre
- Locations (clase completa):
  1. `plan.md:82` (task 1) vs `plan.md:67` (criterio 1): la nota mandatópica del stub de
     `CLAUDE.md` ("nota de que el material de `.juntia/` fue migrado a `.dorch/history/`…")
     embebe el literal `.juntia/`; el criterio 1 exige `grep '\.juntia/' CLAUDE.md` → 0 hits.
  2. `plan.md:100` (task 10) vs `plan.md:67`: el texto de reemplazo de Governance en
     `.dorch/project.md` ("`.juntia/` eliminada 2026-10-19; historia migrada…") embebe el mismo
     literal; el criterio 1 grepea `.dorch/project.md` → 0 hits.
  3. `plan.md:86` (task 3, scope del sed) vs `plan.md:87` y `plan.md:67`: el sed solo reescribe
     los 3 caminos propios; `.juntia/PROJECT_STATE.md:10` referencia una CUARTA ruta
     (`.juntia/governance/rules/agent-rules.md`, verificado en disco) que sobrevive a la
     migración → `grep '\.juntia/' .dorch/history/*.md` (check del task 3) y el criterio 1
     (incluye `.dorch/history`) jamás darán 0.
- Evidence: verificación estática arriba (grep del literal en los 3 archivos de historia:
  PROJECT_STATE.md:10 es la única ruta fuera del scope; DECISIONS.md 0 refs, ARCHITECTURE.md:111
  cubierta).
- Impact: el builder no puede pasar la verificación global tal como está especificado; rework
  garantizado en el loop verificar→revisar. Ojo: "arreglarlo" reescribiendo esa cuarta ruta a
  `.dorch/history/governance/rules/agent-rules.md` sería incorrecto (governance/ se borra, no se
  migra) — el plan debe especificar el tratamiento (p. ej. reword sin camino vivo, o anotar
  "(eliminada)"), y los textos de tasks 1/10 deben evitar el literal (p. ej. "Juntia" /
  "`.juntia`" sin barra final, o excluir esos archivos del criterio 1).
- Status: open.

### R0-02 — must-fix — Check del task 5 vacío para la location (a): el write-routing está partido en dos líneas
- Location: `plan.md:91` (check) vs `docs/MILESTONES.md:18-19` (texto actual: "…Al completar una
  tarea, actualizar\n`PROJECT_STATE.md` con una entrada breve…").
- Evidence: la frase "actualizar `PROJECT_STATE.md`" está dividida por el salto de línea
  (18→19); el grep single-line `'actualizar `PROJECT_STATE\.md`'` devuelve 0 hits SOBRE EL
  ARCHIVO SIN EDITAR — verificado leyendo las líneas 14–21 actuales.
- Impact: false-pass. Si el builder omite el rewrite 5(a), el check pasa igual y ningún otro
  criterio lo detecta (criterio 1 solo matchea `.juntia/`-prefixed; el `PROJECT_STATE.md` desnudo
  no está grepeado) → una instrucción colgante de actualizar un archivo ya borrado aterriza en
  main sin ser detectada. La location (b) (línea 1324, single-line) sí está cubierta.
- Fix sugerido: reemplazar el check por inspección del rango (p. ej. `sed -n '14,21p'
  docs/MILESTONES.md` sin write-routing a `PROJECT_STATE.md` desnudo, o grep con contexto
  `-A1 'actualizar'`), manteniendo el ≥1 hit de `.dorch/project.md` en la sección.
- Status: open.

### R0-03 — should-fix — `git worktree prune` no poda selectivamente: el worktree externo también es prunable
- Location: `plan.md:41-42` (asunción "no se toca") y `plan.md:112` (task 16) vs
  `.dorch/changes/main-integration/git-state.md:22-27`.
- Evidence: git-state marca los 3 worktrees como `prunable`, incluido el externo
  `restaurant-game-m04-juntia-v2`; `git worktree prune` elimina TODOS los registros prunable,
  no solo `.claude/worktrees/*`. La asunción "solo elimina los registros stale de
  `.claude/worktrees/*`" es factualmente incorrecta sobre el comportamiento de git.
- Impact: menor — sin pérdida de datos (la rama `experiment/m04-with-juntia-v2` y sus commits
  quedan intactas; solo desaparece el registro administrativo), pero la expectativa del plan es
  falsa y puede desconcertar al builder/verifier cuando la entrada externa desaparezca de
  `git worktree list`; el criterio 8 (plan.md:74) pasa de cualquier modo y por tanto no
  discrimina.
- Fix sugerido: corregir la asunción y endurecer el criterio 8 a "worktree list = solo el
  worktree principal" (o verificar primero que el dir externo exista en disco).
- Status: open.

## Notas (nits, sin acción bloqueante)
- Risks omite la consecuencia de borrar `.claude/settings.local.json` (permisos locales del
  orchestrator; dorch-governance plan §6 lo consideraba "still needed"). Autorizado por la
  decisión 3 del brief; regenerable. Nota.
- Rollback (revisión risk-level): el commit único hace viable `git revert` + push como rollback;
  los únicos ítems irrecuperables son `facts.json`/`pending.json`, ya aceptados en brief+plan
  (plan.md:57). El plan no lo dice explícito; estructuralmente se cumple. Nota.
- Task 4: las 10 citas de src son todas comentarios full-line `//` (verificado) — el filtro de
  diff comment-only es sano en contenido; `\s` en BSD grep de macOS es de portabilidad dudosa,
  pero el propio task ofrece `pnpm test` 126/126 como alternativa autoritativa. Nit.
- CI (`.github/workflows/ci.yml`) corre exactamente la suite del criterio 5
  (frozen-lockfile + test + build) en cada push a main — la verificación local pre-push del task
  14 espeja el CI. Sin gap de CI. ✓
- Hechos verificados que sostienen el plan: `.claude/` contiene solo `settings.local.json`;
  `.engram/` solo `config.json` (sin secretos); `.gga` sin refs a juntia y sin tokens;
  `.juntia/.gitignore` = facts.json+pending.json (borrado atómico con el dir en task 9, sin
  ventana de exposición); `pnpm-workspace.yaml` tiene la entry claude-toolkit a quitar.

## Needs execution
- None para este veredicto (review de plan, estático). Las ejecuciones del plan (task 14 suite,
  push, drop) pertenecen al builder/verifier según el propio plan.

## Verdict
blocked — 2 must-fix (R0-01, R0-02) + 1 should-fix (R0-03). El plan debe enmendarse antes del
dispatch al builder: los criterios globales 1 y el check del task 3 son insatisfacibles tal como
están escritos (R0-01) y el check del task 5 da falso negativo (R0-02).

---

# Review — main-integration diff (MODE code, round 1, scope initial — post-verificación, 2026-10-19)

Estático, solo-lectura; shell denegado al reviewer. Tasks 1–14 implementados y verificados
(verify.md); tasks 15–17 (git ops) NO ejecutados aún. Review del working tree vs `main` (2b0ef33)
por lectura directa + greps; nada ejecutado ni modificado (salvo este archivo, append).

## Diff vs plan enmendado — conforme en todo lo estáticamente verificable
- CLAUDE.md: exactamente 10 líneas; `# Orchestrator redirect`; punteros a
  `.dorch/{project,memory,decisions}.md`; nota de migración a `.dorch/history/` (historia, no
  instrucciones) + CLI `juntia` inexistente; sin literal `\.juntia/` ni patrones del criterio 9. ✓
- README.md: "Table & Tale / restaurant-game"; `pnpm dev`/`build`/`test` (+`tsc --noEmit`);
  puntero a `.dorch/project.md` y `.dorch/`; sin `/checkpoint`/`/audit-context`/"Extract
  it"/maintenance-tiny. ✓
- `.dorch/history/`: 3 archivos; `\.juntia/` → 0; también `\.claude/|\.engram/|governance/` → 0.
  Sed sin cross-mapping (ARCHITECTURE.md:111 → `.dorch/history/DECISIONS.md`; refs internas de
  PROJECT_STATE.md apuntan al archivo correcto). Narrativa "`juntia confirm`"
  (PROJECT_STATE.md:204/220) verbatim — permitido (plan asume sed solo de caminos). ✓
- R0-01/4ª ruta: `history/PROJECT_STATE.md:9-10` reescrita en prosa sin camino vivo ("the agent
  rules of the Juntia framework (removed with the framework)"). ✓
- src: exactamente 10 citas `.dorch/history/…` en exactamente los 6 archivos del plan, todas
  líneas `//`; 0 menciones `juntia` en src. Comment-only/cero-código del resto de las líneas de
  esos 6 archivos: no re-verificable sin git (shell denegado al reviewer); verify.md (task 4) lo
  ejecutó con `git diff src` → 0 líneas no-comentario. ✓
- docs/MILESTONES.md: §"Relación con PROJECT_STATE.md" (14–22) declara `.dorch/project.md`
  canónico + `.dorch/history/{PROJECT_STATE,ARCHITECTURE,DECISIONS}.md` read-only;
  write-routing → "actualizar `.dorch/project.md` (o `.dorch/changes/*/status.md`)" (19–20);
  línea 1325 → `.dorch/project.md`; único `PROJECT_STATE.md` desnudo restante = título de
  sección (14); 28 líneas `.dorch/history/` cuadran con 29 sed'd − ~2 de la sección vieja
  reescrita por el task 5(a) + 1 nueva; 0 `.juntia/` y 0 `juntia` (narrativa incluida). ✓
- package.json (leído entero, JSON válido): deps solo `phaser ^4.2.1`; `@juntia|"latest"` → 0.
  pnpm-workspace.yaml = `allowBuilds: {}`. pnpm-lock.yaml: `@juntia|link:@juntia` → 0 (−13 líneas
  según verify; cuadra con el stash, git-state §7). ✓
- `.dorch/project.md` (retiro Juntia 2026-10-19 + `.dorch/history/` en Structure; 2 hits; sin
  literal), `memory.md` (9 líneas, línea stale reescrita), `decisions.md` (append-only: entradas
  2026-10-05 intactas — sus literales `.juntia/…` son registro histórico excluido del criterio 1
  por diseño, plan asunción; entrada 2026-10-19 con supersession explícita + Why). status.md =
  "built, pre-git-ops" (el plan decía "done (pending push)": check subjetivo del task 13
  cumplido — nit, no defecto). ✓

## Resolved prior findings
- R0-01 fixed (3/3 locations): sin camino vivo en CLAUDE.md ni `.dorch/project.md`; 4ª ruta de
  `history/PROJECT_STATE.md:10` → prosa; `grep '\.juntia/' .dorch/history/*.md` → 0.
- R0-02 fixed: write-routing partido en dos líneas reescrito (MILESTONES 19–20) →
  `.dorch/project.md`; check awk enmendado en plan.md:94; sin `PROJECT_STATE.md` desnudo fuera
  del título de sección.
- R0-03 fixed (nivel plan): asunción corregida (plan.md:41-45) y criterio 8 endurecido
  (plan.md:77); su verificación es post-git (task 16) → Needs execution.

## Findings

### R1-01 — must-fix — riesgo de configuración remota: el push directo del task 15 contradice la branch protection de `main` registrada en la propia historia migrada; sin verificación previa ni fallback
- Defect class: risk/config (cambio level: risk; riesgo sin evidencia suficiente → must-fix).
- Locations: `plan.md:61` (Risks: "Push directo a main: operación remota autorizada…") y
  `plan.md:113` (task 15: `git push origin main`) vs `.dorch/history/PROJECT_STATE.md:141-156`
  (parte de este diff) y `brief.md:9`.
- Evidence: la historia migrada registra `main` branch-protected on GitHub: "every change needs
  a PR (no direct pushes), at least 1 approval… `enforce_admins` is on, so none of this is
  bypassable, including by repo admins" (141-146), y el catch-22 del maintainer solo dejado sin
  resolver ("no PR … can be merged through the UI without … relaxing the rule", 151-156, "not
  fixed here"). Ningún artefacto del change (plan/brief/tasks/verify/git-state) menciona branch
  protection ni fallback de push; la auditoría git-state no consultó la configuración remota.
- Impact: si la protección sigue activa (todo el registro disponible la da activa y sin
  resolución posterior), `git push origin main` del task 15 será rechazado (GH006) y el
  aterrizaje queda estancado tras el commit local, con la salida documentada (PR) también
  bloqueada → decisión no prevista del usuario (relajar regla / bypass actor / segunda cuenta):
  cambio de postura de seguridad sin autorización explícita.
- Fix requerido: antes del task 15, verificar el estado real de la protección (read-only,
  github-manager: `gh api repos/damldieg/restaurant-game/branches/main/protection` o
  equivalente). Si activa → decisión explícita del usuario + fallback en el plan; si ya fue
  retirada antes del brief → registrar el hecho y proceder.
- Status: open.

## Risk review (level: risk) — explícito
- authn/authz: sin código de app; push autorizado en brief — pero autorización de usuario ≠
  bypass de GitHub (R1-01).
- Sensitive data: `.claude/settings.local.json` + `.engram/config.json` borrados (autorizado en
  brief, sin secretos según git-state/round-0); `facts.json`/`pending.json` irrecuperables —
  aceptado (brief:19, plan:60).
- Secrets: ninguno en el diff. Input validation: N/A (docs/config/comentarios).
- Dependencies: solo eliminaciones (`@juntia/juntia` + alias `latest`); sin deps nuevas;
  `pnpm install --frozen-lockfile` OK (verify); drift de `phaser` descartado (diff del lock
  solo elimina entradas `@juntia`/`latest`).
- Configuration: `allowBuilds: {}` válido (asunción plan:29-30); única brecha de config = R1-01.
- CI: `.github/workflows/ci.yml` intacto, corre exactamente la suite del criterio 5 en cada
  push a main — sin gap.
- Migrations: ninguna. Public API: ninguna (src comments-only; 126/126, tsc, build limpios
  según verify).
- Rollback: commit único atómico → `git revert` viable; stash drop post-push seguro (los edits
  se rehicieron frescos); ítems irrecuperables ya aceptados en brief+plan.

## Needs execution (github-manager/verifier, tras resolver R1-01 y el commit)
1. Gate R1-01 (ANTES del push del task 15): consultar protección de rama `main` (read-only).
   Success: protección inactiva/retirada → proceder; si activa → decisión explícita del
   usuario registrada antes del push. Evidencia: salida de la consulta.
2. Task 15: `git add -A` + commit atómico + `git push origin main`. Success (criterios 3b/4/6):
   `git ls-files .juntia .claude .engram` → 0; `git ls-files .dorch/history` → exactamente
   DECISIONS.md, ARCHITECTURE.md, PROJECT_STATE.md; `git log origin/main -1` = commit del
   cambio; `git ls-remote origin main` = SHA local de HEAD; `git status` limpio (salvo
   gitignored).
3. Task 16: `git worktree prune`. Success (criterio 8, R0-03): `git worktree list` = solo el
   worktree principal (desaparecen también el registro externo prunable
   `restaurant-game-m04-juntia-v2` y los dos `.claude/worktrees/*`; ramas/commits intactos).
4. Task 17: `git stash drop stash@{0}` (SOLO la 0). Success (criterio 7): `git stash list` →
   exactamente 2 entradas (b5f328a, fd2cab4); `git stash list | grep cc8bc48` vacío.
5. Post-push: check `build-and-test` del commit en verde (CI espeja el criterio 5). Evidencia:
   estado/URL del run.

## Verdict (round 1, scope initial)
blocked — 1 must-fix (R1-01). El diff implementado (tasks 1–14) está conforme al plan enmendado
en todo lo estáticamente verificable; R0-01/02/03 cerrados. El bloqueo es del aterrizaje: el
push directo planificado contradice la branch protection registrada en la historia migrada y
exige verificación + decisión/fallback antes del task 15. Needs execution: gate R1-01 + checks
post-git 3b/4/6/7/8 + tasks 15–17, a correr por github-manager/verifier tras resolver R1-01.
