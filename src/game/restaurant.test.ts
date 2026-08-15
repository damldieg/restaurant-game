import { describe, expect, it } from "vitest";
import {
  findFreeTable,
  furniture,
  getDoorPosition,
  getEntryPosition,
  getQueuePosition,
  getSeatForTable,
  type Chair,
  type Table,
} from "./restaurant";

const tables = furniture.filter((item): item is Table => item.type === "table");
const [firstTable, secondTable] = tables;

function chairFor(table: Table): Chair {
  return furniture.find(
    (item): item is Chair => item.type === "chair" && item.tableId === table.id
  ) as Chair;
}

describe("findFreeTable", () => {
  it("returns the first table when none are occupied", () => {
    expect(findFreeTable([])).toBe(firstTable);
  });

  it("returns undefined once every table's position is occupied", () => {
    expect(findFreeTable(tables.map((table) => table.position))).toBeUndefined();
  });

  it("returns the free table when another one is occupied", () => {
    expect(findFreeTable([firstTable.position])).toBe(secondTable);
  });

  it("ignores occupied positions that don't match any table", () => {
    expect(findFreeTable([{ col: 99, row: 99 }])).toBe(firstTable);
  });
});

describe("getSeatForTable", () => {
  it.each(tables)("returns the position of the chair associated to $id via tableId", (table) => {
    expect(getSeatForTable(table)).toEqual(chairFor(table).position);
  });

  it("throws when the table has no associated chair", () => {
    const orphanTable: Table = { id: "table-orphan", type: "table", position: { col: 0, row: 0 } };

    expect(() => getSeatForTable(orphanTable)).toThrow();
  });
});

describe("getQueuePosition", () => {
  it("gives each queue index a distinct position", () => {
    const positions = Array.from({ length: 6 }, (_, index) => getQueuePosition(index));
    const unique = new Set(positions.map((position) => `${position.col},${position.row}`));

    expect(unique.size).toBe(positions.length);
  });

  it("never overlaps the entry position", () => {
    const entry = getEntryPosition();
    const positions = Array.from({ length: 6 }, (_, index) => getQueuePosition(index));

    for (const position of positions) {
      expect(position).not.toEqual(entry);
    }
  });

  it("never overlaps the door position", () => {
    const door = getDoorPosition();
    const positions = Array.from({ length: 6 }, (_, index) => getQueuePosition(index));

    for (const position of positions) {
      expect(position).not.toEqual(door);
    }
  });
});
