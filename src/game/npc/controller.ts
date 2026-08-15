import Phaser from "phaser";
import { gridToWorldCenter, type GridPosition } from "../grid";
import {
  findFreeTable,
  getDoorPosition,
  getEntryPosition,
  getQueuePosition,
  getSeatForTable,
} from "../restaurant";
import { applyAbandonmentPenalty } from "../reputation";
import { createNpc, hasWaitTimedOut, startLeaving, startWaiting, type Npc } from "./npc";

const NPC_WIDTH = 22;
const NPC_HEIGHT = 28;
const NPC_COLOR = 0xc97a5b;
const WALK_TO_ENTRY_DURATION = 1200;
const WALK_TO_SEAT_DURATION = 800;
const WALK_TO_QUEUE_DURATION = 500;
const WALK_TO_DOOR_DURATION = 1200;

// Límite de paciencia para la espera de mesa. Valor por defecto marcado como
// propuesta de Producto en .juntia/pending.json (docs/MILESTONES.md no fija
// una duración concreta).
export const TABLE_WAIT_PATIENCE_MS = 15000;

export class NpcController {
  private npcs: Npc[] = [];
  private sprites = new Map<string, Phaser.GameObjects.Rectangle>();
  private occupiedTables: GridPosition[] = [];
  // Índice de cola por NPC (asignado una vez, nunca reutilizado, para que
  // cada NPC en espera tenga una posición estable y distinta).
  private queueIndexByNpcId = new Map<string, number>();
  private nextQueueIndex = 0;
  private nextId = 1;
  private reputation = 0;
  private scene: Phaser.Scene;
  private originX: number;
  private originY: number;
  private onReputationChange?: (reputation: number) => void;

  constructor(
    scene: Phaser.Scene,
    originX: number,
    originY: number,
    onReputationChange?: (reputation: number) => void
  ) {
    this.scene = scene;
    this.originX = originX;
    this.originY = originY;
    this.onReputationChange = onReputationChange;
  }

  startSpawning(intervalMs: number) {
    this.spawnNpc();

    this.scene.time.addEvent({
      delay: intervalMs,
      loop: true,
      callback: () => this.spawnNpc(),
    });
  }

  getReputation(): number {
    return this.reputation;
  }

  // Llamado desde el `update()` de la escena: revisa a los NPCs en espera de
  // mesa y dispara el abandono enfadado cuando se vence su paciencia.
  update(now: number) {
    for (const npc of [...this.npcs]) {
      if (npc.state !== "waiting" || npc.waitingReason !== "table") {
        continue;
      }

      if (hasWaitTimedOut(npc.waitStartedAt!, npc.waitPatienceMs!, now)) {
        this.abandonWaiting(npc);
      }
    }
  }

  private spawnNpc() {
    const doorPosition = getDoorPosition();
    const entryTarget = getEntryPosition();

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
      this.joinQueue(npc, sprite);
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

  // Sin mesa libre: el NPC pasa a `waiting` con motivo `table`, caminando
  // hacia una posición de cola distinta de `entryTarget` y de la de
  // cualquier otro NPC en espera.
  private joinQueue(npc: Npc, sprite: Phaser.GameObjects.Rectangle) {
    const queueIndex = this.nextQueueIndex++;

    this.queueIndexByNpcId.set(npc.id, queueIndex);

    const queuePosition = getQueuePosition(queueIndex);
    const queueCenter = gridToWorldCenter(queuePosition, this.originX, this.originY);
    const now = this.scene.time.now;

    Object.assign(npc, startWaiting(npc, "table", now, TABLE_WAIT_PATIENCE_MS));

    this.scene.tweens.add({
      targets: sprite,
      x: queueCenter.x,
      y: queueCenter.y,
      duration: WALK_TO_QUEUE_DURATION,
      onComplete: () => {
        npc.position = queuePosition;
      },
    });
  }

  // Abandono enfadado: dispara la transición genérica de salida y aplica la
  // penalización de reputación exactamente una vez.
  private abandonWaiting(npc: Npc) {
    this.queueIndexByNpcId.delete(npc.id);

    this.reputation = applyAbandonmentPenalty(this.reputation);
    this.onReputationChange?.(this.reputation);

    Object.assign(npc, startLeaving(npc));

    const sprite = this.sprites.get(npc.id);

    if (sprite) {
      this.sendToDoor(npc, sprite);
    }
  }

  // Infraestructura genérica de salida: caminar hacia la puerta y
  // despawnear al llegar. Reutilizable por cualquier motivo de `leaving`
  // (abandono enfadado en M04, salida tras pagar en M11).
  private sendToDoor(npc: Npc, sprite: Phaser.GameObjects.Rectangle) {
    const doorPosition = getDoorPosition();
    const doorCenter = gridToWorldCenter(doorPosition, this.originX, this.originY);

    this.scene.tweens.add({
      targets: sprite,
      x: doorCenter.x,
      y: doorCenter.y,
      duration: WALK_TO_DOOR_DURATION,
      onComplete: () => {
        this.despawn(npc);
      },
    });
  }

  private despawn(npc: Npc) {
    this.npcs = this.npcs.filter((candidate) => candidate.id !== npc.id);

    const sprite = this.sprites.get(npc.id);

    sprite?.destroy();
    this.sprites.delete(npc.id);
  }
}
