import { furniture, type Furniture } from "../core/restaurant";

export interface GameState {
  money: number;
  reputation: number;
  furniture: Furniture[];
}

export function createGameState(initialMoney: number, initialReputation: number): GameState {
  return {
    money: initialMoney,
    reputation: initialReputation,
    furniture,
  };
}
