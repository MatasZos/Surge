
import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { Defender } from "../defenders/Defender";
import { Stronghold } from "../objects/Stronghold";
import { EnemyProjectile } from "../objects/EnemyProjectile";
import { SETTINGS } from "../config/settings";

export class RangedEnemy extends Enemy {

    private shootTimer: Phaser.Time.TimerEvent;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        private defenders: Defender[],
        private stronghold: Stronghold
    ) {
        super(scene,x,y,"meleeEnemy",SETTINGS.enemies.ranged.health,SETTINGS.enemies.ranged.speed,SETTINGS.enemies.ranged.damage);

        // Make ranged enemies blue
        this.setTint(0x00aaff);

        // Shoot using the interval from the spreadsheet
        this.shootTimer = scene.time.addEvent({
            delay: SETTINGS.enemies.ranged.attackIntervalMs,
            callback: () => {
                if (this.active && this.isAttacking) {
                    console.log("Ranged enemy shooting!");
                    new EnemyProjectile(this.scene, this.x - 30, this.y);
                }
            },
            loop: true
        });
    }

    move(delta: number) {

        // Check for defenders in shooting range
        const defenderInRange = this.defenders.some(defender =>
            defender.active &&
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
