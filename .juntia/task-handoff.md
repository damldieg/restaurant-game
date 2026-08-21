<!-- juntia:generated -->
<!-- juntia:task-meta {"text":"Implementar M06.6: Validation and integration, cerrando M06. Validar en el navegador el escenario completo: multiples clientes llegan, las mesas se llenan, clientes esperan en cola, algunos abandonan por paciencia, mesas se liberan, nuevos clientes entran y ocupan las mesas liberadas. Verificar que no existen dobles asignaciones de mesa, que ningun customer queda en un estado imposible, que la reputacion sigue funcionando correctamente, y que las responsabilidades siguen separadas entre CustomerSystem, ReputationSystem y CustomerRenderer. No implementar funcionalidad nueva.","generatedAt":"2026-08-21T23:26:25.680Z"} -->
# Task Handoff

Juntia classified this request and resolved the process to follow. Juntia does not decide HOW to build
this — that reasoning, planning, and implementation stay entirely yours.

## Request

> Implementar M06.6: Validation and integration, cerrando M06. Validar en el navegador el escenario completo: multiples clientes llegan, las mesas se llenan, clientes esperan en cola, algunos abandonan por paciencia, mesas se liberan, nuevos clientes entran y ocupan las mesas liberadas. Verificar que no existen dobles asignaciones de mesa, que ningun customer queda en un estado imposible, que la reputacion sigue funcionando correctamente, y que las responsabilidades siguen separadas entre CustomerSystem, ReputationSystem y CustomerRenderer. No implementar funcionalidad nueva.

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

- Q: "¿La generación de nuevos clientes (demanda) debe depender del estado del restaurante, o puede seguir siendo un spawn fijo independiente del mundo?" -> CONFIRMED: Customer demand depends on restaurant state: la generación de clientes debe depender progresivamente de variables del restaurante como reputación, capacidad y saturación, evitando un spawn fijo independiente del mundo. (product decision, 2026-08-21)
  (options on the table when asked: Customer demand depends on restaurant state: la generación de clientes debe depender progresivamente de variables del restaurante como reputación, capacidad y saturación, evitando un spawn fijo independiente del mundo.)

Already known when this task started:

- Q: "¿Qué precio tiene cada tipo de mueble en el catálogo de M01 (mesa, silla)?" -> CONFIRMED: Mesa 100 / Silla 25 (product decision, 2026-08-20)
  (options on the table when asked: Mesa 50 / Silla 15, Mesa 100 / Silla 25, Mesa 40 / Silla 10)
- Q: "¿Cuánto dinero inicial (money) tiene el jugador al arrancar la partida?" -> CONFIRMED: $500 (product decision, 2026-08-20)
  (options on the table when asked: $300, $150, $500)
- Q: "¿Qué arquitectura separa el core del juego de Phaser antes de M03 (M02.5)?" -> CONFIRMED: GameState → Game Systems → Phaser Renderer; core/ (lógica pura, sin imports de 'phaser'), state/ (GameState central) y systems/ (contrato GameSystem.update(state, deltaMs), sin sistemas concretos todavía); sin Redux/Zustand/ECS completo; migración progresiva moviendo solo módulos ya libres de Phaser (restaurant.ts, furniture-catalog.ts, economy.ts, placement.ts). (architecture decision, 2026-08-20)
  (options on the table when asked: GameState → Game Systems → Phaser Renderer; core/ (lógica pura, sin imports de 'phaser'), state/ (GameState central) y systems/ (contrato GameSystem.update(state, deltaMs), sin sistemas concretos todavía); sin Redux/Zustand/ECS completo; migración progresiva moviendo solo módulos ya libres de Phaser (restaurant.ts, furniture-catalog.ts, economy.ts, placement.ts).)
- Q: "¿Cuál es el valor inicial de reputación del restaurante al arrancar la partida?" -> CONFIRMED: 0 (product decision, 2026-08-20)
  (options on the table when asked: 0, 50, 100)
- Q: "¿Qué valor de reputación aporta cada tipo de mueble del catálogo (mesa, silla) al colocarlo?" -> CONFIRMED: Mesa +3 / Silla +1 (product decision, 2026-08-20)
  (options on the table when asked: Mesa +5 / Silla +1, Mesa +10 / Silla +2, Mesa +3 / Silla +1)
- Q: "¿Qué arquitectura separa la simulación de clientes (Customer) de su representación en Phaser, antes de M04?" -> CONFIRMED: core/customers/ (subcarpeta, como en el ejemplo del pedido original) con customer.ts + customer-state.ts separados, mismo resto (architecture decision, 2026-08-20)
  (options on the table when asked: core/customer.ts (plano, sin subcarpeta) + GameState.customers[] + systems/customer-system.ts (CustomerSystem, mismo patrón que ReputationSystem) + game/npc/controller.ts reducido a lector puro de state.customers, core/customers/ (subcarpeta, como en el ejemplo del pedido original) con customer.ts + customer-state.ts separados, mismo resto, Mantener Npc/NpcController como están y posponer la separación hasta que M04 la necesite de verdad)
- Q: "¿Quién es la fuente de verdad del estado de los clientes: la simulación (GameState/CustomerSystem) o Phaser (tweens/callbacks)?" -> CONFIRMED: La simulación (GameState/CustomerSystem, vía update(deltaMs)) es la única fuente de verdad del estado de los clientes; Phaser NO controla transiciones de estado mediante tweens, callbacks ni eventos visuales — solo representa el estado actual (sprites, animaciones, interpolación visual, efectos). Motivo: permite tests sin Phaser, simulación acelerada, guardado/carga futuro, y separación real entre lógica y visualización. (architecture decision, 2026-08-20)
  (options on the table when asked: La simulación (GameState/CustomerSystem, vía update(deltaMs)) es la única fuente de verdad del estado de los clientes; Phaser NO controla transiciones de estado mediante tweens, callbacks ni eventos visuales — solo representa el estado actual (sprites, animaciones, interpolación visual, efectos). Motivo: permite tests sin Phaser, simulación acelerada, guardado/carga futuro, y separación real entre lógica y visualización.)
- Q: "¿M04.3 debe activar spawn automático de Customer en CustomerSystem.update(), y con qué intervalo?" -> CONFIRMED: Sí, spawn automático continuo en CustomerSystem.update(), mismo intervalo que NpcController hoy (2500ms) — mantiene el ritmo de llegada ya establecido en el juego, ahora simulado en paralelo sin renderizar todavía (product decision, 2026-08-20)
  (options on the table when asked: Sí, spawn automático continuo en CustomerSystem.update(), mismo intervalo que NpcController hoy (2500ms) — mantiene el ritmo de llegada ya establecido en el juego, ahora simulado en paralelo sin renderizar todavía, Sí, spawn automático continuo, pero con un intervalo propio distinto al de NpcController, No todavía — M04.3 solo expone spawnCustomer() como función pura y testeable; activar el timer real en CustomerSystem queda para un paso posterior)
- Q: "¿Qué velocidad de caminata deben tener los Customer en la simulación (M04.5)?" -> CONFIRMED: 1.5 tiles/seg (más lento, más 'paseo') (product decision, 2026-08-20)
  (options on the table when asked: 2.5 tiles/seg (equivalente al ritmo visual anterior), 1.5 tiles/seg (más lento, más 'paseo'), 4 tiles/seg (más rápido, más ágil))
- Q: "¿Cuánto tiempo debe permanecer sentado un Customer antes de irse (M04.8, placeholder fijo sin comida/pedido real todavía)?" -> CONFIRMED: 10 segundos (equilibrado) (product decision, 2026-08-20)
  (options on the table when asked: 10 segundos (equilibrado), 5 segundos (loop rápido), 20 segundos (más realista/pausado))
- Q: "¿Cómo debe convivir la reputación por eventos de clientes (M05: penalización por abandono, recompensa por ciclo completo) con ReputationSystem, que hoy recalcula state.reputation desde cero (solo mobiliario) en cada frame?" -> CONFIRMED: GameState.reputationAdjustments acumulador (recomendado): nuevo campo GameState.reputationAdjustments: number; ReputationSystem.update pasa a ser state.reputation = calculateTotalReputation(furniture) + reputationAdjustments; CustomerSystem escribe el acumulador una vez por evento de salida. Un solo número de reputación, HUD sin cambios. (architecture decision, 2026-08-20)
  (options on the table when asked: GameState.reputationAdjustments acumulador (recomendado): nuevo campo GameState.reputationAdjustments: number; ReputationSystem.update pasa a ser state.reputation = calculateTotalReputation(furniture) + reputationAdjustments; CustomerSystem escribe el acumulador una vez por evento de salida. Un solo número de reputación, HUD sin cambios., Dos números de reputación separados: GameState gana un campo aparte (p.ej. serviceReputation) para los eventos de clientes, sin fusionarlo con el reputation actual derivado de mobiliario., ReputationSystem pasa a conocer a los clientes: se extiende para leer state.customers directamente y detectar las salidas él mismo, quedando como dueño único de toda la lógica de reputación (mobiliario + clientes).)
- Q: "¿Quién es dueño de los eventos del ciclo de vida del Customer (las transiciones que disparan cambios de reputación) y qué límite de responsabilidad separa a CustomerSystem de ReputationSystem en M05 y milestones futuros?" -> CONFIRMED: Customer lifecycle events ownership: los eventos del ciclo de vida del Customer son emitidos únicamente por las transiciones de CustomerSystem; ReputationSystem no inspecciona state.customers ni conoce clientes; CustomerSystem aplica reputationAdjustments solo cuando detecta una transición válida del ciclo de vida del cliente. Separación de responsabilidades: CustomerSystem es dueño de las transiciones y eventos del ciclo de vida del cliente; ReputationSystem es dueño exclusivamente del cálculo de reputación agregada (mobiliario + reputationAdjustments); GameState.reputationAdjustments es el acumulador de eventos dinámicos entre ambos. (architecture decision, 2026-08-20)
  (options on the table when asked: Customer lifecycle events ownership: los eventos del ciclo de vida del Customer son emitidos únicamente por las transiciones de CustomerSystem; ReputationSystem no inspecciona state.customers ni conoce clientes; CustomerSystem aplica reputationAdjustments solo cuando detecta una transición válida del ciclo de vida del cliente. Separación de responsabilidades: CustomerSystem es dueño de las transiciones y eventos del ciclo de vida del cliente; ReputationSystem es dueño exclusivamente del cálculo de reputación agregada (mobiliario + reputationAdjustments); GameState.reputationAdjustments es el acumulador de eventos dinámicos entre ambos.)
- Q: "¿Cuánta paciencia (waitRemainingMs inicial) tiene un customer esperando mesa en cola antes de abandonar (M05.3)?" -> CONFIRMED: 15_000 (15s — algo más que la espera sentado, para dar margen a que se libere una mesa) (product decision, 2026-08-20)
  (options on the table when asked: 15_000 (15s — algo más que la espera sentado, para dar margen a que se libere una mesa), 10_000 (10s — mismo valor que STAY_DURATION_MS, paciencia y estadía equivalentes), 20_000 (20s — más tolerante, reduce abandono mientras el layout inicial tiene pocas mesas))
- Q: "¿Cuánta reputación resta un abandono por paciencia agotada, y cuánta suma un ciclo completado normalmente (M05.4)?" -> CONFIRMED: Abandono -2 / Ciclo completo +1 (penaliza el doble de lo que premia — el abandono debe doler más que lo que aporta un servicio normal) (product decision, 2026-08-20)
  (options on the table when asked: Abandono -2 / Ciclo completo +1 (penaliza el doble de lo que premia — el abandono debe doler más que lo que aporta un servicio normal), Abandono -1 / Ciclo completo +1 (simétrico — un abandono cancela exactamente un ciclo completo), Abandono -5 / Ciclo completo +2 (impacto fuerte — el abandono es un evento negativo grave comparado con el aporte de mobiliario))
- Q: "¿Qué modelo económico y de demanda usará el juego a futuro, más allá de M06 (Customer flow robustness)?" -> CONFIRMED: Restaurant simulation economy model: el juego se basará en un modelo económico de gestión donde el jugador controla precios, capacidad y costes operativos. La rentabilidad dependerá del equilibrio entre demanda, servicio y gastos. (product decision, 2026-08-21)
  (options on the table when asked: Restaurant simulation economy model: el juego se basará en un modelo económico de gestión donde el jugador controla precios, capacidad y costes operativos. La rentabilidad dependerá del equilibrio entre demanda, servicio y gastos.)

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
