
import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Projectile } from "../objects/projectile.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { SETTINGS } from "../config/settings.ts";


export class DualBarrel extends Defender {

    private shootTimer: Phaser.Time.TimerEvent;
    private enemies: Enemy[];

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        enemies: Enemy[]
    ) {
        super(scene, x, y, "dualbarrel");

        this.setDisplaySize(65, 65);

        this.setDefenderHealth(
            SETTINGS.defenders.dualbarrel.health
        );

        this.damage = SETTINGS.defenders.dualbarrel.damage;
        this.enemies = enemies;

        // Fires two shots every second
        this.shootTimer = scene.time.addEvent({
            delay: Math.max(
                1,
                SETTINGS.defenders.dualbarrel.fireIntervalMs
            ),
            callback: () => {
                if (this.active && this.hasEnemyInRow(this.enemies)) {
                    this.shoot();

                    // Second shot after 150ms
                    this.scene.time.delayedCall(150, () => {
                        if (this.active && this.hasEnemyInRow(this.enemies)) {
                            this.shoot();
                        }
                    });
                }
            },
            loop: true
        });
    }

    private shoot() {
        if (!this.active) return;

        if (this.scene.cache.audio.exists("laserSound")) {
            this.scene.sound.play("laserSound", {
                volume: 0.3
            });
        }

        const projectile = new Projectile(
            this.scene,
            this.x + 25,
            this.y - 2
        );

        //use dual barrel own projectile stats
        projectile.damage = SETTINGS.defenders.dualbarrel.projectileDamage;
        projectile.speed = SETTINGS.defenders.dualbarrel.projectileSpeed;
        
        // Level 2 damage upgrade
        if (this.upgradeLevel === 2) {
            projectile.damage *= SETTINGS.defenders.dualbarrel.upgradeDamageMultiplier;
        }
        console.log("Dual Barrel Level:", this.upgradeLevel, "Damage:", projectile.damage);
    }

    destroy(fromScene?: boolean) {
        this.shootTimer?.destroy();
        super.destroy(fromScene);
    }
}
