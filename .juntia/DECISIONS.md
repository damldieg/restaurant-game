# Decisions

Append-only. A decision an AI runtime or a teammate would otherwise have to guess at, re-derive, or accidentally re-litigate — not a log of every choice made while coding. Each entry: what was decided, and the short reason why (a constraint, a tradeoff, something that didn't work). Do not edit past entries except to correct a factual error, noted inline.

Mark a decision `UNKNOWN` / leave it out entirely if it hasn't actually been made yet — an invented-sounding decision is worse than an absent one, because it will get treated as settled.

## Active decisions

- Mesa 100 / Silla 25 — product decision (M01 requiere un FurnitureDefinition { type, name, price } por tipo de mueble comprable. El precio es un valor de balance sin una respuesta objetivamente correcta (trigger balancing_value). Todavía no se gasta dinero real al colocar un mueble (eso llega en M02), pero el catálogo necesita el valor ahora.): ¿Qué precio tiene cada tipo de mueble en el catálogo de M01 (mesa, silla)? (2026-08-20)

## Discarded and why

- <approach considered but not taken> — <one-line reason, so it doesn't get re-proposed>
