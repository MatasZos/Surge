import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { CryoProjectile } from "../objects/CryoProjectile.ts";
import { SETTINGS } from "../config/settings.ts";


export class CryoGunner extends Defender {
    private shootTimer: Phaser.Time.TimerEvent;
    private shotCount = 0;

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
        
        // Play the Cryo Gunner's ice weapon sound
        if (this.scene.cache.audio.exists("sfx_cryogunner_fire")) {
            this.scene.sound.play("sfx_cryogunner_fire", {
                volume: 0.18
            });
        }

        const projectile = new CryoProjectile(this.scene, this.x + 25, this.y - 2);

        // Level 2 damage upgrade
        if (this.upgradeLevel >= 2) {
            projectile.damage *= SETTINGS.defenders.cryogunner.upgradeDamageMultiplier;
        }

        // Level 3 Frozen Shock every 8 shot
        if (this.upgradeLevel === 3) {
            this.shotCount++;

            if (this.shotCount % 8 === 0) {
                projectile.frozenShock = true;
            }
        }
    }

    destroy(fromScene?: boolean): void {
        this.shootTimer?.remove();
        super.destroy(fromScene);
    }
}
