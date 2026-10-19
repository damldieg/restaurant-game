# Gate R1-01 — branch protection de `main` (solo lectura)

Fecha: 2026-10-19. Alcance: verificar el estado real de la protección de `main` en
`https://github.com/damldieg/restaurant-game`. Nada se modificó.

## Resultado: GATE NO EJECUTADO (needs-decision)

La consulta requerida (`gh api repos/damldieg/restaurant-game/branches/main/protection` y
`.../rules/branches/main`) no se ejecutó: mi rol `github-manager` tiene `gh api` en la lista de
comandos nunca permitidos, independientemente de la autorización del task. Pedido escalado al
usuario (ver "Pregunta abierta"). NO hay dato de `existe/404`, `enforce_admins`, `required PR
reviews`, `count` ni bypass roles.

Lo que sí se pudo recolectar (comandos permitidos), y lo que implica:

## Evidencia cruda

### 1. Historia migrada (working tree, no tocada)

`.dorch/history/PROJECT_STATE.md:141-156` — sigue disponible y dice:

```
**Repository governance:** `main` is branch-protected on GitHub. `.github/workflows/ci.yml`
(new) runs `pnpm install --frozen-lockfile` → `pnpm test` → `pnpm build` as the `build-and-test`
check, required and kept up-to-date-with-`main` (`strict: true`) before merge. Merge policy on
`main`: every change needs a PR (no direct pushes), at least 1 approval (stale approvals
dismissed on new commits), the `build-and-test` check passing, and all PR conversations
resolved; force pushes and branch deletion are blocked. `enforce_admins` is on, so none of this
is bypassable, including by repo admins.
...
**Known limitation:** this is a solo-maintained repo, and GitHub blocks a PR author from
approving their own PR. With `required_approving_review_count: 1` and no other collaborator, no
PR — including the one that added this very note — can be merged through the UI without either a
second GitHub account/collaborator reviewing it, or relaxing the rule (e.g., temporarily dropping
the approval requirement, or adding a bypass actor in a repository ruleset). Not fixed here since
it's a real judgment call, not an implementation detail.
```

Estado registrado: protección ACTIVA, PR-only, 1 approval, strict check, `enforce_admins: on`,
catch-22 sin resolver. Sin registro posterior de retirada en el change.

### 2. Identidad / permisos del token

```
$ gh auth status
github.com
  ✓ Logged in to github.com account damldieg (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
  - Token scopes: 'gist', 'read:org', 'repo', 'workflow'

$ gh repo view --json nameWithOwner,viewerPermission,defaultBranchRef,isPrivate
{"defaultBranchRef":{"name":"main"},"isPrivate":false,
 "nameWithOwner":"damldieg/restaurant-game","viewerPermission":"ADMIN"}
```

Lectura: la cuenta es ADMIN del repo (puede leer y, potencialmente, mutar la protección — mutar
NO está autorizado). Token sin scope de administración de org; `repo` alcanza para el repo.

### 3. Remoto / HEAD

```
$ git remote -v
origin	https://github.com/damldieg/restaurant-game.git (fetch)
origin	https://github.com/damldieg/restaurant-game.git (push)

$ git ls-remote origin main
2b0ef33737d1fec2291a3080397184b34763dc54	refs/heads/main
```

`origin/main` = 2b0ef33 = `main` local; no hay push nuevo desde el último estado conocido.

### 4. PRs (contexto de aterrizaje)

```
$ gh pr list --state all --limit 5
34	feat(m07): reputation-based demand (M07.2)	...	MERGED	2026-08-22T17:13:10Z
33	docs(roadmap): gameplay-first planning criteria from M07 onward	...	MERGED	2026-08-22T16:51:48Z
32	feat(m07): demand model foundation (M07.1)	...	MERGED	2026-08-22T10:35:35Z
31	docs(m06/m07): validate/close M06 (M06.6) + redefine M07 as Demand system foundation	...	MERGED	2026-08-21T23:31:53Z
30	test(m06): table release and reassignment end-to-end (M06.5)	...	MERGED	2026-08-21T18:31:48Z
```

Sin PRs posteriores a #34 (2026-08-22). Consistente con PR-only + catch-22: el landing reciente
no pasó por PR.

## Comandos listos (para ejecutar con autorización explícita)

```
gh api repos/damldieg/restaurant-game/branches/main/protection
gh api repos/damldieg/restaurant-game/rules/branches/main
gh api repos/damldieg/restaurant-game/rulesets
```

Campos a registrar: HTTP 200 vs 404; `.enforce_admins.enabled`;
`.required_pull_request_reviews.required_approving_review_count` /
`.dismiss_stale_reviews`; `.required_status_checks.contexts` + `.strict`;
`.allow_force_pushes` / `.allow_deletions`; `.restrictions` (equipos/usuarios con push);
`bypass_actors` por ruleset (`rulesets/{id}`) — en la API clásica de branch protection no hay
bypass salvo `enforce_admins`.

Nota: `/rules/branches/main` solo devuelve reglas si existe un ruleset; no expone bypass actors.
Para "quién la administra": `viewerPermission: ADMIN` + repo público de cuenta personal
`damldieg` → el admin es el propio `damldieg` (no hay org).

## Evaluación de riesgo (con el dato disponible)

Asumiendo el registro histórico (activa + `enforce_admins: on`): `git push origin main` del task
15 fallará con GH006. El fallback documentado (PR) también choca con el catch-22 (el autor no
puede aprobar su propio PR y no hay segundo colaborador). Salidas: (a) retirar/relajar la
protección temporalmente, (b) añadir bypass actor en ruleset, (c) segunda cuenta/colaborador. Las
tres son cambios de postura de seguridad y requieren decisión explícita del usuario; ninguna está
autorizada aquí.

## Pregunta abierta

¿Quién ejecuta la consulta (o autoriza `gh api` read-only a este subagente) antes del task 15?
