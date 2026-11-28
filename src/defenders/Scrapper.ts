import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { CrusherEnemy } from "../enemies/CrusherEnemy.ts";
import { SETTINGS } from "../config/settings.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

/** Chomper-inspired close-range defender. */
export class Scrapper extends Defender {
    private recovering = false;
    private recoveryTimer?: Phaser.Time.TimerEvent;
    private statusIndicator: Phaser.GameObjects.Arc;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "scrapper");
        this.createAnimations(scene);
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (this.active) this.play("scrapper-idle");
        });
        this.setFlipX(true);
        this.play("scrapper-idle");
        this.setDisplaySize(70, 70);
        this.setDefenderHealth(SETTINGS.defenders.scrapper.health);
        this.statusIndicator = scene.add.circle(x, y - 43, 5, 0x24f59c).setDepth(5);
    }

    private createAnimations(scene: Phaser.Scene): void {
        if (scene.anims.exists("scrapper-idle")) return;

        scene.anims.create({
            key: "scrapper-idle",
            frames: scene.anims.generateFrameNumbers("scrapper", { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1,
        });
        scene.anims.create({
            key: "scrapper-bite",
            frames: scene.anims.generateFrameNumbers("scrapper", { start: 8, end: 12 }),
            frameRate: 14,
        });
        scene.anims.create({
            key: "scrapper-hurt",
            frames: scene.anims.generateFrameNumbers("scrapper", { start: 13, end: 16 }),
            frameRate: 14,
        });
        scene.anims.create({
            key: "scrapper-dead",
            frames: scene.anims.generateFrameNumbers("scrapper", { start: 17, end: 20 }),
            frameRate: 10,
        });
    }

    override takeDamage(amount: number): void {
        if (!this.active) return;

        super.takeDamage(amount);
        if (this.health <= 0) {
            const death = this.scene.add.sprite(this.x, this.y, "scrapper", 17);
            death.setDisplaySize(this.displayWidth, this.displayHeight);
            death.setDepth(this.depth);
            death.setFlipX(this.flipX);
            death.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => death.destroy());
            death.play("scrapper-dead");
            this.setVisible(false);
            this.statusIndicator.setVisible(false);
        } else if (amount > 0) {
            this.play("scrapper-hurt", true);
        }
    }

    tryBite(enemies: Enemy[]): boolean {
        if (!this.active || this.recovering) return false;

        // Enemies move right-to-left: only bite targets ahead of the Scrapper.
        const target = enemies
            .filter(enemy => enemy.active &&
                Math.abs(enemy.y - this.y) < SETTINGS.defenders.scrapper.biteLaneTolerance &&
                enemy.x >= this.x - SETTINGS.defenders.scrapper.biteBehindTolerance &&
                enemy.x <= this.x + SETTINGS.defenders.scrapper.biteRange)
            .sort((a, b) => a.x - b.x)[0];

        if (!target) return false;

        this.play("scrapper-bite");

        // Play the Scrapper's mechanical attack sound
        SoundManager.play(this.scene, "sfx_scrapper_attack");


        // Normal enemies are eliminated; Crushers only take heavy damage.
        let damage = target instanceof CrusherEnemy
            ? SETTINGS.defenders.scrapper.damage
            : target.health;

            // Level 2 upgrade against Crushers
            if (this.upgradeLevel >= 2 && target instanceof CrusherEnemy) {
                damage *= SETTINGS.defenders.scrapper.upgradeDamageMultiplier;
            }

            target.takeDamage(damage);


        this.recovering = true;
        this.statusIndicator.setFillStyle(0xffa52d);
        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1.12,
            scaleY: this.scaleY * 1.12,
            duration: 110,
            yoyo: true
        });
        const recoveryTime = this.upgradeLevel === 3
            ? SETTINGS.defenders.scrapper.recoveryMs * SETTINGS.defenders.scrapper.upgradedRecoveryMultiplier
            : SETTINGS.defenders.scrapper.recoveryMs;
        
        this.recoveryTimer = this.scene.time.delayedCall(
            recoveryTime, 
            () => {

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

    //reposition scrapper while keeping timer
    override repositionTo(x:number, y:number):void{
        super.repositionTo(x,y);
        this.statusIndicator.setPosition(x,y-43);
    }
}
