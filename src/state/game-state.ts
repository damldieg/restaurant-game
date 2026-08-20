import { furniture, type Furniture } from "../core/restaurant";
import type { Customer } from "../core/customers/customer";

export interface GameState {
  money: number;
  reputation: number;
  furniture: Furniture[];
  customers: Customer[];
}

export function createGameState(initialMoney: number, initialReputation: number): GameState {
  return {
    money: initialMoney,
    reputation: initialReputation,
    furniture,
    customers: [],
  };
}
