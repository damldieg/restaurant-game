import { describe, expect, it } from "vitest";
import {
  clearWaiting,
  createNpc,
  hasWaitTimedOut,
  selectNextForTable,
  startWaiting,
  type Npc,
} from "./npc";

describe("createNpc", () => {
  it("builds an npc with the given id, position, and state", () => {
    const position = { col: 3, row: 4 };

    expect(createNpc("npc-1", position, "walking")).toEqual({
      id: "npc-1",
      position,
      state: "walking",
      waitingReason: null,
      waitStartedAt: null,
      patienceMs: null,
    });
  });

  it("defaults state to idle when not provided", () => {
    const position = { col: 0, row: 0 };

    expect(createNpc("npc-2", position).state).toBe("idle");
  });
});

describe("startWaiting / clearWaiting", () => {
  it("moves the npc into waiting with the given reason and patience", () => {
    const npc = createNpc("npc-1", { col: 0, row: 0 });

    startWaiting(npc, "table", 1000, 5000);

    expect(npc.state).toBe("waiting");
    expect(npc.waitingReason).toBe("table");
    expect(npc.waitStartedAt).toBe(1000);
    expect(npc.patienceMs).toBe(5000);
  });

  it("clearWaiting resets the waiting data without touching state", () => {
    const npc = createNpc("npc-1", { col: 0, row: 0 });

    startWaiting(npc, "order", 1000, 5000);
    clearWaiting(npc);

    expect(npc.waitingReason).toBeNull();
    expect(npc.waitStartedAt).toBeNull();
    expect(npc.patienceMs).toBeNull();
    // clearWaiting doesn't decide the next state; the caller does that separately.
    expect(npc.state).toBe("waiting");
  });
});

describe("hasWaitTimedOut", () => {
  it("is false while elapsed time is under the patience limit", () => {
    expect(hasWaitTimedOut(0, 5000, 4999)).toBe(false);
  });

  it("is true exactly at the patience limit", () => {
    expect(hasWaitTimedOut(0, 5000, 5000)).toBe(true);
  });

  it("is true once elapsed time exceeds the patience limit", () => {
    expect(hasWaitTimedOut(1000, 5000, 6001)).toBe(true);
  });
});

describe("selectNextForTable", () => {
  function waitingNpc(id: string, waitStartedAt: number): Npc {
    const npc = createNpc(id, { col: 0, row: 0 });

    startWaiting(npc, "table", waitStartedAt, 5000);

    return npc;
  }

  it("returns the npc that has been waiting the longest (FIFO)", () => {
    const second = waitingNpc("npc-2", 2000);
    const first = waitingNpc("npc-1", 1000);
    const third = waitingNpc("npc-3", 3000);

    expect(selectNextForTable([second, first, third])).toBe(first);
  });

  it("ignores npcs waiting for a different reason", () => {
    const table = waitingNpc("npc-1", 1000);
    const order = createNpc("npc-2", { col: 0, row: 0 });
    startWaiting(order, "order", 500, 5000);

    expect(selectNextForTable([order, table])).toBe(table);
  });

  it("ignores npcs that aren't waiting", () => {
    const seated = createNpc("npc-1", { col: 0, row: 0 }, "seated");

    expect(selectNextForTable([seated])).toBeUndefined();
  });

  it("returns undefined when nobody is waiting for a table", () => {
    expect(selectNextForTable([])).toBeUndefined();
  });
});
