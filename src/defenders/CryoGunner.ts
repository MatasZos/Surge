import Phaser from "phaser";
import { Defender } from "./Defender";
import { Enemy } from "../enemies/Enemy";
import { CryoProjectile } from "../objects/CryoProjectile";
import { SETTINGS } from "../config/settings";
import { BossEnemy } from "../enemies/BossEnemy";

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
                if (this.active && this.hasEnemyInRow()) {
                    this.shoot();
                }
            },
            loop: true
        });
    }

    private hasEnemyInRow(): boolean {
        return this.enemies.some(enemy => {

            if (!enemy.active || enemy.x <= this.x) {
                return false;
            }

            //boss spans across all 5 lanes
            if (enemy instanceof BossEnemy) {
                const bounds = enemy.getBounds();

                return (
                    this.y >= bounds.top &&
                    this.y <= bounds.bottom
                );
            }

            //normal enemies
            return Math.abs(enemy.y - this.y) < 20;
        });
    }

    private shoot(): void {
        if (this.scene.cache.audio.exists("laserSound")) {
            this.scene.sound.play("laserSound", { volume: 0.3 });
        }
        new CryoProjectile(this.scene, this.x + 25, this.y - 2);
    }

    destroy(fromScene?: boolean): void {
        this.shootTimer?.remove();
        super.destroy(fromScene);
    }
}
