
import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { Defender } from "../defenders/Defender.ts";
import { Landmine } from "../defenders/Landmine.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";
import { SETTINGS } from "../config/settings.ts";

export class RangedEnemy extends Enemy {

    private shootTimer: Phaser.Time.TimerEvent;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        private defenders: Defender[],
        private stronghold: Stronghold
    ) {
        super(scene,x,y,"rangedEnemy",SETTINGS.enemies.ranged.health,SETTINGS.enemies.ranged.speed,SETTINGS.enemies.ranged.damage);

        // Shoot using the interval from the spreadsheet
        this.shootTimer = scene.time.addEvent({
            delay: SETTINGS.enemies.ranged.attackIntervalMs,
            callback: () => {
                if (this.active && this.isAttacking) {
                    console.log("Ranged enemy shooting!");
                    const projectile = new EnemyProjectile(this.scene, this.x - 30, this.y);
                    projectile.damage = Math.round(projectile.damage * this.projectileDamageMultiplier)
                }
            },
            loop: true
        });
    }

    move(delta: number) {

        // Check for defenders in shooting range
        const defenderInRange = this.defenders.some(defender =>
            defender.active &&
            !(defender instanceof Landmine) &&
            defender.x < this.x &&
            Math.abs(defender.y - this.y) < 30 &&
            this.x - defender.x <= SETTINGS.enemies.ranged.attackRange
        );

        // Check for stronghold in shooting range
        const strongholdX = this.stronghold.getCollisionBounds().right;

        const strongholdInRange =
            this.x > strongholdX &&
            this.x - strongholdX <= SETTINGS.enemies.ranged.attackRange;

        // Stop and shoot
        this.isAttacking = defenderInRange || strongholdInRange;

        if (!this.isAttacking) {
            super.move(delta);
        }
    }

    destroy(fromScene?: boolean) {
        this.shootTimer?.destroy();
        super.destroy(fromScene);
    }
}
