import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { CrusherEnemy } from "../enemies/CrusherEnemy.ts";
import { SETTINGS } from "../config/settings.ts";

/** Chomper-inspired close-range defender. */
export class Scrapper extends Defender {
    private readonly recoveryMs = 42000;
    private readonly biteRange = 85;
    private readonly heavyEnemyDamage = 500;
    private recovering = false;
    private recoveryTimer?: Phaser.Time.TimerEvent;
    private statusIndicator: Phaser.GameObjects.Arc;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "scrapper");
        this.setDisplaySize(70, 70);
        this.setDefenderHealth(SETTINGS.defenders.scrapper.health);
        this.statusIndicator = scene.add.circle(x, y - 43, 5, 0x24f59c).setDepth(5);
    }

    /** Call once per frame from the collision system in a later step. */
    tryBite(enemies: Enemy[]): boolean {
        if (!this.active || this.recovering) return false;

        // Enemies move right-to-left: only bite targets ahead of the Scrapper.
        const target = enemies
            .filter(enemy => enemy.active &&
                Math.abs(enemy.y - this.y) < 35 &&
                enemy.x >= this.x - 12 &&
                enemy.x <= this.x + this.biteRange)
            .sort((a, b) => a.x - b.x)[0];

        if (!target) return false;

        // Normal enemies are eliminated; Crushers only take heavy damage.
        let damage = target instanceof CrusherEnemy
            ? this.heavyEnemyDamage
            : target.health;

            // Level 2 upgrade against Crushers
            if (this.upgradeLevel === 2 && target instanceof CrusherEnemy) {
                damage *= SETTINGS.defenders.scrapper.upgradeDamageMultiplier;
            }

            target.takeDamage(damage);

            console.log("Scrapper Level:", this.upgradeLevel, "Damage:", damage);

        this.recovering = true;
        this.statusIndicator.setFillStyle(0xffa52d);
        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1.12,
            scaleY: this.scaleY * 1.12,
            duration: 110,
            yoyo: true
        });
        this.recoveryTimer = this.scene.time.delayedCall(SETTINGS.defenders.scrapper.recoveryMs, () => {
            if (!this.active) return;
            this.recovering = false;
            this.statusIndicator.setFillStyle(0x24f59c);
        });
        return true;
    }

    override destroy(fromScene?: boolean): void {
        this.recoveryTimer?.remove(false);
        this.statusIndicator?.destroy();
        super.destroy(fromScene);
    }
}
