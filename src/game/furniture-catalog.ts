import type { FurnitureType } from "./restaurant";

export interface FurnitureDefinition {
  type: FurnitureType;
  name: string;
  price: number;
}

export const FURNITURE_CATALOG: FurnitureDefinition[] = [
  { type: "table", name: "Mesa", price: 100 },
  { type: "chair", name: "Silla", price: 25 },
];
