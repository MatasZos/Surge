
import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 800;

new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#1b1b1b",
    parent: "game-container",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },

    scene: [GameScene]
});
