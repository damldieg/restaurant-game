import { describe, expect, it } from "vitest";
import {
  createNpc,
  hasWaitTimedOut,
  pickNextForTable,
  startLeaving,
  startWaiting,
  stopWaiting,
  type Npc,
} from "./npc";

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

describe("startWaiting / stopWaiting", () => {
  it("puts the npc in waiting state with the given reason and patience data", () => {
    const npc = createNpc("npc-1", { col: 1, row: 1 }, "walking");

    const waiting = startWaiting(npc, "table", 1000, 15000);

    expect(waiting).toEqual({
      ...npc,
      state: "waiting",
      waitingReason: "table",
      waitStartedAt: 1000,
      waitPatienceMs: 15000,
    });
  });

  it("clears the wait data when leaving the waiting state", () => {
    const npc = startWaiting(createNpc("npc-1", { col: 1, row: 1 }), "table", 1000, 15000);

    const seated = stopWaiting(npc, "seated");

    expect(seated).toEqual({
      id: "npc-1",
      position: { col: 1, row: 1 },
      state: "seated",
      waitingReason: undefined,
      waitStartedAt: undefined,
      waitPatienceMs: undefined,
    });
  });
});

describe("startLeaving", () => {
  it("puts the npc in leaving state and clears any wait data", () => {
    const npc = startWaiting(createNpc("npc-1", { col: 1, row: 1 }), "table", 1000, 15000);

    expect(startLeaving(npc)).toEqual({
      id: "npc-1",
      position: { col: 1, row: 1 },
      state: "leaving",
      waitingReason: undefined,
      waitStartedAt: undefined,
      waitPatienceMs: undefined,
    });
  });
});

describe("hasWaitTimedOut", () => {
  it("is false while elapsed time is under the patience limit", () => {
    expect(hasWaitTimedOut(1000, 15000, 1000 + 14999)).toBe(false);
  });

  it("is true once elapsed time reaches the patience limit", () => {
    expect(hasWaitTimedOut(1000, 15000, 1000 + 15000)).toBe(true);
  });

  it("is true once elapsed time exceeds the patience limit", () => {
    expect(hasWaitTimedOut(1000, 15000, 1000 + 20000)).toBe(true);
  });
});

describe("pickNextForTable", () => {
  it("returns undefined when no npc is waiting for a table", () => {
    const npcs: Npc[] = [
      createNpc("npc-1", { col: 0, row: 0 }, "seated"),
      startWaiting(createNpc("npc-2", { col: 0, row: 0 }), "order", 1000, 15000),
    ];

    expect(pickNextForTable(npcs)).toBeUndefined();
  });

  it("picks the npc that has been waiting for a table the longest (FIFO)", () => {
    const first = startWaiting(createNpc("npc-1", { col: 0, row: 0 }), "table", 1000, 15000);
    const second = startWaiting(createNpc("npc-2", { col: 0, row: 0 }), "table", 2000, 15000);
    const third = startWaiting(createNpc("npc-3", { col: 0, row: 0 }), "table", 500, 15000);

    // Arrival order in the array is deliberately not FIFO order, to prove
    // the function orders by waitStartedAt and not by array position.
    expect(pickNextForTable([first, second, third])).toBe(third);
  });

  it("ignores npcs waiting for a different reason", () => {
    const waitingForOrder = startWaiting(
      createNpc("npc-1", { col: 0, row: 0 }),
      "order",
      500,
      15000
    );
    const waitingForTable = startWaiting(
      createNpc("npc-2", { col: 0, row: 0 }),
      "table",
      1000,
      15000
    );

    expect(pickNextForTable([waitingForOrder, waitingForTable])).toBe(waitingForTable);
  });

  it("simulates FIFO reassignment when a table frees up with npcs waiting", () => {
    // Simulated data: two npcs already queued for a table, in arrival order.
    const queued: Npc[] = [
      startWaiting(createNpc("npc-1", { col: 10, row: 11 }), "table", 1000, 15000),
      startWaiting(createNpc("npc-2", { col: 9, row: 11 }), "table", 3000, 15000),
    ];

    const next = pickNextForTable(queued);

    expect(next).toBe(queued[0]);

    const seated = stopWaiting(next!, "seated");

    expect(seated.state).toBe("seated");
    expect(seated.waitingReason).toBeUndefined();

    const remainingQueue = queued.filter((npc) => npc.id !== seated.id);

    expect(pickNextForTable(remainingQueue)).toBe(queued[1]);
  });
});
