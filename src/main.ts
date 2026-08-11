import Phaser from "phaser";
import { TILE_SIZE, gridToWorldCenter, type GridPosition } from "./game/grid";
import {
  RESTAURANT_COLS,
  RESTAURANT_ROWS,
  furniture,
  findFreeTable,
  getSeatPosition,
  type Furniture,
} from "./game/restaurant";
import { createNpc, type Npc } from "./game/npc";

// Cómo se dibuja cada tipo de mueble: es una decisión de renderizado
// (Phaser), no de datos del juego, por eso vive aquí y no en game/restaurant.ts.
const FURNITURE_STYLE: Record<Furniture["type"], { size: number; color: number }> = {
  table: { size: TILE_SIZE, color: 0x8b5a3c },
  chair: { size: TILE_SIZE * 0.7, color: 0x5f3b2a },
};

class RestaurantScene extends Phaser.Scene {
  constructor() {
    super("RestaurantScene");
  }

  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private originX = 0;
  private originY = 0;
  private npc!: Npc;
  private npcSprite!: Phaser.GameObjects.Rectangle;
  private occupiedTables: GridPosition[] = [];

  create() {
    this.createRestaurant();
    this.createPlayer();
    this.createNpc();
  }

  update() {
    const speed = 160;

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -speed;
    }

    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -speed;
    }

    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = speed;
    }

    this.player.x += velocityX / 60;
    this.player.y += velocityY / 60;
  }

  private createRestaurant() {
    const restaurantWidth = RESTAURANT_COLS * TILE_SIZE;
    const restaurantHeight = RESTAURANT_ROWS * TILE_SIZE;

    const startX = (800 - restaurantWidth) / 2;
    const startY = (600 - restaurantHeight) / 2;

    this.originX = startX;
    this.originY = startY;

    // Suelo
    this.add.rectangle(400, 300, restaurantWidth, restaurantHeight, 0xc99b62);

    // Cuadrícula
    const graphics = this.add.graphics();

    graphics.lineStyle(1, 0xb58352, 0.35);

    for (let col = 0; col <= RESTAURANT_COLS; col++) {
      const x = startX + col * TILE_SIZE;

      graphics.lineBetween(x, startY, x, startY + restaurantHeight);
    }

    for (let row = 0; row <= RESTAURANT_ROWS; row++) {
      const y = startY + row * TILE_SIZE;

      graphics.lineBetween(startX, y, startX + restaurantWidth, y);
    }

    // Pared exterior
    graphics.lineStyle(6, 0x75452f, 1);

    graphics.strokeRect(startX, startY, restaurantWidth, restaurantHeight);

    // Puerta
    this.add.rectangle(400, startY + restaurantHeight, 48, 12, 0x6b3f2a);

    // Muebles (mesas, sillas...) a partir de los datos del restaurante
    for (const item of furniture) {
      const { x, y } = gridToWorldCenter(item.position, startX, startY);
      const style = FURNITURE_STYLE[item.type];

      this.add.rectangle(x, y, style.size, style.size, style.color);
    }

    // Título
    this.add.text(24, 20, "TABLE & TALE", {
      fontFamily: "monospace",
      fontSize: "28px",
      color: "#ffffff",
    });

    this.add.text(24, 55, "Día 1  •  Reputación: 0", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#dddddd",
    });
  }

  private createNpc() {
    const doorPosition = { col: RESTAURANT_COLS / 2, row: RESTAURANT_ROWS - 1 };
    const entryTarget = { col: RESTAURANT_COLS / 2, row: RESTAURANT_ROWS - 4 };

    this.npc = createNpc(doorPosition, "walking");

    const start = gridToWorldCenter(doorPosition, this.originX, this.originY);

    this.npcSprite = this.add.rectangle(start.x, start.y, 22, 28, 0xc97a5b);

    const target = gridToWorldCenter(entryTarget, this.originX, this.originY);

    this.tweens.add({
      targets: this.npcSprite,
      x: target.x,
      y: target.y,
      duration: 1200,
      onComplete: () => {
        this.npc.position = entryTarget;
        this.sendNpcToTable();
      },
    });
  }

  private sendNpcToTable() {
    const table = findFreeTable(this.occupiedTables);

    if (!table) {
      // No hay mesa libre: por ahora el NPC se queda esperando en la entrada.
      this.npc.state = "idle";
      return;
    }

    this.occupiedTables.push(table.position);

    const seat = getSeatPosition(table);
    const seatCenter = gridToWorldCenter(seat, this.originX, this.originY);
    const tableCenter = gridToWorldCenter(table.position, this.originX, this.originY);

    // Acerca al NPC hacia la mesa y lo "achata" para simular que se sienta
    // (placeholder hasta que haya sprites con pose real de sentado).
    const seatedY = seatCenter.y + (tableCenter.y - seatCenter.y) * 0.25;

    this.tweens.add({
      targets: this.npcSprite,
      x: seatCenter.x,
      y: seatedY,
      scaleY: 0.65,
      duration: 800,
      onComplete: () => {
        this.npc.position = seat;
        this.npc.state = "seated";
      },
    });
  }

  private createPlayer() {
    this.player = this.add.rectangle(400, 350, 22, 28, 0x4f7cac);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#292929",
  scene: RestaurantScene,
};

new Phaser.Game(config);
