# Project State

Not a changelog and not a status report — git log y el código ya cubren "qué cambió". Este archivo
existe solo para el "dónde estamos" que no es evidente leyendo el roadmap. Actualizar solo al
completar un milestone o un cambio material, no después de cada tarea chica.

## Current state

- M01–M03 completados y verificados (`pnpm test`: 13/13 en verde): mesa-silla asociadas por `id`,
  2 mesas independientes, y múltiples NPCs simultáneos vía `NpcController`.
- M04 (espera/cola, abandono, reputación) no iniciado — ningún checkbox tocado todavía.
- `NpcState` hoy solo tiene `walking | idle | seated`; no existen `waiting` ni `leaving`.
- Un NPC sin mesa libre queda en `idle` en la posición de entrada indefinidamente: sin cola, sin
  timeout, sin penalización.
- `reputation` no existe como estado real; el texto "Reputación: 0" en el HUD (`main.ts`) es un
  placeholder fijo, no está conectado a nada.

## Next known step

M04 — Espera / cola sin mesas libres, abandono y reputación (`docs/MILESTONES.md`). Primera tarea
desbloqueada: agregar el estado `waiting` a `NpcState`.
