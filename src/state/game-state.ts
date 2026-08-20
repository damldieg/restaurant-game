import { furniture, type Furniture } from "../core/restaurant";

export interface GameState {
  money: number;
  furniture: Furniture[];
}

export function createGameState(initialMoney: number): GameState {
  return {
    money: initialMoney,
    furniture,
  };
}
