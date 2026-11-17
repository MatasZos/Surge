import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SETTINGS } from "../config/settings.ts";

export class DroneEnemy extends Enemy {
    readonly isFlying = true;

    private engineSound?: Phaser.Sound.BaseSound;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(
            scene, x, y, "drone",
            SETTINGS.enemies.drone.health,
            SETTINGS.enemies.drone.speed,
            SETTINGS.enemies.drone.damage
        );

        this.setDisplaySize(60, 60);

        // Play engine sound while drone is flying
        if (scene.cache.audio.exists("sfx_drone_engine")) {
            this.engineSound = scene.sound.add("sfx_drone_engine", {
                volume: 0.1,
                loop: true
            });

            this.engineSound.play();
        }
    }

    destroy(fromScene?: boolean) {
        // Stop engine sound when drone is removed
        if (this.engineSound) {
            this.engineSound.stop();
            this.engineSound.destroy();
            this.engineSound = undefined;
        }

        super.destroy(fromScene);
    }
}
