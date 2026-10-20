
import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { MainMenu } from "./scenes/MainMenu";
import { GameOver } from "./scenes/GameOver";
import { LevelComplete } from "./scenes/LevelComplete";

import { loadConfig } from "./config/config";
import { SETTINGS } from "./config/settings";

import { GAME_WIDTH, GAME_HEIGHT } from "./constants";

async function startGame(){
    await loadConfig();

    console.log("Melee health:", SETTINGS.enemies.melee.health);

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

        scene: [MainMenu,GameScene, GameOver, LevelComplete]
    });

}

startGame();
