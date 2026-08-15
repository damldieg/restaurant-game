import type { GridPosition } from "../grid";

export type NpcState = "walking" | "idle" | "seated" | "waiting" | "leaving";

// Único motivo de espera usado por ahora; M06 (order) y M07/M08 (food)
// reutilizan el mismo mecanismo agregando sus propios valores.
export type WaitingReason = "table" | "order" | "food";

export interface Npc {
  id: string;
  position: GridPosition;
  state: NpcState;
  waitingReason?: WaitingReason;
  waitStartedAt?: number;
  waitPatienceMs?: number;
}

export function createNpc(id: string, position: GridPosition, state: NpcState = "idle"): Npc {
  return { id, position, state };
}

// Pone a un NPC en espera por el motivo dado, reiniciando sus datos de
// paciencia. Reutilizable para 'table' (M04), 'order' (M06) y 'food' (M07/M08).
export function startWaiting(
  npc: Npc,
  reason: WaitingReason,
  startedAt: number,
  patienceMs: number
): Npc {
  return {
    ...npc,
    state: "waiting",
    waitingReason: reason,
    waitStartedAt: startedAt,
    waitPatienceMs: patienceMs,
  };
}

// Saca a un NPC del estado de espera hacia el estado que corresponda
// (p. ej. 'seated' al conseguir mesa), limpiando los datos de paciencia.
export function stopWaiting(npc: Npc, nextState: NpcState): Npc {
  return {
    ...npc,
    state: nextState,
    waitingReason: undefined,
    waitStartedAt: undefined,
    waitPatienceMs: undefined,
  };
}

// Dispara la transición genérica de salida (caminar a la puerta y
// despawnear). Reutilizable para abandono enfadado (M04) y salida tras
// pagar (M11), sin duplicar la infraestructura de despawn.
export function startLeaving(npc: Npc): Npc {
  return {
    ...npc,
    state: "leaving",
    waitingReason: undefined,
    waitStartedAt: undefined,
    waitPatienceMs: undefined,
  };
}

// Función pura: dado el inicio de espera, el límite de paciencia y el
// tiempo transcurrido, determina si corresponde abandonar.
export function hasWaitTimedOut(waitStartedAt: number, patienceMs: number, now: number): boolean {
  return now - waitStartedAt >= patienceMs;
}

// Cola FIFO pura: entre los NPCs en 'waiting' con motivo 'table', determina
// cuál debe ocupar la próxima mesa disponible (el que espera hace más
// tiempo). Se reutiliza tanto para la asignación inicial como para la
// reasignación cuando una mesa se libera (M04/M05).
export function pickNextForTable(npcs: Npc[]): Npc | undefined {
  const waitingForTable = npcs.filter(
    (npc): npc is Npc & { waitStartedAt: number } =>
      npc.state === "waiting" && npc.waitingReason === "table" && npc.waitStartedAt !== undefined
  );

  return waitingForTable.reduce<Npc | undefined>((earliest, candidate) => {
    if (!earliest) {
      return candidate;
    }

    return candidate.waitStartedAt! < earliest.waitStartedAt! ? candidate : earliest;
  }, undefined);
}
