# core/

Reglas, datos y lógica de negocio del juego. No debe importar `phaser` ni conocer sprites,
escenas, tweens u otros objetos de renderizado — eso vive en `main.ts` (y en `game/` mientras
dura la migración progresiva). El objetivo es que todo lo de acá se pueda testear sin crear una
escena de Phaser, como ya pasa con los tests de Vitest existentes.
