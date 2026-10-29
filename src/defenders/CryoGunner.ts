import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { CryoProjectile } from "../objects/CryoProjectile.ts";
import { SETTINGS } from "../config/settings.ts";


export class CryoGunner extends Defender {
    private shootTimer: Phaser.Time.TimerEvent;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        private enemies: Enemy[]
    ) {
      
        super(scene, x, y, "cryogunner");
        this.setDisplaySize(60, 60);
        this.setDefenderHealth(SETTINGS.defenders.cryogunner.health);
        this.damage = SETTINGS.defenders.cryogunner.projectileDamage;

        this.shootTimer = scene.time.addEvent({
            delay: SETTINGS.defenders.cryogunner.fireIntervalMs,
            callback: () => {
                if (this.active && this.hasEnemyInRow(this.enemies)) {
                    this.shoot();
                }
            },
            loop: true
        });
    }

    private shoot(): void {
        if (this.scene.cache.audio.exists("laserSound")) {
            this.scene.sound.play("laserSound", { volume: 0.3 });
        }
        const projectile = new CryoProjectile(this.scene, this.x + 25, this.y - 2);

        // Level 2 damage upgrade
        if (this.upgradeLevel === 2) {
            projectile.damage *= SETTINGS.defenders.cryogunner.upgradeDamageMultiplier;
        }
        console.log("Cryo Gunner Level:", this.upgradeLevel, "Damage:", projectile.damage);
    }

    destroy(fromScene?: boolean): void {
        this.shootTimer?.remove();
        super.destroy(fromScene);
    }
}
