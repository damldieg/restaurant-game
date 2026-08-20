# state/

`GameState`: el estado central del juego, compuesto a partir de los datos que ya existen en
`core/` (dinero, furniture). No conoce sprites, imágenes ni ningún objeto de Phaser — Phaser lo
consume para renderizar, nunca al revés.
