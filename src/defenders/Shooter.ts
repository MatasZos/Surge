
import Phaser from "phaser";
import { Defender } from "./Defender";
import { Projectile } from "../objects/projectile";
import { Enemy } from "../enemies/Enemy";
import { SETTINGS } from "../config/settings";

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
                if (this.hasEnemyInRow()) {
                    this.shoot();
                }
            },
            loop: true
        });
    }

    private hasEnemyInRow(): boolean {
        return this.enemies.some(enemy =>
            enemy.active &&
            enemy.x > this.x &&
            Math.abs(enemy.y - this.y) < 20
        );
    }

    private shoot() {
        if (!this.active) return;

        if (this.scene.cache.audio.exists("laserSound")) {
            this.scene.sound.play("laserSound", { volume: 0.3 });
        }

        new Projectile(this.scene, this.x + 25, this.y - 2);
    }

    destroy(fromScene?: boolean) {
        if (this.shootTimer) {
            this.shootTimer.destroy();
        }

        super.destroy(fromScene);
    }
}
