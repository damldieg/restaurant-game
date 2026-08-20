import { describe, expect, it } from "vitest";
import { canAfford } from "./economy";

describe("canAfford", () => {
  it("is true when money covers the price exactly or with room to spare", () => {
    expect(canAfford(100, 100)).toBe(true);
    expect(canAfford(150, 100)).toBe(true);
  });

  it("is false when money falls short of the price", () => {
    expect(canAfford(99, 100)).toBe(false);
    expect(canAfford(0, 100)).toBe(false);
  });
});
