import { describe, expect, it } from "vitest";
import { REPUTATION_ABANDON_PENALTY, applyAbandonPenalty, createReputationState } from "./reputation";

describe("createReputationState", () => {
  it("defaults to 0", () => {
    expect(createReputationState()).toEqual({ value: 0 });
  });

  it("accepts an initial value", () => {
    expect(createReputationState(10)).toEqual({ value: 10 });
  });
});

describe("applyAbandonPenalty", () => {
  it("subtracts the penalty exactly once", () => {
    const state = createReputationState(10);

    const next = applyAbandonPenalty(state);

    expect(next.value).toBe(10 - REPUTATION_ABANDON_PENALTY);
  });

  it("does not mutate the state it receives", () => {
    const state = createReputationState(10);

    applyAbandonPenalty(state);

    expect(state.value).toBe(10);
  });

  it("only applies once per call, so N abandonments require N calls", () => {
    let state = createReputationState(5);

    state = applyAbandonPenalty(state);
    state = applyAbandonPenalty(state);

    expect(state.value).toBe(5 - REPUTATION_ABANDON_PENALTY * 2);
  });
});
