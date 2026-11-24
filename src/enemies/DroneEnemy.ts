import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SETTINGS } from "../config/settings.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

export class DroneEnemy extends Enemy {
    readonly isFlying = true;

    private hasEngineSound = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(
            scene, x, y, "drone",
            SETTINGS.enemies.drone.health,
            SETTINGS.enemies.drone.speed,
            SETTINGS.enemies.drone.damage
        );

        this.setDisplaySize(60, 60);

        // Play engine sound while drone is flying
        this.hasEngineSound = SoundManager.acquireLoop(scene, "sfx_drone_engine");
    }

    destroy(fromScene?: boolean) {
        // Stop engine sound when drone is removed
        if (this.hasEngineSound) {
            SoundManager.releaseLoop("sfx_drone_engine");
            this.hasEngineSound = false;
        }

        super.destroy(fromScene);
    }
}
