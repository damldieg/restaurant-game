import type { GridPosition } from "../grid";

export type NpcState = "walking" | "idle" | "seated" | "waiting" | "leaving";

// Único concepto de espera del juego: M06-M08 reutilizan el mismo motivo/paciencia
// para 'order' (esperando que tomen el pedido) y 'food' (esperando la comida).
export type WaitingReason = "table" | "order" | "food";

export interface Npc {
  id: string;
  position: GridPosition;
  state: NpcState;
  waitingReason: WaitingReason | null;
  waitStartedAt: number | null;
  patienceMs: number | null;
}

export function createNpc(id: string, position: GridPosition, state: NpcState = "idle"): Npc {
  return {
    id,
    position,
    state,
    waitingReason: null,
    waitStartedAt: null,
    patienceMs: null,
  };
}

// Pone al NPC en espera por `reason`, (re)iniciando su cronómetro de paciencia.
// Reutilizable: M06-M08 la llaman de nuevo con otro `reason` para reiniciar la espera.
export function startWaiting(
  npc: Npc,
  reason: WaitingReason,
  startedAt: number,
  patienceMs: number
): void {
  npc.state = "waiting";
  npc.waitingReason = reason;
  npc.waitStartedAt = startedAt;
  npc.patienceMs = patienceMs;
}

// Limpia los datos de espera (p. ej. al conseguir mesa, pedido o comida).
export function clearWaiting(npc: Npc): void {
  npc.waitingReason = null;
  npc.waitStartedAt = null;
  npc.patienceMs = null;
}

// Función pura: dado el inicio de espera, el límite de paciencia y el tiempo
// actual, determina si corresponde abandonar.
export function hasWaitTimedOut(startedAt: number, patienceMs: number, now: number): boolean {
  return now - startedAt >= patienceMs;
}

// Función pura FIFO: entre los NPCs en `waiting` por motivo `table`, determina cuál
// debe ocupar la próxima mesa libre (el que empezó a esperar primero).
export function selectNextForTable(npcs: Npc[]): Npc | undefined {
  const waitingForTable = npcs.filter(
    (npc) => npc.state === "waiting" && npc.waitingReason === "table" && npc.waitStartedAt !== null
  );

  return waitingForTable.reduce<Npc | undefined>((earliest, candidate) => {
    if (!earliest) {
      return candidate;
    }

    return (candidate.waitStartedAt as number) < (earliest.waitStartedAt as number)
      ? candidate
      : earliest;
  }, undefined);
}
