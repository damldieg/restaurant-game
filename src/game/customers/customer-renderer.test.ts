import type Phaser from "phaser";
import { describe, expect, it, vi } from "vitest";
import { CustomerRenderer } from "./customer-renderer";
import { createCustomer } from "../../core/customers/customer";

function createMockScene() {
  const rectangles: Array<{ setPosition: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }> = [];

  const scene = {
    add: {
      rectangle: vi.fn(() => {
        const rectangle = { setPosition: vi.fn(), destroy: vi.fn() };

        rectangles.push(rectangle);

        return rectangle;
      }),
    },
  };

  return { scene: scene as unknown as Phaser.Scene, addRectangle: scene.add.rectangle, rectangles };
}

describe("CustomerRenderer", () => {
  it("creates a sprite for a new customer", () => {
    const { scene, addRectangle } = createMockScene();
    const renderer = new CustomerRenderer(scene, 0, 0);

    renderer.update([createCustomer("customer-1", { col: 1, row: 2 }, "walking")]);

    expect(addRectangle).toHaveBeenCalledTimes(1);
  });

  it("does not create a second sprite for a customer already rendered", () => {
    const { scene, addRectangle } = createMockScene();
    const renderer = new CustomerRenderer(scene, 0, 0);
    const customer = createCustomer("customer-1", { col: 1, row: 2 }, "walking");

    renderer.update([customer]);
    renderer.update([customer]);

    expect(addRectangle).toHaveBeenCalledTimes(1);
  });

  it("updates the sprite's position from the customer's current position", () => {
    const { scene, rectangles } = createMockScene();
    const renderer = new CustomerRenderer(scene, 0, 0);
    const customer = createCustomer("customer-1", { col: 1, row: 2 }, "walking");

    renderer.update([customer]);
    customer.position = { col: 5, row: 6 };
    renderer.update([customer]);

    expect(rectangles[0].setPosition).toHaveBeenCalledTimes(1);
  });

  it("destroys the sprite once its customer is no longer in the list", () => {
    const { scene, rectangles } = createMockScene();
    const renderer = new CustomerRenderer(scene, 0, 0);
    const customer = createCustomer("customer-1", { col: 1, row: 2 }, "walking");

    renderer.update([customer]);
    renderer.update([]);

    expect(rectangles[0].destroy).toHaveBeenCalledTimes(1);
  });

  it("does not create a new sprite for an id it already destroyed", () => {
    const { scene, addRectangle } = createMockScene();
    const renderer = new CustomerRenderer(scene, 0, 0);
    const customer = createCustomer("customer-1", { col: 1, row: 2 }, "walking");

    renderer.update([customer]);
    renderer.update([]);
    renderer.update([]);

    expect(addRectangle).toHaveBeenCalledTimes(1);
  });

  it("never mutates the customer objects it renders", () => {
    const { scene } = createMockScene();
    const renderer = new CustomerRenderer(scene, 0, 0);
    const customer = createCustomer("customer-1", { col: 1, row: 2 }, "walking");
    const snapshot = structuredClone(customer);

    renderer.update([customer]);

    expect(customer).toEqual(snapshot);
  });
});
