import type { GameState } from "../state/game-state";
import type { GameSystem } from "./game-system";

// Punto de extensión: todavía no hay spawn, movimiento ni transiciones de
// clientes. Las próximas tareas de M04 agregan comportamiento real acá,
// siguiendo el principio confirmado en M03.5 (la simulación es la fuente de
// verdad; Phaser solo representa lo que este sistema escriba en GameState).
export class CustomerSystem implements GameSystem {
  update(_state: GameState, _deltaMs: number): void {}
}
