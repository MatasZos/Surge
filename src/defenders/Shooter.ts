
import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Projectile } from "../objects/projectile.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { SETTINGS } from "../config/settings.ts";


export class Shooter extends Defender {

    private shootTimer: Phaser.Time.TimerEvent;
    private enemies: Enemy[];

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        enemies: Enemy[]
    ) {
        super(scene, x, y, "shooter");

        this.setDisplaySize(60, 60);
        this.setDefenderHealth(SETTINGS.defenders.shooter.health);
        this.damage = SETTINGS.defenders.shooter.damage;
        this.enemies = enemies;

        this.shootTimer = scene.time.addEvent({
            delay: Math.max(1, SETTINGS.defenders.shooter.fireIntervalMs),
            callback: () => {
               if (this.hasEnemyInRow(this.enemies)) {
                this.shoot();
                }
            },
            loop: true
        });
    }


    private shoot() {
        if (!this.active) return;

        if (this.scene.cache.audio.exists("laserSound")) {
            this.scene.sound.play("laserSound", { volume: 0.3 });
        }

        const projectile = new Projectile(this.scene, this.x + 25, this.y - 2);

        if (this.upgradeLevel === 2) {
            projectile.damage *= SETTINGS.defenders.shooter.upgradeDamageMultiplier;
        }
        console.log("Shooter Level:", this.upgradeLevel, "Damage:", projectile.damage);
    }

    destroy(fromScene?: boolean) {
        if (this.shootTimer) {
            this.shootTimer.destroy();
        }

        super.destroy(fromScene);
    }
}
