import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { SETTINGS } from "../config/settings.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

export class Landmine extends Defender {
    private armed = false;
    private armingTimer: Phaser.Time.TimerEvent;
    private indicator: Phaser.GameObjects.Arc;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "landmine");
        this.createAnimations(scene);
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "landmine-hurt", () => {
            if (this.active) this.play("landmine-idle");
        });
        this.play("landmine-idle");
        this.setDisplaySize(66, 66);
        this.setDefenderHealth(SETTINGS.defenders.landmine.health);
        this.damage = SETTINGS.defenders.landmine.damage;
        this.indicator = scene.add.circle(x, y - 34, 6, 0xff9b35).setDepth(5);
        this.armingTimer = scene.time.delayedCall(SETTINGS.defenders.landmine.armingMs, () => {
            if (!this.active) return;
            this.armed = true;
            this.indicator.setFillStyle(0x23ff8e);

            // Play a sound when the landmine is armed
            SoundManager.play(this.scene, "sfx_landmine_arm");

        });
    }

    private createAnimations(scene: Phaser.Scene): void {
        if (scene.anims.exists("landmine-idle")) return;

        scene.anims.create({
            key: "landmine-idle",
            frames: scene.anims.generateFrameNumbers("landmine", { start: 0, end: 12 }),
            frameRate: 8,
            repeat: -1,
        });
        scene.anims.create({
            key: "landmine-hurt",
            frames: scene.anims.generateFrameNumbers("landmine-hurt-sheet", { start: 0, end: 4 }),
            frameRate: 14,
        });
        scene.anims.create({
            key: "landmine-dead",
            frames: scene.anims.generateFrameNumbers("landmine-dead-sheet", { start: 0, end: 5 }),
            frameRate: 12,
        });
        scene.anims.create({
            key: "landmine-explosion",
            frames: scene.anims.generateFrameNumbers("landmine-explosion-sheet", { start: 11, end: 22 }),
            frameRate: 20,
        });
    }

    override takeDamage(amount: number): void {
        if (!this.active) return;

        super.takeDamage(amount);
        if (this.health <= 0) {
            this.playEndAnimation("landmine-dead-sheet", "landmine-dead", 0);
            this.setVisible(false);
            this.indicator.setVisible(false);
        } else if (amount > 0) {
            this.play("landmine-hurt", true);
        }
    }

    private playEndAnimation(texture: string, animation: string, firstFrame: number): void {
        const effect = this.scene.add.sprite(this.x, this.y, texture, firstFrame);
        effect.setDisplaySize(this.displayWidth, this.displayHeight);
        effect.setDepth(8);
        effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => effect.destroy());
        effect.play(animation);
    }

    tryDetonate(enemies: Enemy[]): boolean {
        if (!this.active || !this.armed) return false;
        const triggered = enemies.some(enemy => enemy.active &&
            Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), this.getBounds()));
        if (!triggered) return false;


        // Play explosion sound when an enemy triggers the mine
        SoundManager.play(this.scene, "sfx_landmine_explosion");

        // Level 3 increases the explosion radius by 50%
        const radius = this.upgradeLevel === 3
        
        ? SETTINGS.defenders.landmine.blastRadius * SETTINGS.defenders.landmine.upgradeRadiusMultiplier
        : SETTINGS.defenders.landmine.blastRadius;

        for (const enemy of enemies) {
            if (enemy.active && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= radius) {
                let damage = this.damage;

                // Level 2 damage upgrade
                if (this.upgradeLevel >= 2) {
                    damage *= SETTINGS.defenders.landmine.upgradeDamageMultiplier;
                }
                

                enemy.takeDamage(damage);
            }
        }
        const blast = this.scene.add.circle(this.x, this.y, radius, 0xffa329, 0.45).setDepth(7);
        this.scene.tweens.add({ targets: blast, alpha: 0, scale: 1.2, duration: 220,
            onComplete: () => blast.destroy() });
        this.playEndAnimation("landmine-explosion-sheet", "landmine-explosion", 11);
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
