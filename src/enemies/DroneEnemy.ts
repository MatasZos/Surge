import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";

/**
 * A flying enemy inspired by PvZ's Balloon Zombie.
 *
 * Drone-specific collision rules will be implemented separately:
 * - Flies over Barricades without stopping or damaging them.
 * - Does not trigger Landmines.
 * - Remains vulnerable to Shooter, Dual Barrel and Cryo Gunner projectiles.
 *
 * This class does not register itself with any spawner or wave.
 */
export class DroneEnemy extends Enemy {
    readonly isFlying = true;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Temporary SURGE-scaled baseline, matching the basic melee enemy.
        // We'll move these values to enemies.csv/settings.ts in a later step.
        super(scene, x, y, "droneEnemy", 300, 18, 0);
        this.setDisplaySize(60, 60);
    }
}
