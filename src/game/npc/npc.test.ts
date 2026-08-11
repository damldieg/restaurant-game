import { describe, expect, it } from "vitest";
import { createNpc } from "./npc";

describe("createNpc", () => {
  it("builds an npc with the given id, position, and state", () => {
    const position = { col: 3, row: 4 };

    expect(createNpc("npc-1", position, "walking")).toEqual({
      id: "npc-1",
      position,
      state: "walking",
    });
  });

  it("defaults state to idle when not provided", () => {
    const position = { col: 0, row: 0 };

    expect(createNpc("npc-2", position).state).toBe("idle");
  });
});
