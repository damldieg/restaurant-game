import { describe, expect, it } from "vitest";
import { ABANDONMENT_REPUTATION_PENALTY, applyAbandonmentPenalty } from "./reputation";

describe("applyAbandonmentPenalty", () => {
  it("subtracts the penalty exactly once", () => {
    expect(applyAbandonmentPenalty(0)).toBe(0 - ABANDONMENT_REPUTATION_PENALTY);
  });

  it("does not accumulate when called once, regardless of starting value", () => {
    expect(applyAbandonmentPenalty(10)).toBe(10 - ABANDONMENT_REPUTATION_PENALTY);
  });

  it("calling it twice (two separate abandonments) subtracts the penalty twice, not more", () => {
    const afterFirst = applyAbandonmentPenalty(5);
    const afterSecond = applyAbandonmentPenalty(afterFirst);

    expect(afterSecond).toBe(5 - ABANDONMENT_REPUTATION_PENALTY * 2);
  });
});
