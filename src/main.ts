import Phaser from "phaser";
import { TILE_SIZE, gridToWorldCenter } from "./game/grid";
import { RESTAURANT_COLS, RESTAURANT_ROWS, furniture, type Furniture } from "./game/restaurant";
import { NpcController } from "./game/npc/controller";

const NPC_SPAWN_INTERVAL_MS = 2500;

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

  private originX = 0;
  private originY = 0;
  private npcController!: NpcController;
  private reputationText!: Phaser.GameObjects.Text;

  create() {
    this.createRestaurant();

    this.npcController = new NpcController(this, this.originX, this.originY, (reputation) =>
      this.updateReputationText(reputation)
    );
    this.npcController.startSpawning(NPC_SPAWN_INTERVAL_MS);
  }

  update(time: number) {
    this.npcController.update(time);
  }

  private updateReputationText(reputation: number) {
    this.reputationText.setText(`Día 1  •  Reputación: ${reputation}`);
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

    this.reputationText = this.add.text(24, 55, "Día 1  •  Reputación: 0", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#dddddd",
    });
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
