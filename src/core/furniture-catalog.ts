import type { FurnitureType } from "./restaurant";

export interface FurnitureDefinition {
  type: FurnitureType;
  name: string;
  price: number;
  reputation: number;
}

export const FURNITURE_CATALOG: FurnitureDefinition[] = [
  { type: "table", name: "Mesa", price: 100, reputation: 3 },
  { type: "chair", name: "Silla", price: 25, reputation: 1 },
];
