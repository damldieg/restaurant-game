import type { GridPosition } from "./grid";

export type NpcState = "walking" | "idle";

export interface Npc {
  position: GridPosition;
  state: NpcState;
}

export function createNpc(position: GridPosition, state: NpcState = "idle"): Npc {
  return { position, state };
}
