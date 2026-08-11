import type { GridPosition } from "../grid";

export type NpcState = "walking" | "idle" | "seated";

export interface Npc {
  id: string;
  position: GridPosition;
  state: NpcState;
}

export function createNpc(id: string, position: GridPosition, state: NpcState = "idle"): Npc {
  return { id, position, state };
}
