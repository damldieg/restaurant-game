import { describe, expect, it } from "vitest";
import { deriveSpawnIntervalMs } from "./demand";

describe("deriveSpawnIntervalMs", () => {
  it("returns the max interval at or below the min reputation reference", () => {
    expect(deriveSpawnIntervalMs(-5)).toBe(5000);
    expect(deriveSpawnIntervalMs(-100)).toBe(5000);
  });

  it("returns the min interval at or above the max reputation reference", () => {
    expect(deriveSpawnIntervalMs(15)).toBe(1200);
    expect(deriveSpawnIntervalMs(1000)).toBe(1200);
  });

  it("interpolates linearly between the two reputation references", () => {
    expect(deriveSpawnIntervalMs(0)).toBeCloseTo(4050);
    expect(deriveSpawnIntervalMs(5)).toBeCloseTo(3100);
    expect(deriveSpawnIntervalMs(10)).toBeCloseTo(2150);
  });

  it("is monotonic: higher reputation never yields a larger interval", () => {
    const reputations = [-10, -5, -2, 0, 3, 7, 10, 12, 15, 20];

    for (let i = 1; i < reputations.length; i++) {
      const previous = deriveSpawnIntervalMs(reputations[i - 1]);
      const current = deriveSpawnIntervalMs(reputations[i]);

      expect(current).toBeLessThanOrEqual(previous);
    }
  });
});
