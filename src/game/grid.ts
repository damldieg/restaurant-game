export const TILE_SIZE = 32;

export interface GridPosition {
  col: number;
  row: number;
}

// Convierte una posición de grid al centro de esa celda en píxeles,
// dado el origen (esquina superior izquierda) del grid en el mundo.
export function samePosition(a: GridPosition, b: GridPosition): boolean {
  return a.col === b.col && a.row === b.row;
}

export function gridToWorldCenter(
  position: GridPosition,
  originX: number,
  originY: number
): { x: number; y: number } {
  return {
    x: originX + position.col * TILE_SIZE + TILE_SIZE / 2,
    y: originY + position.row * TILE_SIZE + TILE_SIZE / 2,
  };
}

// Inversa de gridToWorldCenter: dado un punto del mundo, la celda de grid que lo contiene.
export function worldToGridPosition(
  worldX: number,
  worldY: number,
  originX: number,
  originY: number
): GridPosition {
  return {
    col: Math.floor((worldX - originX) / TILE_SIZE),
    row: Math.floor((worldY - originY) / TILE_SIZE),
  };
}
