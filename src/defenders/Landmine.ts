import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { SETTINGS } from "../config/settings.ts";

/** Potato Mine-inspired: arms after a delay and explodes on contact. */
export class Landmine extends Defender {
    private armed = false;
    private armingTimer: Phaser.Time.TimerEvent;
    private indicator: Phaser.GameObjects.Arc;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "landmine");
        this.setDisplaySize(66, 66);
        this.setDefenderHealth(SETTINGS.defenders.landmine.health);
        this.damage = SETTINGS.defenders.landmine.damage;
        this.indicator = scene.add.circle(x, y - 34, 6, 0xff9b35).setDepth(5);
        this.armingTimer = scene.time.delayedCall(SETTINGS.defenders.landmine.armingMs, () => {
            if (!this.active) return;
            this.armed = true;
            this.indicator.setFillStyle(0x23ff8e);
        });
    }

    tryDetonate(enemies: Enemy[]): boolean {
        if (!this.active || !this.armed) return false;
        const triggered = enemies.some(enemy => enemy.active &&
            Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), this.getBounds()));
        if (!triggered) return false;

        const radius = SETTINGS.defenders.landmine.blastRadius;
        for (const enemy of enemies) {
            if (enemy.active && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= radius) {
                enemy.takeDamage(this.damage);
            }
        }
        const blast = this.scene.add.circle(this.x, this.y, radius, 0xffa329, 0.45).setDepth(7);
        this.scene.tweens.add({ targets: blast, alpha: 0, scale: 1.2, duration: 220,
            onComplete: () => blast.destroy() });
        this.destroy();
        return true;
    }

    override destroy(fromScene?: boolean): void {
        this.armingTimer?.remove(false);
        this.indicator?.destroy();
        super.destroy(fromScene);
    }
}
