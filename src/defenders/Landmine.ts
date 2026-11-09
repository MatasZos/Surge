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

        // Level 3 increases the explosion radius by 50%
        const radius = this.upgradeLevel === 3
        
        ? SETTINGS.defenders.landmine.blastRadius * 1.5
        : SETTINGS.defenders.landmine.blastRadius;

        const targets = enemies.filter(enemy =>
            enemy.active && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= radius
        );
        const damage = this.damage * (
            this.upgradeLevel >= 2 ? SETTINGS.defenders.landmine.upgradeDamageMultiplier : 1
        );
        const x = this.x;
        const y = this.y;
        const scene = this.scene;
        let applied = false;

        const explode = () => {
            if (applied) return;
            applied = true;

            for (const enemy of targets) {
                if (enemy.active) enemy.takeDamage(damage);
            }

            const blast = scene.add.circle(x, y, radius, 0xffa329, 0.45).setDepth(7);
            scene.tweens.add({
                targets: blast, alpha: 0, scale: 1.2, duration: 220,
                onComplete: () => blast.destroy()
            });
        };

        if (!scene.events.emit("landmine-detonated", x, y, explode, this.displayWidth)) {
            explode();
        }
        this.destroy();
        return true;
    }

    override destroy(fromScene?: boolean): void {
        this.armingTimer?.remove(false);
        this.indicator?.destroy();
        super.destroy(fromScene);
    }

    //reposition landmine while keeping timer
    override repositionTo(x:number, y:number){
        super.repositionTo(x,y);
        this.indicator.setPosition(x,y-34);
    }
}
