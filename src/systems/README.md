# systems/

Sistemas de lógica independientes que actualizan el `GameState` en cada frame, según el
contrato `GameSystem` (`types.ts`). Ningún sistema concreto todavía — M02.5 solo deja armado el
contrato y el punto donde `main.ts` los va a ejecutar; los sistemas reales (reputación,
clientes, cocina, empleados) se agregan en los milestones que los necesitan.
