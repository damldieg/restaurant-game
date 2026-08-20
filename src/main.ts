import Phaser from "phaser";
import { TILE_SIZE, gridToWorldCenter, worldToGridPosition, type GridPosition } from "./game/grid";
import { RESTAURANT_COLS, RESTAURANT_ROWS, furniture, type Furniture } from "./core/restaurant";
import { NpcController } from "./game/npc/controller";
import { FURNITURE_CATALOG } from "./core/furniture-catalog";
import { isValidPlacement } from "./core/placement";
import { canAfford } from "./core/economy";

const NPC_SPAWN_INTERVAL_MS = 2500;
const INITIAL_MONEY = 500;

// Provisional: por ahora solo la mesa tiene una forma de instancia que
// `isValidPlacement`+confirmación pueden crear sin datos adicionales (una
// silla real necesita un `tableId`, que este modo de colocación todavía no
// pide). El catálogo completo (con precios) ya existe para M02/M03.
const PLACEABLE_DEFINITION = FURNITURE_CATALOG.find((item) => item.type === "table")!;

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
  private nextFurnitureId = 1;
  private placementActive = false;
  private previewRect!: Phaser.GameObjects.Rectangle;
  private placementText!: Phaser.GameObjects.Text;
  private money = INITIAL_MONEY;
  private moneyText!: Phaser.GameObjects.Text;

  create() {
    this.createRestaurant();

    this.npcController = new NpcController(
      this,
      this.originX,
      this.originY,
      RESTAURANT_COLS,
      RESTAURANT_ROWS
    );
    this.npcController.startSpawning(NPC_SPAWN_INTERVAL_MS);

    this.createPlacementMode();
  }

  private createPlacementMode() {
    const style = FURNITURE_STYLE[PLACEABLE_DEFINITION.type];

    this.previewRect = this.add.rectangle(0, 0, style.size, style.size, style.color, 0.5);
    this.previewRect.setVisible(false);

    this.placementText = this.add.text(
      24,
      580,
      `[1] Construir ${PLACEABLE_DEFINITION.name} ($${PLACEABLE_DEFINITION.price}) · Click: confirmar · Esc: cancelar`,
      { fontFamily: "monospace", fontSize: "12px", color: "#dddddd" }
    );
    this.placementText.setVisible(false);

    this.input.keyboard!.on("keydown-ONE", () => {
      this.placementActive = true;
      this.previewRect.setVisible(true);
      this.placementText.setVisible(true);
    });

    this.input.keyboard!.on("keydown-ESC", () => {
      this.cancelPlacement();
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.placementActive) return;

      const gridPosition = this.pointerToGridPosition(pointer);
      const center = gridToWorldCenter(gridPosition, this.originX, this.originY);
      const valid = this.canPlaceAt(gridPosition);

      this.previewRect.setPosition(center.x, center.y);
      this.previewRect.setFillStyle(valid ? 0x4caf50 : 0xe74c3c, 0.5);
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.placementActive) return;

      this.confirmPlacement(pointer);
    });
  }

  private pointerToGridPosition(pointer: Phaser.Input.Pointer): GridPosition {
    return worldToGridPosition(pointer.worldX, pointer.worldY, this.originX, this.originY);
  }

  private canPlaceAt(gridPosition: GridPosition): boolean {
    const withinGridAndFree = isValidPlacement(
      gridPosition,
      { cols: RESTAURANT_COLS, rows: RESTAURANT_ROWS },
      furniture
    );

    return withinGridAndFree && canAfford(this.money, PLACEABLE_DEFINITION.price);
  }

  private confirmPlacement(pointer: Phaser.Input.Pointer) {
    const gridPosition = this.pointerToGridPosition(pointer);

    if (!this.canPlaceAt(gridPosition)) return;

    this.money -= PLACEABLE_DEFINITION.price;
    this.updateMoneyDisplay();

    furniture.push({
      id: `table-${this.nextFurnitureId++}`,
      type: "table",
      position: gridPosition,
    });

    const center = gridToWorldCenter(gridPosition, this.originX, this.originY);
    const style = FURNITURE_STYLE.table;

    this.add.rectangle(center.x, center.y, style.size, style.size, style.color);

    this.cancelPlacement();
  }

  private cancelPlacement() {
    this.placementActive = false;
    this.previewRect.setVisible(false);
    this.placementText.setVisible(false);
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

    this.moneyText = this.add.text(24, 80, "", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#dddddd",
    });
    this.updateMoneyDisplay();
  }

  private updateMoneyDisplay() {
    this.moneyText.setText(`Dinero: $${this.money}`);
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
