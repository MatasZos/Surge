
import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { MainMenu } from "./scenes/MainMenu";

import { GAME_WIDTH, GAME_HEIGHT } from "./constants";

new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#1b1b1b",
    parent: "game-container",

    scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER
},
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },

    scene: [MainMenu,GameScene]
});
