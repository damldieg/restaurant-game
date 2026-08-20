import type Phaser from "phaser";
import { gridToWorldCenter } from "../grid";
import type { Customer } from "../../core/customers/customer";

const CUSTOMER_WIDTH = 22;
const CUSTOMER_HEIGHT = 28;
const CUSTOMER_COLOR = 0xc97a5b;

// Lector puro de GameState.customers (decisión confirmada en M03.5, ver
// .juntia/DECISIONS.md): nunca modifica CustomerState, solo crea/actualiza
// sprites a partir de lo que la simulación ya decidió.
export class CustomerRenderer {
  private sprites = new Map<string, Phaser.GameObjects.Rectangle>();
  private scene: Phaser.Scene;
  private originX: number;
  private originY: number;

  constructor(scene: Phaser.Scene, originX: number, originY: number) {
    this.scene = scene;
    this.originX = originX;
    this.originY = originY;
  }

  update(customers: Customer[]) {
    const currentIds = new Set(customers.map((customer) => customer.id));

    for (const [id, sprite] of this.sprites) {
      if (!currentIds.has(id)) {
        sprite.destroy();
        this.sprites.delete(id);
      }
    }

    for (const customer of customers) {
      const center = gridToWorldCenter(customer.position, this.originX, this.originY);
      const sprite = this.sprites.get(customer.id);

      if (sprite) {
        sprite.setPosition(center.x, center.y);
      } else {
        this.sprites.set(
          customer.id,
          this.scene.add.rectangle(center.x, center.y, CUSTOMER_WIDTH, CUSTOMER_HEIGHT, CUSTOMER_COLOR)
        );
      }
    }
  }
}
