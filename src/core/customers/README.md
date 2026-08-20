# core/customers/

Estado de simulación de los clientes (`Customer`), separado de `game/npc/` (sprites, tweens,
representación Phaser). Sigue la decisión confirmada en M03.5: la simulación es la fuente de
verdad del estado del cliente; Phaser solo lo representa, nunca lo modifica.

Todavía no tiene movimiento, asignación de mesa ni comportamiento — eso llega en las próximas
tareas de M04 (`CustomerSystem`), junto con los campos `target`/`tableId` en `customer.ts`.
