import Phaser from "phaser";
import { Projectile } from "./projectile";
import { SETTINGS } from "../config/settings";

export class CryoProjectile extends Projectile {
    readonly slowMultiplier = 0.5;
    readonly slowDurationMs = 3000;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.setTint(0x77ddff);
        this.damage = SETTINGS.defenders.cryogunner.projectileDamage;
        this.speed = SETTINGS.defenders.cryogunner.projectileSpeed;
    }
}
