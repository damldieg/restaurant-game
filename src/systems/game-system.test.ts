import { describe, expect, it } from "vitest";
import { runSystems, type GameSystem } from "./game-system";
import { createGameState } from "../state/game-state";

describe("runSystems", () => {
  it("calls update on every system, in order, with the state and delta", () => {
    const state = createGameState(500);
    const calls: Array<{ id: string; deltaMs: number }> = [];

    const makeSystem = (id: string): GameSystem => ({
      update: (receivedState, deltaMs) => {
        expect(receivedState).toBe(state);
        calls.push({ id, deltaMs });
      },
    });

    runSystems(state, 16, [makeSystem("a"), makeSystem("b")]);

    expect(calls).toEqual([
      { id: "a", deltaMs: 16 },
      { id: "b", deltaMs: 16 },
    ]);
  });

  it("is a no-op with an empty system list", () => {
    const state = createGameState(500);

    expect(() => runSystems(state, 16, [])).not.toThrow();
  });
});
