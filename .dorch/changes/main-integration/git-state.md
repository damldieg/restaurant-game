# git-state — inspección SOLO LECTURA

Scope: repo raíz `/Users/damiandiego/Desktop/Development/restaurant-game`. Solo comandos read-only
(status, branch, log, show, rev-list, ls-remote, worktree list, grep). No fetch, no push, no commit,
no checkout, no stash.

## 1. Rama actual y sincronía con origin

- Rama actual: `main`, HEAD = `2b0ef33` ("feat(m07): reputation-based demand (M07.2) (#34)").
- `git status`: "Your branch is up to date with 'origin/main'".
- Verificación live (no fetch): `git ls-remote origin main` → `2b0ef33737d1fec2291a3080397184b34763dc54`.
  **main está sincronizada con origin/main (mismo SHA).**
- Remote único: `origin` = https://github.com/damldieg/restaurant-game.git (fetch+push).
- `origin/HEAD -> origin/main`.

## 2. Worktrees

`git worktree list`:

| path | HEAD | branch | nota |
|---|---|---|---|
| /Users/damiandiego/Desktop/Development/restaurant-game | 2b0ef33 | [main] | principal |
| /Users/damiandiego/Desktop/Development/restaurant-game-m04-juntia-v2 | 9796a49 | [experiment/m04-with-juntia-v2] | `prunable` (fuera del cwd; no verificable) |
| .claude/worktrees/agent-a60032e26d64d6093 | 803db84 | [experiment/m04-without-juntia] | `prunable` |
| .claude/worktrees/agent-a8b7e8be9651de020 | e19a7d1 | [experiment/m04-with-juntia] | `prunable` |

Los 3 son `prunable`. `.claude/worktrees/` **no existe** en disco → worktrees stale (registro huérfano).
Dos ramas `worktree-agent-*` quedan apuntando a `74dea3e` (ya ancestro de main).

## 3. Ramas (locales y remotas)

Locales: 39 (ver `git branch -a -vv`). Remotas: origin/main + 33 origin/*.

**Detalle completo:** la salida de `git branch -a -vv` se ejecutó; resumen:

- `main` 2b0ef33 [origin/main].
- Con upstream origin/*: `docs/m05-architecture-and-plan` 5bc1598, `docs/m06-3-queue-logical-state`
  456bb63, `docs/m06-customer-flow-robustness` 2a005e9, `docs/m07-roadmap-gameplay-first` 479ef83,
  `docs/main-branch-protection` e1a42e4, `experiment/m04-with-juntia` e19a7d1,
  `experiment/m04-without-juntia` 803db84, `feat/m03-reputation-foundation` 41d8247,
  `feat/m04-4-customer-rendering` ea586ae, `feat/m04-5-customer-movement` 3931346,
  `feat/m04-6-find-reserve-table` 3d8587b, `feat/m04-7-sit-down-state` 77b0081,
  `feat/m04-8-stay-timer-and-leaving` 9bff7d0, `feat/m04-step1-customer-entity` 26b2acc,
  `feat/m04-step2-customer-system-base` a296009, `feat/m05-1..5-*`,
  `feat/m06-1..6-*`, `feat/m07-1-demand-foundation` 749e383, `feat/m07-2-reputation-based-demand`
  2731b57, `feature/juntia-setup` 4fa6813, `feature/m01-furniture-catalog-construction` b486fdd,
  `feature/m02-economy-foundation` d91696b, `feature/m02.5-core-simulation-foundation` 8698ee8.
- **Sin upstream (solo local):** `damldieg/numbfish` 04f0d07, `feat/m04-3-customer-spawning` 5931dd9,
  `feat/next-milestone-step-awaiting-npc` 74dea3e, `experiment/m04-with-juntia-v2` 9796a49,
  `worktree-agent-a60032e26d64d6093` 74dea3e, `worktree-agent-a8b7e8be9651de020` 74dea3e.
- **Solo remotas (sin rama local):** `origin/chore/ci-workflow` 61e315e,
  `origin/docs/m03.5-customer-architecture-review` ad63363.

Ancestro de main (`git branch --merged main`): `main`, `damldieg/numbfish`,
`feat/next-milestone-step-awaiting-npc`, las dos `worktree-agent-*`.
No ancestros de main: el resto (33 ramas) — pero ver §5 (casi todas squash-merged vía PR).

## 4. Últimos ~10 commits

`main` (más reciente primero):
```
2b0ef33 feat(m07): reputation-based demand (M07.2) (#34)
04f0d07 docs(roadmap): gameplay-first planning criteria from M07 onward (#33)
c6d7a90 feat(m07): demand model foundation (M07.1) (#32)
9a09a62 docs(m06/m07): validate/close M06 (M06.6) + redefine M07 as Demand system foundation (#31)
2c4d303 test(m06): table release and reassignment end-to-end (M06.5) (#30)
cc53733 test(m06): patience integration (M06.4) + future demand/economy roadmap docs (#29)
a16214f feat(m06): restaurant capacity management (M06.3) (#28)
34c5769 docs(m06): sharpen M06.3 as logical queue state, before implementing (#27)
39fd230 feat(m06): table assignment as domain state (M06.2) (#26)
0c979b8 feat(m06): customer lifecycle state hardening (M06.1) (#25)
34ee520 docs(m06): redefine M06 as Customer flow robustness (#24)
9456507 docs(m05): validate and close M05 (M05.5) (#23)
```

Ramas con contenido divergente real (detalle pedido):

- `experiment/m04-with-juntia` (e19a7d1): e19a7d1, 74dea3e, 39103e4 (#1), 2a631a2, e685352 …
- `experiment/m04-without-juntia` (803db84): 803db84, 74dea3e, 39103e4, 2a631a2, e685352 …
- `experiment/m04-with-juntia-v2` (9796a49): 9796a49, 1f8b435, f7153d9, 74dea3e, 39103e4 …
- `feat/next-milestone-step-awaiting-npc` (74dea3e): 74dea3e, 39103e4, 2a631a2, e685352, 1baa4c6
- `damldieg/numbfish` (04f0d07): = main[:−1]; 5 más recientes: 04f0d07, c6d7a90, 9a09a62, 2c4d303, cc53733
- `feat/m04-3-customer-spawning` (5931dd9): 5931dd9, 7287eee (#10), 2f9d875 (#9), 8539e5c (#8), a116be5 (#7)
- `docs/main-branch-protection` (e1a42e4): e1a42e4, dda7cfa (#11), 7287eee (#10), … (rama de 1 commit propio)
- Resto de `feat/m0x-*`, `feature/*`, `docs/*`, `origin/chore/ci-workflow`: tips squash-merged en main
  con sufijo `(#N)` (p. ej. `feat/m07-2` 2731b57 ↔ main 2b0ef33 (#34); `feat/m06-3` 52d7ebf ↔ a16214f (#28)).

## 5. Divergencia ramas ↔ main

`git rev-list --left-right --count main...<rama>` (izq = solo en main, der = solo en rama):

| rama | main-only | branch-only |
|---|---|---|
| experiment/m04-with-juntia | 32 | 1 |
| experiment/m04-without-juntia | 32 | 1 |
| experiment/m04-with-juntia-v2 | 32 | 3 |
| damldieg/numbfish | 1 | 0 (solo detrás de main) |
| feat/m07-2-reputation-based-demand | 1 | 1 (contenido ya en main vía squash #34) |
| docs/main-branch-protection | 23 | 1 (contenido **no** presente en main) |
| feature/juntia-setup | 34 | 2 (contenido ya en main vía squash #1) |

Sin conflictos ni merges en curso. No se ejecutó ningún merge/pull.

## 6. Estado del working tree

`git status` (completo):

- Staged: **ninguno**.
- Modified / deleted: **ninguno** (`git diff --stat HEAD` sin salida).
- Untracked: `.dorch/`, `.engram/`, `.gga`, `.juntia/RETIRED.md`, `AGENTS.md`.
- Ignored relevantes: `.juntia/facts.json`, `.juntia/pending.json`, `dist/`, `node_modules/`.

Nunca commiteado (confirmado con `git log --all -- <path>` sin salida para todos):
`.dorch/**`, `AGENTS.md`, `.engram/**`, `.gga`, `.juntia/RETIRED.md`.

## 7. Trabajo de `dorch-governance`: NO commiteado — está en un stash

Hipótesis del task ("CLAUDE.md stub, README.md reescrito, banner RETIRED en .juntia/BOOTSTRAP.md,
package.json sin @juntia/juntia, docs/MILESTONES.md con puntero a .dorch"): **los archivos rastreados
NO están así en HEAD ni en el working tree.** Estado real en HEAD (= working tree, sin diff):

- `CLAUDE.md` → todavía `<!-- juntia:generated -->`, 22 líneas, manda cargar `.juntia/BOOTSTRAP.md`.
- `README.md` → todavía el README del "Claude Code workflow" (`/checkpoint`, `/audit-context`, "Extract it").
- `.juntia/BOOTSTRAP.md` → sin banner RETIRED (empieza con `<!-- juntia:generated -->`).
- `package.json:18-19` → sigue con `"@juntia/juntia": "^0.14.0"` y `"latest": "link:@juntia/juntia/latest"`.
- `docs/MILESTONES.md:14-21` → sigue declarando `.juntia/PROJECT_STATE.md` / `.juntia/ARCHITECTURE.md`
  como canónicos y pide "actualizar `PROJECT_STATE.md`".

Búsqueda en **todo el historial** (`git log --all -S'dorch' -- CLAUDE.md README.md docs/MILESTONES.md
.juntia/BOOTSTRAP.md`; `git log --all -S'RETIRED'`; `git log --all -- .dorch AGENTS.md`): **0 resultados**.
Ningún commit de ninguna rama contiene ese trabajo.

Dónde está realmente: **stash@{0}**.

- `cc8bc48` — "WIP on feat/m07-2-reputation-based-demand: 2731b57", 2026-10-06 13:11 +0200.
- Archivos: `.juntia/BOOTSTRAP.md` +2, `CLAUDE.md` −21/+2, `README.md` 17 líneas, `docs/MILESTONES.md`
  15 líneas, `package.json` −2 (`@juntia/juntia` + `latest`), `pnpm-lock.yaml` −13.
- Contenido verificado con `git show stash@{0} -- CLAUDE.md .juntia/BOOTSTRAP.md package.json`:
  - `CLAUDE.md` → 5 líneas: "# Orchestrator redirect" + punteros a `.dorch/project.md`, `memory.md`,
    `decisions.md` + prohibición de seguir `.juntia/`.
  - `.juntia/BOOTSTRAP.md` → banner `# RETIRED — superseded by .dorch/project.md…`.
  - `package.json` → dependencias quedan solo `phaser`.
- Coincide exactamente con lo que `.dorch/changes/dorch-governance/{tasks,verify,review}.md` marcan
  como "PASS" → **la verificación de ese change se hizo sobre el working tree y el trabajo terminó
  stasheado, nunca commiteado.**

`.juntia/RETIRED.md` (untracked) sí está en disco y es parte de ese change.

Otros stashes (no relacionados con dorch-governance):
- `stash@{1}` `b5f328a` (2026-08-17, WIP on feat/next-milestone-step-awaiting-npc): npc/controller + docs.
- `stash@{2}` `fd2cab4` (2026-08-17, mismo base): npc/controller, npc.test, main.ts, docs, CLAUDE.md, package.json, lockfile.

## 8. Último commit que tocó cada archivo

| archivo | commit | fecha | subject |
|---|---|---|---|
| `CLAUDE.md` | 00bbb37 | 2026-08-20 | project reorganization |
| `README.md` | 384f9a2 | 2026-08-11 | chore: initial commit of restaurant-game |
| `package.json` | 00bbb37 | 2026-08-20 | project reorganization |
| `.juntia/BOOTSTRAP.md` **o** `docs/MILESTONES.md` | 2b0ef33 | 2026-10-06 | feat(m07): reputation-based demand (M07.2) (#34) |

(El último comando agrupa BOOTSTRAP+MILESTONES; 2b0ef33 es el más reciente que toca cualquiera de los dos.
MILESTONES se edita en cada cierre de milestone, así que 2b0ef33 corresponde casi con certeza a MILESTONES;
BOOTSTRAP es generado y probablemente muy anterior — no verificado por separado.)

## 9. Marcado como incierto

- Fecha/`up to date` de refs remotas distintas de `main`: no se ejecutó `git fetch`; solo `ls-remote origin main`.
- El worktree de `restaurant-game-m04-juntia-v2` está fuera del cwd y no se pudo inspeccionar (`external_directory`).
- `git stash show` fue denegado por política; el contenido de los stashes se leyó con `git show` (no se aplicó nada).
- No se verificó contenido de `docs/MILESTONES.md` más allá de líneas 1-24.
