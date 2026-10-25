import Phaser from "phaser";
import { Projectile } from "./projectile.ts";
import { SETTINGS } from "../config/settings.ts";

export class CryoProjectile extends Projectile {
    readonly slowMultiplier = SETTINGS.defenders.cryogunner.slowMultiplier;
    readonly slowDurationMs =  SETTINGS.defenders.cryogunner.slowDurationMs;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.setTint(0x77ddff);
        this.damage = SETTINGS.defenders.cryogunner.projectileDamage;
        this.speed = SETTINGS.defenders.cryogunner.projectileSpeed;
    }
}
