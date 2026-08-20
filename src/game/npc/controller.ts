import Phaser from "phaser";
import { gridToWorldCenter, type GridPosition } from "../grid";
import { findFreeTable, getSeatForTable } from "../../core/restaurant";
import { createNpc, type Npc } from "./npc";

const NPC_WIDTH = 22;
const NPC_HEIGHT = 28;
const NPC_COLOR = 0xc97a5b;
const WALK_TO_ENTRY_DURATION = 1200;
const WALK_TO_SEAT_DURATION = 800;

export class NpcController {
  private npcs: Npc[] = [];
  private sprites = new Map<string, Phaser.GameObjects.Rectangle>();
  private occupiedTables: GridPosition[] = [];
  private nextId = 1;
  private scene: Phaser.Scene;
  private originX: number;
  private originY: number;
  private restaurantCols: number;
  private restaurantRows: number;

  constructor(
    scene: Phaser.Scene,
    originX: number,
    originY: number,
    restaurantCols: number,
    restaurantRows: number
  ) {
    this.scene = scene;
    this.originX = originX;
    this.originY = originY;
    this.restaurantCols = restaurantCols;
    this.restaurantRows = restaurantRows;
  }

  startSpawning(intervalMs: number) {
    this.spawnNpc();

    this.scene.time.addEvent({
      delay: intervalMs,
      loop: true,
      callback: () => this.spawnNpc(),
    });
  }

  private spawnNpc() {
    const doorPosition = { col: this.restaurantCols / 2, row: this.restaurantRows - 1 };
    const entryTarget = { col: this.restaurantCols / 2, row: this.restaurantRows - 4 };

    const npc = createNpc(`npc-${this.nextId++}`, doorPosition, "walking");

    this.npcs.push(npc);

    const start = gridToWorldCenter(doorPosition, this.originX, this.originY);
    const sprite = this.scene.add.rectangle(start.x, start.y, NPC_WIDTH, NPC_HEIGHT, NPC_COLOR);

    this.sprites.set(npc.id, sprite);

    const target = gridToWorldCenter(entryTarget, this.originX, this.originY);

    this.scene.tweens.add({
      targets: sprite,
      x: target.x,
      y: target.y,
      duration: WALK_TO_ENTRY_DURATION,
      onComplete: () => {
        npc.position = entryTarget;
        this.sendToTable(npc, sprite);
      },
    });
  }

  private sendToTable(npc: Npc, sprite: Phaser.GameObjects.Rectangle) {
    const table = findFreeTable(this.occupiedTables);

    if (!table) {
      // No hay mesa libre: por ahora el NPC se queda esperando en la entrada.
      npc.state = "idle";
      return;
    }

    this.occupiedTables.push(table.position);

    const seat = getSeatForTable(table);
    const seatCenter = gridToWorldCenter(seat, this.originX, this.originY);
    const tableCenter = gridToWorldCenter(table.position, this.originX, this.originY);

    // Acerca al NPC hacia la mesa y lo "achata" para simular que se sienta
    // (placeholder hasta que haya sprites con pose real de sentado).
    const seatedY = seatCenter.y + (tableCenter.y - seatCenter.y) * 0.25;

    this.scene.tweens.add({
      targets: sprite,
      x: seatCenter.x,
      y: seatedY,
      scaleY: 0.65,
      duration: WALK_TO_SEAT_DURATION,
      onComplete: () => {
        npc.position = seat;
        npc.state = "seated";
      },
    });
  }
}
