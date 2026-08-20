import type { Furniture } from "./restaurant";
import type { FurnitureDefinition } from "./furniture-catalog";

export function calculateTotalReputation(
  placedFurniture: Furniture[],
  catalog: FurnitureDefinition[]
): number {
  return placedFurniture.reduce((total, item) => {
    const definition = catalog.find((entry) => entry.type === item.type);

    return total + (definition?.reputation ?? 0);
  }, 0);
}
