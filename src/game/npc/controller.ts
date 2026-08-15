import Phaser from "phaser";
import { gridToWorldCenter, type GridPosition } from "../grid";
import { findFreeTable, getSeatForTable } from "../restaurant";
import { clearWaiting, createNpc, hasWaitTimedOut, startWaiting, type Npc } from "./npc";

const NPC_WIDTH = 22;
const NPC_HEIGHT = 28;
const NPC_COLOR = 0xc97a5b;
const WALK_TO_ENTRY_DURATION = 1200;
const WALK_TO_SEAT_DURATION = 800;
const WALK_TO_QUEUE_DURATION = 800;
const WALK_TO_DOOR_DURATION = 1200;

// Cuánto espera un NPC por una mesa libre antes de irse enfadado. Valor
// placeholder razonable para este milestone (M04); ajustable más adelante.
const TABLE_WAIT_PATIENCE_MS = 12000;

// Layout de la cola: una fila propia, distinta de `entryTarget`, para que los
// NPCs en espera no se superpongan entre sí ni con quien está entrando.
const QUEUE_ROW_OFFSET = 1;
const QUEUE_COL_START_OFFSET = -2;
const QUEUE_COL_SPACING = 1;

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
  private onTableAbandon?: () => void;

  constructor(
    scene: Phaser.Scene,
    originX: number,
    originY: number,
    restaurantCols: number,
    restaurantRows: number,
    onTableAbandon?: () => void
  ) {
    this.scene = scene;
    this.originX = originX;
    this.originY = originY;
    this.restaurantCols = restaurantCols;
    this.restaurantRows = restaurantRows;
    this.onTableAbandon = onTableAbandon;
  }

  startSpawning(intervalMs: number) {
    this.spawnNpc();

    this.scene.time.addEvent({
      delay: intervalMs,
      loop: true,
      callback: () => this.spawnNpc(),
    });
  }

  // Llamado cada frame por la escena. Revisa a los NPCs en espera de mesa y
  // dispara el abandono enfadado cuando se vence su paciencia.
  update(time: number) {
    for (const npc of this.npcs) {
      if (npc.state !== "waiting" || npc.waitingReason !== "table") {
        continue;
      }

      if (npc.waitStartedAt === null || npc.patienceMs === null) {
        continue;
      }

      if (hasWaitTimedOut(npc.waitStartedAt, npc.patienceMs, time)) {
        this.abandonForTimeout(npc);
      }
    }
  }

  private getEntryTarget(): GridPosition {
    return { col: this.restaurantCols / 2, row: this.restaurantRows - 4 };
  }

  private getDoorPosition(): GridPosition {
    return { col: this.restaurantCols / 2, row: this.restaurantRows - 1 };
  }

  // Posición de cola por índice: una fila propia detrás del punto de entrada,
  // una columna por NPC, para que nunca se superpongan entre sí.
  private getQueuePosition(index: number): GridPosition {
    const entry = this.getEntryTarget();

    return {
      col: entry.col + QUEUE_COL_START_OFFSET - index * QUEUE_COL_SPACING,
      row: entry.row + QUEUE_ROW_OFFSET,
    };
  }

  private spawnNpc() {
    const doorPosition = this.getDoorPosition();
    const entryTarget = this.getEntryTarget();

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
      this.sendToQueue(npc, sprite);
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

  // No hay mesa libre: el NPC pasa a `waiting` con motivo `table`, ocupando
  // la siguiente posición de cola disponible.
  private sendToQueue(npc: Npc, sprite: Phaser.GameObjects.Rectangle) {
    const queueIndex = this.npcs.filter(
      (candidate) => candidate.state === "waiting" && candidate.waitingReason === "table"
    ).length;
    const queuePosition = this.getQueuePosition(queueIndex);

    startWaiting(npc, "table", this.scene.time.now, TABLE_WAIT_PATIENCE_MS);

    const target = gridToWorldCenter(queuePosition, this.originX, this.originY);

    this.scene.tweens.add({
      targets: sprite,
      x: target.x,
      y: target.y,
      duration: WALK_TO_QUEUE_DURATION,
      onComplete: () => {
        npc.position = queuePosition;
      },
    });
  }

  // Abandono enfadado: se venció la paciencia de espera de mesa. Aplica la
  // penalización de reputación (una sola vez, porque el propio cambio de
  // estado a "leaving" impide que update() vuelva a disparar esto para el
  // mismo NPC) y lo manda hacia la puerta.
  private abandonForTimeout(npc: Npc) {
    const sprite = this.sprites.get(npc.id);

    if (!sprite) {
      return;
    }

    clearWaiting(npc);
    this.onTableAbandon?.();
    this.sendToDoor(npc, sprite);
  }

  // Infraestructura genérica de salida: camina hacia la puerta y despawnea al
  // llegar. Reutilizable por cualquier motivo de salida (abandono enfadado
  // acá en M04; M11 la reusa tras pagar).
  private sendToDoor(npc: Npc, sprite: Phaser.GameObjects.Rectangle) {
    npc.state = "leaving";

    const doorPosition = this.getDoorPosition();
    const target = gridToWorldCenter(doorPosition, this.originX, this.originY);

    this.scene.tweens.add({
      targets: sprite,
      x: target.x,
      y: target.y,
      scaleY: 1,
      duration: WALK_TO_DOOR_DURATION,
      onComplete: () => {
        npc.position = doorPosition;
        this.despawn(npc);
      },
    });
  }

  private despawn(npc: Npc) {
    const sprite = this.sprites.get(npc.id);

    sprite?.destroy();
    this.sprites.delete(npc.id);
    this.npcs = this.npcs.filter((candidate) => candidate.id !== npc.id);
  }
}
